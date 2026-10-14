# CoiHong

Web xem phim viết bằng **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind**, giao diện tối, dùng API công khai KKPhim / PhimAPI. Không cần backend, không cần API key, không cần đăng nhập.

<p align="center">
  <img src="docs/screenshots/home.jpeg" alt="Trang chủ CoiHong" width="880">
</p>

<p align="center">
  <img src="docs/screenshots/home-mobile.jpeg" alt="Trang chủ trên mobile" width="230">
  &nbsp;
  <img src="docs/screenshots/danh-sach.jpeg" alt="Trang danh sách phim" width="460">
  &nbsp;
  <img src="docs/screenshots/phim.jpeg" alt="Trang thông tin phim" width="460">
</p>

<p align="center">
  <img src="docs/screenshots/xem-phim.jpeg" alt="Trang xem phim" width="460">
  &nbsp;
  <img src="docs/screenshots/tim-kiem.jpeg" alt="Trang tìm kiếm" width="460">
  &nbsp;
  <img src="docs/screenshots/sidebar.jpeg" alt="Drawer danh mục" width="160">
</p>

## Tính năng

| Trang | Đường dẫn |
| --- | --- |
| Trang chủ: banner, Top 10, các nhóm phim theo loại và quốc gia | `/` |
| Phim đang nóng: xếp theo điểm đánh giá và độ cập nhật | `/hot` |
| Bảng xếp hạng Top phim: xếp theo thứ tự thêm mới | `/top-phim` |
| Danh sách phim, lọc và phân trang | `/danh-sach`, `/danh-sach/:type` |
| Theo thể loại / quốc gia / năm | `/the-loai/:slug`, `/quoc-gia/:slug`, `/nam/:year` |
| Tìm kiếm | `/tim-kiem?q=` |
| Thông tin phim | `/phim/:slug` |
| Xem phim: player và danh sách tập | `/xem-phim/:slug` |
| Yêu thích, lưu bằng localStorage | `/quan-tainh` |
| Giới thiệu / Liên hệ / Chính sách riêng tư / DMCA | `/gioi-thieu`, `/lien-he`, `/chinh-sach-rieng-tu`, `/dmca` |

**Player tự dựng**: tua có vùng đã tải, âm lượng, tốc độ 0.5–2x, hình trong hình, toàn màn hình, tự chuyển giữa nguồn HLS và Embed.
Phím tắt: `J`/`←` lùi 10 giây, `L`/`→` tiến 10 giây, `Space` phát/dừng, `F` toàn màn hình, `M` tắt tiếng, `I` hình trong hình, `0`–`9` đổi tốc độ.

**Nhớ tiến trình xem** bằng cookie `ch_progress` (90 ngày, 24 phim gần nhất).

## Chạy dự án

```bash
npm run setup     # cài dependencies vào client/
npm run dev       # http://localhost:3000
npm run build     # build production
npm run start     # chạy bản build, http://localhost:4173
```

Mọi lệnh chạy ở thư mục gốc đều chuyển tiếp vào `client/`.

## Cấu hình

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `API_BASE` | `https://phimapi.com` | Base URL của API. Chỉ dùng ở server. |
| `NEXT_PUBLIC_SITE_URL` | *(trống)* | Tuỳ chọn. Domain gốc cho og:image / canonical. Bỏ trống thì mọi thứ tự suy ra từ request. |

Dự án **không ghim domain nào**. Chạy bằng IP, localhost hay tên miền bất kỳ đều được; `sitemap.xml` và `robots.txt` luôn trỏ đúng về nơi đang phục vụ.

## Triển khai

### Docker

```bash
docker build -t coihong .
docker run -d -p 3000:3000 --name coihong coihong
```

Hoặc `docker compose up -d --build`.

### VPS

Build ở chế độ `standalone`, nên máy chủ **không cần `npm install`** — chỉ cần Node 18+.

```bash
npm run build
npm run pack          # gom thành dist/coihong
```

Gói kèm systemd unit, cấu hình nginx, file env và hướng dẫn trong `dist/coihong/README-deploy.md`.

Nếu chạy sau reverse proxy, cần chuyển tiếp `Host`, `X-Forwarded-Proto` và `X-Forwarded-Host`.

### Vercel

Đặt Root Directory là `client`, framework preset Next.js.

## Kiến trúc

```
client/src
├── app/               App Router
│   ├── page.tsx       trang chủ
│   ├── phim/[slug]/   thông tin phim
│   ├── xem-phim/      trang xem phim
│   ├── danh-sach/     danh sách + theo loại
│   ├── the-loai/      quoc-gia/  nam/[year]/
│   ├── quan-tainh/    yêu thích (client)
│   ├── tim-kiem/      tìm kiếm
│   ├── sitemap.ts     robots.ts
│   └── error.tsx      loading.tsx  not-found.tsx
├── components/        Layout, Navbar, Sidebar, Footer, PageBanner, Player,
│                      TopMovies, Row, PosterGrid, ListRail, MovieCard,
│                      InterestRow, LogoMarquee, Browse, BrowseView…
├── lib/               api.ts (server-only, fetch + ISR), site.ts, images.ts,
│                      labels.ts, catalog.ts, progress.ts
└── types.ts

client/deploy/          systemd, nginx, env cho VPS
scripts/                script build và kiểm thử bằng Chromium thật
```

Dữ liệu dựng sẵn ở máy chủ bằng ISR: trang chủ 5 phút, danh sách 3 phút, chi tiết phim 1 giờ, danh mục 24 giờ.

**Chỉ player gọi ra ngoài từ máy người dùng.** URL m3u8 và iframe embed nối thẳng từ trình duyệt tới máy chủ phát, băng thông video không đi qua máy chủ CoiHong.

## Kiểm thử

```bash
npm run build && npm run start     # cần server ở cổng 4173

npm run check:responsive           # tràn ngang ở nhiều kích thước màn hình
npm run check:cache               # cookie tiến trình
npm run check:marquee             # dải logo
npm run shot:docs                 # chụp lại ảnh docs/screenshots
```

Các script khác nằm trong `scripts/`, chạy bằng Chromium thật (`puppeteer-core` + Edge).

## API

Dùng KKPhim / PhimAPI, base mặc định `https://phimapi.com`, không cần key.

Đầy đủ danh sách endpoint, tham số và cấu trúc response: [`docs/API.md`](docs/API.md).

## Giấy phép và bản quyền

Mã nguồn dùng giấy phép [MIT](LICENSE).

Giấy phép này **chỉ phủ mã nguồn của dự án**. Dữ liệu phim và URL phát đến từ máy chủ của nhà cung cấp bên thứ ba và thuộc quyền sở hữu của chủ sở hữu tác phẩm — không nằm trong phạm vi MIT. CoiHong chỉ xây dựng giao diện.

Khiếu nại gỡ nội dung hoặc góp ý: Telegram [@namtran5905](https://t.me/namtran5905), hoặc xem trang `/dmca`.