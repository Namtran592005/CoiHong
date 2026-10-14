# CoiHong — hướng dẫn triển khai

Bản dịch sẵn cho VPS, chỉ cần Node 18+. Không cần `npm ci`.

**Không cần cấu hình domain.** Ứng dụng tự suy ra domain từ request, nên chạy bằng IP, localhost hay tên miền đều được.

## 1. Chuyển lên máy chủ

```sh
scp -r coihong user@may-chu:/tmp/
ssh user@may-chu
sudo mkdir -p /opt && sudo mv /tmp/coihong /opt
sudo chown -R coihong:coihong /opt/coihong
```

## 2. Biến môi trường

```sh
sudo cp /opt/coihong/deploy/coihong.env /etc/coihong.env
sudo chmod 640 /etc/coihong.env
```

`API_BASE` đã có sẵn giá trị mặc định. `NEXT_PUBLIC_SITE_URL` để trống là được — chỉ khai khi muốn og:image trỏ về một tên miền cụ thể.

## 3. User chạy

```sh
sudo useradd --system --no-create-home --shell /usr/sbin/nologin coihong
```

## 4. systemd

```sh
sudo cp /opt/coihong/deploy/coihong.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now coihong
curl -I http://127.0.0.1:3000        # phải trả 200
```

## 5. nginx

Cấu hình đi kèm bắt nghe mọi tên miền nên cài được ngay:

```sh
sudo cp /opt/coihong/deploy/nginx-coihong.conf /etc/nginx/sites-available/coihong
sudo ln -s /etc/nginx/sites-available/coihong /etc/nginx/sites-enabled/
```

Mặc định khối `listen 443` trỏ tới chứng thư chưa có. Nếu chỉ chạy HTTP thì bỏ hẳn khối đó và bỏ dòng `return 301 https://...` ở khối 80:

```sh
sudo certbot --nginx -d ten-mien-cua-ban   # nếu muốn HTTPS
```

Sau khi có domain thật, thay `_` bằng tên miền ở cả hai khối server.

## Cập nhật

```sh
sudo systemctl stop coihong
# ... chép thư mục .next/standalone và .next/static mới ...
sudo systemctl start coihong
```

## Ghi chú

- Reverse proxy phải chuyển tiếp `Host`, `X-Forwarded-Proto` và `X-Forwarded-Host`. Thiếu thì `sitemap.xml` trỏ về `127.0.0.1`. File nginx kèm theo đã đặt sẵn.
- Cache ISR nằm trong bộ nhớ, nên mỗi lần restart là các trang đang cache sẽ gọi lại API. Đây là hành vi bình thường.
- Log: `journalctl -u coihong -f`