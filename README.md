<div align="center">

# 🌱 Hạt — CCQ cho người mới

**Đầu tư bắt đầu từ một hạt nhỏ.**

Trang hướng dẫn + dashboard chứng chỉ quỹ mở Việt Nam dành cho người mới đầu tư.
Dữ liệu 64 quỹ từ [fmarket.vn](https://fmarket.vn) cập nhật hàng ngày.

[**🌐 Live**](https://hat-ccq.pages.dev) · [📚 Hướng dẫn](https://hat-ccq.pages.dev/bai-viet.html) · [📊 Dashboard](https://hat-ccq.pages.dev/quy.html) · [🧮 Tính lãi](https://hat-ccq.pages.dev/tinh-lai.html) · [🎯 Quiz](https://hat-ccq.pages.dev/quiz.html)

![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)
![CI](https://img.shields.io/badge/cron-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![Stack](https://img.shields.io/badge/stack-Vanilla%20HTML%2FJS-E34F26?logo=html5&logoColor=white)
![Hosting cost](https://img.shields.io/badge/hosting-%240%2Fmonth-success)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## 💡 Vì sao có project này

Đầu tư chứng chỉ quỹ là kênh **thân thiện nhất** cho người mới — chỉ từ 100.000đ, không cần biết phân tích cổ phiếu, không cần theo dõi bảng điện. Nhưng phần đông người mới gặp 2 vấn đề:

1. **Không biết bắt đầu từ đâu** — quá nhiều quỹ, quá nhiều thuật ngữ
2. **Không có nơi xem data tổng quan** — Fmarket app tốt nhưng phải đăng ký, không SEO-friendly để Google

**Hạt** giải quyết cả hai: trang web tĩnh, miễn phí, không cần đăng ký, có hướng dẫn từ A-Z và dashboard so sánh 64 quỹ live.

## ✨ Tính năng

- 🏠 **Landing page** với leaderboard top 5 quỹ live data, hero CTA, trust stats
- 📚 **7 bài pillar** ~6000 từ (CCQ là gì → Đầu tư 100k → DCA → 7 sai lầm phổ biến)
- 📊 **Dashboard 64 quỹ** filter/sort/search, click vào → trang chi tiết với Chart.js NAV history
- 🧮 **DCA Simulator** tính lãi kép realtime với 3 slider tương tác
- ⚖️ **So sánh quỹ** 2-3 quỹ side-by-side, NAV chart normalized về 100
- 🎯 **Quiz** 5 câu → recommend loại quỹ phù hợp + 3 mã cụ thể
- 🌙 **Dark premium theme** tối ưu cho đọc dài + screenshot social
- 📱 **Responsive** mobile-first
- ⏰ **Daily auto-update** qua GitHub Actions cron 07:00 ICT

## 🎯 Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Không build step, deploy thẳng, load < 100ms |
| Charts | Chart.js 4 (CDN) | Đủ cho line + tooltip + time axis |
| Crawler | Node 18+ native `fetch` | Không cần `axios`/`node-fetch` dependency |
| Data | [fmarket.vn](https://fmarket.vn) Public API | CORS mở, không auth, đủ field |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) | Free tier unlimited bandwidth, CDN nhanh ở VN |
| CI/CD | GitHub Actions cron | Free unlimited cho public repo |
| **Tổng chi phí** | **$0/tháng** | |

## 🏗 Kiến trúc

```text
                       ┌──────────────────────┐
                       │   api.fmarket.vn     │
                       │  (Public, CORS mở)   │
                       └──────────┬───────────┘
                                  │  POST /products/filter
                                  │  GET  /products/{id}
                                  │  POST /product/get-nav-history
                                  ▼
       ┌────────────────────────────────────────────────────┐
       │  GitHub Actions cron · 07:00 ICT daily             │
       │                                                    │
       │   crawler/crawl.js                                 │
       │     ├─ fetch list (64 funds)                       │
       │     ├─ fetch detail + NAV history (parallel)       │
       │     └─ write data/funds.json + details/ + nav/     │
       │                                                    │
       │   bot commit + git push                            │
       └────────────────────────┬───────────────────────────┘
                                │  webhook
                                ▼
                  ┌──────────────────────────────┐
                  │   Cloudflare Pages           │
                  │   https://hat-ccq.pages.dev  │
                  │   Auto deploy ~30s           │
                  └──────────────────────────────┘
                                │
                                ▼
                       👤  Người đọc / nhà đầu tư
```

## 📁 Cấu trúc thư mục

```text
hat-ccq/
├── index.html                    # Landing page
├── bai-viet.html                 # Article list
├── bai-viet/                     # 7 pillar articles
│   ├── ccq-la-gi.html
│   ├── dau-tu-100k-bat-dau.html
│   ├── quy-co-phieu-trai-phieu-can-bang.html
│   ├── huong-dan-dang-ky-fmarket.html
│   ├── top-5-quy-cho-nguoi-moi.html
│   ├── dca-chien-luoc-dau-tu-deu-dan.html
│   └── 7-sai-lam-khi-mua-ccq.html
├── quy.html                      # Dashboard 64 funds
├── fund.html                     # Fund detail page (Chart.js NAV)
├── tinh-lai.html                 # DCA simulator
├── so-sanh.html                  # Compare 2-3 funds
├── quiz.html                     # 5-question recommender
├── partials.js                   # Shared nav + footer + floating CTA
├── styles.css                    # Dark premium theme (~1500 lines)
├── app.js, fund.js               # Dashboard + detail page logic
├── logo.svg                      # Brand logo (favicon)
├── crawler/
│   └── crawl.js                  # Node fetch → /data
├── data/
│   ├── funds.json                # Bundled list (60KB)
│   ├── details/{CODE}.json       # Per-fund detail × 64
│   ├── nav-history/{CODE}.json   # NAV time-series × 64
│   └── snapshot-YYYY-MM-DD.json  # Daily archive
└── .github/workflows/crawl.yml   # Cron 07:00 ICT
```

## 🚀 Quick start

**Prerequisites**: Node.js 18+ (cần native `fetch`)

```bash
git clone https://github.com/huyhn-ba-po/hat-ccq.git
cd hat-ccq

npm run crawl       # Crawl fmarket → /data  (~15 giây, 64 quỹ)
npm run dev         # Serve http://localhost:8080
```

## 🛰 Deployment

Tổng setup ~5 phút, hoàn toàn miễn phí.

### 1. Fork & push lên GitHub

```bash
gh repo create my-fund-site --public --source=. --push
```

### 2. Connect Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Chọn repo vừa tạo
3. Build settings:
   - Framework preset: **None**
   - Build command: *(empty)*
   - Build output directory: `/`
4. **Save and Deploy** → 30 giây sau có URL `<name>.pages.dev`

### 3. Bật cron daily (tuỳ chọn)

File `.github/workflows/crawl.yml` đã có sẵn. Vào tab **Actions** trên GitHub repo, enable workflow. Cron sẽ chạy 07:00 ICT mỗi ngày → commit data mới → CF Pages tự redeploy.

## 📊 Data API reference

Dữ liệu lấy từ fmarket.vn Public API. CORS mở, không cần auth.

| Endpoint | Method | Trả về |
|---|---|---|
| `api.fmarket.vn/res/products/filter` | POST | Danh sách quỹ (filter theo type/asset/issuer) |
| `api.fmarket.vn/res/products/{id}` | GET | Chi tiết 1 quỹ (top holdings, ngành, asset, phí) |
| `api.fmarket.vn/res/product/get-nav-history` | POST | Lịch sử NAV (cần `fromDate`/`toDate` YYYY-MM-DD) |

API endpoints + schema được reverse-engineer từ source code [vnstock](https://github.com/thinh-vu/vnstock).

### Field map cho mỗi quỹ

- **Basic**: `code`, `name`, `owner.shortName`, `fundType`, `dataFundAssetType`, `nav`, `riskLevel`, `websiteURL`
- **Performance**: `productNavChange.{navTo1Months, 3M, 6M, 12M, 24M, 36M, 60M, navToBeginning, annualizedReturn36Months}`
- **Holdings**: `productTopHoldingList`, `productIndustriesHoldingList`, `productAssetHoldingList`
- **Fees**: `managementFee`, `productFeeList` (BUY/SELL theo bậc volume), `buyMinValue`, `sellMin`, `completeTransactionDuration`

Asset codes: `STOCK` (cổ phiếu), `BOND` (trái phiếu), `BALANCED` (cân bằng).

## 🎨 Brand

| | |
|---|---|
| **Tên** | Hạt |
| **Tagline** | Đầu tư bắt đầu từ một hạt nhỏ |
| **Concept** | Gieo hạt nhỏ → gặt rừng vốn (ẩn dụ DCA tích lũy dài hạn) |
| **Palette** | `#7aa2ff` blue · `#38d6c2` mint · `#f5c451` gold · `#07090d` dark |
| **Logo** | Hạt vàng + 2 lá xanh-mint, nền gradient blue→mint, bo tròn |
| **Font** | Inter 400/500/600/700/800 |

## 🛣 Roadmap

**Đã làm:**

- [x] Landing page với leaderboard live + trust stats
- [x] 7 bài pillar ~6000 từ
- [x] Dashboard 64 quỹ filter/sort/search
- [x] Trang chi tiết quỹ với Chart.js NAV history
- [x] DCA simulator
- [x] So sánh 2-3 quỹ với NAV chart normalized
- [x] Quiz recommender 5 câu
- [x] GitHub Actions cron daily
- [x] Deploy Cloudflare Pages

**Còn lại:**

- [ ] OG image (1200×630) cho Facebook share preview
- [ ] Apple touch icon PNG 180×180
- [ ] `sitemap.xml` + `robots.txt` + Google Search Console
- [ ] Custom domain (`hat.vn` hoặc `hatccq.com`)
- [ ] Bài phân tích chuyên sâu từng quỹ (1 bài / 1 mã)
- [ ] So sánh CCQ vs các kênh khác (tiết kiệm, vàng, BĐS, ETF)
- [ ] Bài về thuế trên lãi CCQ + quỹ hưu trí bổ sung
- [ ] Newsletter subscription
- [ ] Comments / discussion ở mỗi bài

## 🤝 Đóng góp

Issue / PR / ý tưởng đều welcome — đặc biệt nếu bạn:

- Viết content (bài hướng dẫn mới, phân tích quỹ chuyên sâu)
- Có ý tưởng UX cho người mới đầu tư
- Tìm thấy bug hoặc số liệu sai
- Translate sang tiếng Anh / Trung / Khmer

Code style: vanilla HTML/CSS/JS, không thêm framework. Mọi tính năng mới phải hoạt động trên Cloudflare Pages free tier (không server-side rendering, không database).

## ⚠️ Disclaimer

Trang này dành cho mục đích **giáo dục và tham khảo**, **không phải tư vấn đầu tư**. Quyết định đầu tư là của bạn — hãy đọc bản cáo bạch trên Fmarket và tham khảo cố vấn tài chính chuyên nghiệp nếu cần.

Dữ liệu lấy từ fmarket.vn, có thể có sai sót hoặc trễ. **Hiệu suất quá khứ không đảm bảo lợi nhuận tương lai.** Đầu tư có rủi ro, bạn có thể mất một phần hoặc toàn bộ vốn.

Mã giới thiệu `007F326665339` là affiliate code — khi bạn đăng ký Fmarket bằng mã này, cả bạn và chủ trang đều nhận ưu đãi từ Fmarket theo chương trình giới thiệu của họ. Việc dùng mã hay không không ảnh hưởng đến chất lượng dịch vụ Fmarket cung cấp cho bạn.

## 📜 Credits

- **Data**: [fmarket.vn](https://fmarket.vn) Public API
- **API mapping reference**: [vnstock](https://github.com/thinh-vu/vnstock) by [Thinh Vu](https://github.com/thinh-vu)
- **Charts**: [Chart.js](https://www.chartjs.org/) + [chartjs-adapter-date-fns](https://github.com/chartjs/chartjs-adapter-date-fns)
- **Fonts**: [Inter](https://rsms.me/inter/) by Rasmus Andersson
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com)

## 📄 License

[MIT](LICENSE) © 2026 — Tự do fork, tự do thương mại, tự do thay đổi.

---

<div align="center">

**Bắt đầu đầu tư chứng chỉ quỹ chỉ từ 100.000đ.**

[**Mở tài khoản Fmarket →**](https://fmarket.vn) · Mã giới thiệu: `007F326665339`

</div>
