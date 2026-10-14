# API KKPhim / PhimAPI

Tài liệu gốc: <https://kkphim.com/api-document#tong-quan>

| | |
| --- | --- |
| Base URL | `https://phimapi.com` |
| CDN ảnh | `https://phimimg.com` (trả về trong `APP_DOMAIN_CDN_IMAGE`) |
| Phương thức | `GET` |
| Định dạng | JSON, UTF-8 |
| Xác thực | Không — không cần key hay header `Authorization` |

Mọi endpoint dưới đây được gọi từ máy chủ qua `client/src/lib/api.ts`. Ngoại lệ duy nhất là nguồn phát (m3u8 và URL embed) ở `client/src/components/Player.tsx` — URL đó được `<video>`/`<iframe>` nối thẳng từ máy người xem tới máy chủ phát.

```bash
curl --fail-with-body -H 'Accept: application/json' \
  'https://phimapi.com/v1/api/phim/so-ly'
```

## Endpoint

| Đường dẫn | Trả về |
| --- | --- |
| `/v1/api/home` | `data.items`, `data.itemsSportsVideos`, `data.params.pagination`, `APP_DOMAIN_CDN_IMAGE` |
| `/v1/api/danh-sach` | `data.items[]`, `data.params.pagination` |
| `/v1/api/danh-sach/{type}` | `type`: `phim-le` · `phim-bo` · `hoat-hinh` · `tv-shows` · `phim-chieu-rap` |
| `/v1/api/phim/{slug}` | `data.item`: `content`, `category`, `country`, `episodes`, `trailer_url`, `view` |
| `/v1/api/phim/{slug}/peoples` | `data.peoples[]`, `data.profile_sizes` |
| `/v1/api/phim/{slug}/keywords` | `data.keywords[]` |
| `/v1/api/the-loai` | `data.items[]`: `{ _id, name, slug }` |
| `/v1/api/quoc-gia` | `data.items[]`: `{ _id, name, slug }` |
| `/v1/api/nam-phat-hanh` | `data.items[]`: `{ year }`, 2026 → 1911, mới nhất trước |
| `/v1/api/the-loai/{slug}` | danh sách phim lọc theo thể loại |
| `/v1/api/quoc-gia/{slug}` | danh sách phim lọc theo quốc gia |
| `/v1/api/nam/{year}` | danh sách phim theo năm |
| `/v1/api/tim-kiem?keyword=` | danh sách phim tìm kiếm |

Chỉ dùng đường dẫn có `/v1/api/`. Endpoint cũ không có tiền tố này trả `{ status, msg, movie, episodes }` với `episodes` ở cấp ngoài.

## Tham số

Áp dụng cho các endpoint danh sách, lọc và tìm kiếm.

| Tham số | Kiểu | Ghi chú |
| --- | --- | --- |
| `page` | integer | Mặc định `1` |
| `limit` | integer | Chỉ `/v1/api/tim-kiem` tôn trọng |
| `category` | slug | `hanh-dong`, `tinh-cam`… |
| `country` | slug | `han-quoc`, `au-my`… |
| `year` | number | Có thể là dải `2014,2024` |
| `sort_field` | string | `modified.time` (mặc định), `_id`, `year` |
| `sort_type` | string | `desc`, `asc` |
| `sort_lang` | string | `vietsub`, `thuyet-minh`, `long-tieng` |

```text
/v1/api/danh-sach/phim-le?country=han-quoc&year=2024&sort_lang=vietsub
```

Slug danh mục lấy từ `/v1/api/the-loai` và `/v1/api/quoc-gia`, vì chúng thay đổi theo dữ liệu thực.

## Cấu trúc response

### Danh sách

```json
{
  "status": "success",
  "data": {
    "items": [],
    "params": {
      "pagination": {
        "totalItems": 30278,
        "totalItemsPerPage": 24,
        "currentPage": 1,
        "totalPages": 1262
      }
    },
    "APP_DOMAIN_CDN_IMAGE": "https://phimimg.com"
  }
}
```

### Chi tiết phim

Dữ liệu ở `data.item`; `episodes` nằm **trong** `data.item`.

### Danh sách tập

```json
"episodes": [{
  "server_name": "Vietsub",
  "server_data": [{
    "name": "Tập 01",
    "slug": "tap-01",
    "link_embed": "https://player.phimapi.com/player/?url=https://.../index.m3u8",
    "link_m3u8": "https://.../index.m3u8"
  }]
}]
```

`link_m3u8` là HLS. `link_embed` là iframe dựng sẵn, dùng khi HLS lỗi CORS.

## Trường dữ liệu

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `slug` | string | Dùng cho endpoint chi tiết |
| `name` | string | Tên tiếng Việt |
| `origin_name` | string | Tên gốc |
| `content` | string | Mô tả, dạng HTML |
| `type` | string | `single`, `series`, `hoathinh`, `tvshows` |
| `poster_url` | string \| null | Ảnh bìa dọc |
| `thumb_url` | string \| null | Ảnh ngang |
| `trailer_url` | string \| null | Link YouTube |
| `episode_current` | string | `"Tập 6"`, `"Full"`, `"Hoàn Tất (6/6)"` |
| `episode_total` | number | Chỉ ở endpoint chi tiết |
| `view` | number | Chỉ ở endpoint chi tiết |
| `quality` | string | `"FHD"`, `"HD"` |
| `lang` | string | `"Vietsub + Thuyết Minh"` |
| `lang_key` | string[] | `["vs"]`, `["vs","tm"]`, `["lt"]` |
| `year` | number | |
| `actor` / `director` | string[] | |
| `category` / `country` | { id, name, slug }[] | |
| `tmdb` / `imdb` | object | `id` là chuỗi; điểm `vote_average` có thể `null` |
| `modified.time` | ISO 8601 | Thời điểm cập nhật |

## Lưu ý khi tích hợp

- **Kiểm tra `res.ok` trước**, rồi mới đọc `data.status`. Body lỗi có format riêng: `{ "error": { "type": ..., "message": ... } }`.
- Một số endpoint trả `status: true` / `msg: "done"` thay cho `status: "success"`.
- **`limit` bị bỏ qua** ở endpoint danh sách: cố định 24 phim mỗi trang.
- **`/v1/api/home` không có `thumb_url`**, chỉ có `poster_url` dọc. Banner ngang phải lấy từ endpoint danh sách.
- **`view` chỉ có ở endpoint chi tiết**, nên không xếp hạng theo lượt xem từ endpoint danh sách được.
- **URL ảnh không nhất quán**: có thể là đường dẫn tương đối (`uploads/movies/...` hoặc `upload/vod/...`), hoặc URL tuyệt đối. Ghép đường dẫn tương đối vào `APP_DOMAIN_CDN_IMAGE`, **không** ghép vào API host.
- **Kiểu dữ liệu không ổn định**: `actor`, `director`, `alternative_names` có thể là chuỗi đơn thay vì mảng; `poster_url`, `thumb_url`, `trailer_url` có thể `null`; `episodes` có thể vắng.
- URL-encode mọi `slug`, `keyword` và tham số query. Không retry lỗi 4xx.
- Cache danh mục và ảnh; API công khai, không có SLA.

## Bản quyền

API có thể trả link embed/HLS từ máy chủ nội dung bên thứ ba. Không yêu cầu key không đồng nghĩa với việc nội dung được phép sao chép, lưu trữ hay phát lại. Kiểm tra điều khoản của nhà cung cấp trước khi đưa vào sản phẩm công khai.