import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPage, { Section } from '@/components/StaticPage'

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description: 'CoiHong là giao diện xem phim miễn phí, gọn và nhanh, mở tốt trên điện thoại lẫn máy tính.',
  alternates: { canonical: '/gioi-thieu' },
}

export default function AboutPage() {
  return (
    <StaticPage
      title="Giới thiệu"
      lead="CoiHong là nơi tổng hợp phim lẻ, phim bộ, hoạt hình và TV Show, cập nhật hằng ngày với giao diện tối tối giản, mở nhanh trên điện thoại lẫn máy tính."
    >
      <Section heading="CoiHong là gì?">
        <p>
          CoiHong là một giao diện xem phim trên web. Toàn bộ dữ liệu phim — tên phim, ảnh bìa,
          diễn viên, mô tả, danh sách tập và nguồn phát — được lấy từ API công khai của nhà cung
          cấp nội dung. Trang không lưu trữ hay tải lên bất kỳ tập phim nào.
        </p>
        <p>
          Mục tiêu của dự án là tạo một giao diện xem phim sạch, nhẹ và dễ dùng: nạp nhanh, tìm
          kiếm tức thì, xem liên tục không bị gián đoạn và hoạt động tốt trên cả màn hình nhỏ.
        </p>
      </Section>

      <Section heading="Những gì CoiHong có">
        <ul className="space-y-2.5">
          {[
            'Trang chủ gồm banner khuyến nghị, bảng xếp hạng Top 10 và các hàng phim theo loại, thể loại, quốc gia.',
            'Lọc theo thể loại, quốc gia, năm phát hành và ngôn ngữ phụ đề; sắp xếp theo mới cập nhật, năm hoặc xếp hạng.',
            'Tìm kiếm theo tên phim, tên diễn viên, đạo diễn và từ khóa.',
            'Trang xem phim riêng với phím tắt tua nhanh, đổi tốc độ, hình trong hình và nhớ tiến trình xem.',
            'Danh sách yêu thích lưu ngay trên trình duyệt, không cần đăng nhập.',
            'Dữ liệu được dựng sẵn ở máy chủ và ghi đệm, nên mở trang lần sau gần như tức thì.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Cách sử dụng">
        <p>Phím tắt khi đang xem phim:</p>
        <ul className="space-y-2">
          {[
            ['J hoặc phím mũi tên trái', 'Lùi 10 giây'],
            ['L hoặc phím mũi tên phải', 'Tiến 10 giây'],
            ['Space', 'Tạm dừng hoặc tiếp tục'],
            ['F', 'Bật hoặc thoát toàn màn hình'],
            ['M', 'Tắt hoặc mở tiếng'],
            ['I', 'Hình trong hình'],
            ['Các phím số', 'Đổi tốc độ phát'],
          ].map(([k, v]) => (
            <li key={k} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <kbd className="rounded-md border border-white/12 bg-white/[0.06] px-2 py-0.5 font-mono text-[11.5px] text-ink">
                {k}
              </kbd>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Lưu ý về nội dung">
        <p>
          CoiHong không đăng ký, không bán và không cung cấp bất kỳ nội dung nào của mình. Chúng tôi
          chỉ xây dựng giao diện và chuyển tới nguồn phát mà API công khai cung cấp. Toàn bộ hình
          ảnh, tên phim và bản ghi thuộc quyền sở hữu của nhà sản xuất và các bên liên quan.
        </p>
        <p>
          Nếu bạn là chủ sở hữu nội dung và muốn gỡ bỏ tác phẩm khỏi trang, vui lòng xem{' '}
          <Link href="/dmca" className="text-accent transition-colors hover:text-accent-soft">
            kênh báo cáo DMCA
          </Link>
          . Mọi liên hệ khác đều qua Telegram{' '}
          <a
            href="https://t.me/namtran5905"
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent transition-colors hover:text-accent-soft"
          >
            @namtran5905
          </a>
          .
        </p>
      </Section>
    </StaticPage>
  )
}
