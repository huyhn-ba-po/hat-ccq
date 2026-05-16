# Hạt — CCQ cho người mới

> **Đầu tư bắt đầu từ một hạt nhỏ.**

Trang web hướng dẫn + dashboard chứng chỉ quỹ Việt Nam cho người mới đầu tư, kết hợp affiliate program của fmarket.vn.

**Brand**: Hạt — concept "gieo hạt nhỏ, gặt rừng vốn" (DCA growing wealth).
**Logo**: `logo.svg` — hạt vàng + mầm xanh-mint trên nền gradient blue-mint.
**Color palette**: accent `#7aa2ff` (blue) · accent-2 `#38d6c2` (mint) · gold `#f5c451` (seed).

**Live**: chạy `npm run dev` → <http://localhost:8080>
**Mã giới thiệu Fmarket**: `007F326665339`

## Cấu trúc

```text
ChungChiQuy/
├── index.html               # Landing: hero + featured articles + top funds
├── bai-viet.html            # Liệt kê tất cả bài hướng dẫn
├── bai-viet/                # 7 bài pillar
│   ├── ccq-la-gi.html
│   ├── dau-tu-100k-bat-dau.html
│   ├── quy-co-phieu-trai-phieu-can-bang.html
│   ├── huong-dan-dang-ky-fmarket.html
│   ├── top-5-quy-cho-nguoi-moi.html
│   ├── dca-chien-luoc-dau-tu-deu-dan.html
│   └── 7-sai-lam-khi-mua-ccq.html
├── quy.html                 # Dashboard 64 quỹ
├── fund.html                # Chi tiết 1 quỹ (Chart.js NAV history)
├── tinh-lai.html            # DCA simulator
├── so-sanh.html             # So sánh 2–3 quỹ side-by-side
├── quiz.html                # Quiz 5 câu — gợi ý loại quỹ
├── partials.js              # Nav + floating CTA + footer shared
├── styles.css               # Dark premium theme
├── app.js, fund.js          # Dashboard + detail logic
├── crawler/crawl.js         # Node fetch fmarket API → /data
├── data/
│   ├── funds.json           # Bundled list (cho landing + dashboard)
│   ├── details/{CODE}.json
│   ├── nav-history/{CODE}.json
│   └── snapshot-YYYY-MM-DD.json
└── .github/workflows/crawl.yml  # Daily cron 07:00 ICT
```

## Tính năng

- **Landing** với hero, referral CTA, 3 bài featured, top 3 quỹ live từ data
- **7 bài pillar** ~800–1000 từ/bài, từ "CCQ là gì" → "đầu tư 100k" → "DCA" → "7 sai lầm"
- **Dashboard 64 quỹ** filter/sort/search (đã có sẵn)
- **DCA simulator** với Chart.js — slider số tiền/thời gian/lãi suất, animate realtime
- **So sánh 2–3 quỹ** với NAV chart normalized về 100
- **Quiz 5 câu** scoring → recommend 1 trong 3 loại + 3 quỹ cụ thể, link sang so-sanh
- **Floating CTA** mã giới thiệu — copy 1 click
- **Daily auto-update** qua GitHub Actions cron

## Chạy local

```bash
node crawler/crawl.js    # crawl mới (~15s)
npm run dev              # http://localhost:8080
```

## Deploy

1. Push lên GitHub
2. Settings → Pages → Source: **GitHub Actions**
3. Workflow `.github/workflows/crawl.yml` tự chạy 07:00 ICT mỗi ngày, commit data + deploy

## Content strategy

Tone: chuyên nghiệp nhưng dễ tiếp cận. Xưng "bạn", không patronize. Mỗi bài có CTA mã GT ở cuối + 1-2 link tới bài kế tiếp để giữ session.

7 bài hiện tại cover được toàn bộ journey "newbie → đang DCA đều đặn". Có thể thêm:

- Phân tích sâu từng quỹ riêng (1 bài / 1 quỹ)
- So sánh CCQ vs gửi tiết kiệm vs vàng vs BĐS
- Thuế trên lãi CCQ
- Quỹ ETF vs quỹ mở
- Quỹ hưu trí bổ sung (PVN, retirement funds)

## Lưu ý kỹ thuật

- `partials.js` auto-detect `/bai-viet/` để prefix `../` cho asset paths
- Quiz pre-fill so-sanh qua query param `?codes=A,B,C`
- Chart.js + adapter date-fns load qua CDN (compare page)
- Floating CTA inject vào `<body>` cuối, fixed position
