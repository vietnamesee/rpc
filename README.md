# Long Is Me — Netlify Version

Discord Rich Presence Manager chạy trên Netlify.

---

## Deploy lên Netlify

### Cách 1: Netlify CLI (nhanh nhất)
```bash
npm install -g netlify-cli
cd long-is-me-netlify
npm install
netlify deploy --prod
```

### Cách 2: Netlify Drop (drag & drop)
1. Vào https://app.netlify.com/drop
2. Kéo thả **toàn bộ thư mục** `long-is-me-netlify` vào
3. Xong — Netlify tự detect `netlify.toml` và build

### Cách 3: GitHub + Netlify (auto-deploy)
1. Push thư mục lên GitHub repo
2. Vào https://app.netlify.com → "Add new site" → "Import from Git"
3. Chọn repo, build settings tự detect từ `netlify.toml`

---

## Giới hạn Netlify

| Tính năng | Trạng thái |
|-----------|------------|
| Login validate token | ✅ Hoạt động |
| Bật RPC | ✅ Hoạt động (tối đa **15 phút**) |
| RPC persistent 24/7 | ❌ Không hỗ trợ |
| Nhiều RPC cùng lúc | ✅ Hoạt động (mỗi lần tối đa 15 phút) |

> **Lý do giới hạn 15 phút:** Netlify Background Functions timeout sau 15 phút.
> Sau đó bấm "Bật RPC" lại để gia hạn thêm 15 phút.
> Muốn 24/7 → dùng bản Railway bên dưới.

---

## Fix Meta Quest Preset

App ID `1943547082600976384` trong preset cũ **không đảm bảo hoạt động** vì đây là app của người khác.

**Tạo App ID của bạn (5 phút):**
1. Vào https://discord.com/developers/applications
2. "New Application" → đặt tên `Meta Quest` (hoặc bất kỳ)
3. Copy **Application ID** từ trang Overview
4. (Tùy chọn) Vào "Rich Presence" → "Art Assets" → upload ảnh Meta Quest
5. Dán App ID vào field "App ID" khi dùng preset

---

## Self-host 24/7 trên Railway (free tier)

Railway chạy Node.js persistent — RPC không bao giờ die.

```bash
# 1. Cài Railway CLI
npm install -g @railway/cli

# 2. Dùng bản gốc (nova-rpc/), không phải netlify version
cd nova-rpc

# 3. Deploy
railway login
railway init
railway up

# 4. Lấy URL
railway open
```

Railway free tier: 500 giờ/tháng (~20 ngày). Đủ dùng cả tháng nếu không chạy 24/7.

---

## Cấu trúc

```
long-is-me-netlify/
├── netlify.toml                          ← routing config
├── package.json
├── netlify/functions/
│   ├── login.js                          ← POST /api/login (validate token)
│   └── start-background.js               ← POST /api/start-background (RPC 15 phút)
└── public/
    └── views/
        ├── index.html
        ├── login.html
        ├── dashboard.html
        └── rpc.html
```
