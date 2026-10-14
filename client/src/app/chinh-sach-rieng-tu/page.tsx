import type { Metadata } from 'next'
import StaticPage, { Section } from '@/components/StaticPage'

export const metadata: Metadata = {
  title: 'Chính sách riêng tư',
  description: 'CoiHong không thu thập dữ liệu cá nhân. Xem những gì được lưu trên máy của bạn.',
  alternates: { canonical: '/chinh-sach-rieng-tu' },
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Chính sách riêng tư"
      lead="CoiHong cố gắng thu thập càng ít dữ liệu cá nhân càng tốt. Trang không yêu cầu đăng nhập và không bán thông tin cho bên thứ ba."
    >
      <Section heading="Dữ liệu CoiHong thu thập">
        <p>
          CoiHong không có tài khoản người dùng và không thu thập họ tên, email hay số điện thoại.
          Vì không có cơ sở để nhận diện bạn, chúng tôi cũng không cố gắng dựng lại hồ sơ cá nhân.
        </p>
        <p>Các dữ liệu duy nhất được lưu trên chính thiết bị của bạn:</p>
        <ul className="space-y-2.5">
          {[
            [
              'Cookie tiến trình xem (ch_progress)',
              'Ghi nhớ bạn đã xem tới giây thứ bao nhiêu của tập nào, để lần sau mở có thể gợi ý “Xem tiếp”. Xoá được bằng nút “Từ đầu” hoặc xoá cookie của trang.',
            ],
            [
              'Danh sách yêu thích',
              'Lưu trong bộ nhớ cục bộ của trình duyệt, không gửi lên máy chủ. Xoá được trong trang Yêu thích.',
            ],
          ].map(([title, desc]) => (
            <li key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">{desc}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Bộ nhớ đệm">
        <p>
          Trang không đặt cookie quảng cáo hay cookie theo dõi. Ảnh bìa được xử lý và lưu đệm ở
          máy chủ theo cơ chế cache của HTTP, nên lần mở sau gần như không phải tải lại từ CDN
          gốc. Trình duyệt của bạn vẫn giữ bản sao nhỏ các tài nguyên tĩnh theo cơ chế cache
          thông thường của mọi website; dữ liệu này nằm trên máy bạn và bị xoá khi bạn xoá dữ
          liệu trình duyệt.
        </p>
      </Section>

      <Section heading="Dịch vụ bên thứ ba">
        <p>
          Ảnh bìa phim và dữ liệu danh mục được tải từ máy chủ CDN và API của nhà cung cấp nội
          dung. Máy chủ đó nhận địa chỉ IP và loại trình duyệt của bạn qua các yêu cầu HTTP thông
          thường, theo chính sách riêng của họ.
        </p>
        <p>
          Khi bạn xem phim, yêu cầu phát video đi thẳng từ máy của bạn tới máy chủ phát bên thứ
          ba — CoiHong không nhận và không chuyển tiếp dữ liệu video này.
        </p>
        <p>
          Trang không nhúng quảng cáo, không chèn mã theo dõi của mạng quảng cáo và không bán hành
          vi người dùng cho bên thứ ba.
        </p>
      </Section>

      <Section heading="Quyền của bạn">
        <ul className="space-y-2.5">
          {[
            'Xoá toàn bộ dữ liệu cục bộ: xoá cookie của trang CoiHong trong cài đặt trình duyệt, hoặc xoá “Dữ liệu trang web” cho tên miền của trang.',
            'Rút lại dữ liệu danh sách yêu thích: xoá từng phim trong trang Yêu thích, hoặc xoá cả danh sách nếu muốn.',
            'Không chấp nhận cookie: nếu trình duyệt chặn cookie, mọi chức năng vẫn dùng được, chỉ mất tính năng gợi ý “Xem tiếp”.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Trẻ em">
        <p>
          Trang không cố ý thu thập dữ liệu của trẻ em và không có tính năng theo dõi người dùng
          theo tài khoản. Vì không thu thập dữ liệu cá nhân, chúng tôi không biết người truy cập
          bao nhiêu tuổi.
        </p>
      </Section>

      <Section heading="Thay đổi chính sách">
        <p>
          Nội dung chính sách có thể được cập nhật khi có thay đổi về tính năng hoặc dịch vụ bên
          thứ ba. Nội dung trên trang này luôn là phiên bản đang áp dụng.
        </p>
        <p>
          Câu hỏi về chính sách riêng tư: nhắn Telegram{' '}
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
