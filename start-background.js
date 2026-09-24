// netlify/functions/start-background.js
// [Netlify Background Function — Node 18 — up to 15 phút]
// POST /api/start-background — khởi RPC và giữ sống trong background
// Background functions: timeout 15 phút, không return response tức thì
// Client nhận 202 Accepted ngay lập tức, RPC chạy trong background

const { Client, RichPresence } = require('discord.js-selfbot-v13');

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return; // background function — không return gì sau 202
  }

  const { token, config } = body;
  if (!token || !config?.appId || !config?.name) return;

  const client = new Client({ checkUpdate: false });

  await new Promise((resolve) => {
    client.once('ready', async () => {
      await setRPC(client, config);

      // Giữ alive — refresh RPC mỗi 4 phút (Discord drop presence sau 5 phút idle)
      const interval = setInterval(async () => {
        if (!client.isReady()) { clearInterval(interval); resolve(); return; }
        await setRPC(client, config);
      }, 4 * 60 * 1000);

      // Netlify background function tối đa 15 phút
      setTimeout(() => {
        clearInterval(interval);
        client.destroy();
        resolve();
      }, 14 * 60 * 1000);
    });

    client.on('error', () => { client.destroy(); resolve(); });
    client.login(token).catch(() => resolve());
  });
};

async function setRPC(client, config) {
  try {
    const rpc = new RichPresence(client)
      .setApplicationId(config.appId)
      .setType(config.type || 'PLAYING')
      .setName(config.name);

    if (config.details) rpc.setDetails(config.details);
    if (config.state) rpc.setState(config.state);
    if (config.smallText) rpc.setAssetsSmallText(config.smallText);
    if (config.largeText) rpc.setAssetsLargeText(config.largeText);

    const externalImages = [];

    if (config.largeImage) {
      if (config.largeImage.startsWith('http')) externalImages.push(config.largeImage);
      else rpc.setAssetsLargeImage(config.largeImage);
    }
    if (config.smallImage) {
      if (config.smallImage.startsWith('http')) externalImages.push(config.smallImage);
      else rpc.setAssetsSmallImage(config.smallImage);
    }

    if (externalImages.length > 0) {
      const uploaded = await rpc.setExternalAssets(externalImages);
      let idx = 0;
      if (config.largeImage?.startsWith('http')) {
        if (uploaded[idx]) rpc.setAssetsLargeImage('mp:' + uploaded[idx].external_asset_path);
        idx++;
      }
      if (config.smallImage?.startsWith('http')) {
        if (uploaded[idx]) rpc.setAssetsSmallImage('mp:' + uploaded[idx].external_asset_path);
      }
    }

    if (config.startTimestamp) rpc.setStartTimestamp(config.startTimestamp);

    if (Array.isArray(config.buttons)) {
      config.buttons.forEach(btn => {
        if (btn.label && btn.url) rpc.addButton(btn.label, btn.url);
      });
    }

    client.user.setPresence({
      activities: [rpc],
      status: config.status || 'online'
    });
  } catch (err) {
    console.error('setRPC error:', err.message);
  }
}
