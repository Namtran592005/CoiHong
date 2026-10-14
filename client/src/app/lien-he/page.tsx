import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPage, { Section } from '@/components/StaticPage'
import { AlertTriangle, Bug, Film, MessageCircle, ShieldCheck, Send } from '@/components/Icons'

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Gửi góp ý, báo lỗi kỹ thuật hoặc yêu cầu gỡ bản quyền cho CoiHong qua Telegram.',
  alternates: { canonical: '/lien-he' },
}

const TELEGRAM = 'https://t.me/namtran5905'
const HANDLE = '@namtran5905'

const CHANNELS = [
  {
    icon: Bug,
    title: 'Báo lỗi kỹ thuật',
    desc: 'Phim không phát, tập bị lỗi, giao diện vỡ trên máy của bạn.',
  },
  {
    icon: Film,
    title: 'Đề xuất phim',
    desc: 'Muốn thấy thể loại hoặc quốc gia nào có trong danh mục.',
  },
  {
    icon: ShieldCheck,
    title: 'Khiếu nại bản quyền',
    desc: 'Yêu cầu gỡ nội dung, xem tại trang DMCA để biết đầy đủ thông tin.',
  },
]

export default function ContactPage() {
  return (
    <StaticPage
      title="Liên hệ"
      lead="Mọi góp ý về nội dung, báo lỗi hay yêu cầu gỡ bản quyền đều nhận qua Telegram. Chọn đúng nhóm nội dung bên dưới để thông tin tới đúng người xử lý."
    >
      <Section heading="Kênh liên hệ">
        <a
          href={TELEGRAM}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-sky-400/40 hover:bg-white/[0.06]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-300 transition-transform duration-300 group-hover:scale-105">
            <Send className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-ink">{HANDLE}</span>
            <span className="block text-[13px] text-ink-faint">Telegram — mở trong ứng dụng</span>
          </span>
        </a>
      </Section>

      <Section heading="Gửi theo nhóm nào?">
        <p>
          Mở cuộc trò chuyện trên Telegram và ghi rõ nội dung thuộc nhóm nào, kèm đường dẫn
          trang đang gặp lỗi.
        </p>
        <ul className="space-y-3">
          {CHANNELS.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/[0.12] text-accent">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-faint">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Khi gửi yêu cầu, nên có">
        <ul className="space-y-2.5">
          {[
            'Đường dẫn đầy đủ của trang, ví dụ /phim/ten-phim hoặc /xem-phim/ten-phim.',
            'Tên phim và tập đang gặp lỗi, kèm số tập nếu phim nhiều tập.',
            'Trình duyệt và thiết bị bạn dùng, ví dụ Edge trên điện thoại Android.',
            'Ảnh chụp màn hình lỗi nếu có — mô tả bằng chữ vẫn giúp ích.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Thời gian phản hồi">
        <p>
          Các góp ý về nội dung và danh mục thường được xem lại hằng tuần. Yêu cầu liên quan đến
          bản quyền được ưu tiên xử lý vì liên quan đến quyền của chủ sở hữu tác phẩm.
        </p>
        <p className="flex items-start gap-2 text-ink-faint">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          CoiHong là dự án mã nguồn mở, không có đội ngũ trực trực. Vì vậy thời gian phản hồi có
          thể chậm hơn mong đợi.
        </p>
      </Section>

      <Section heading="Liên kết khác">
        <ul className="space-y-2.5">
          {[
            { icon: MessageCircle, label: 'Theo dõi danh mục mới', to: '/danh-sach' },
            { icon: ShieldCheck, label: 'Chính sách bản quyền (DMCA)', to: '/dmca' },
            { icon: MessageCircle, label: 'Chính sách riêng tư', to: '/chinh-sach-rieng-tu' },
          ].map((item) => (
            <li key={item.label}>
              <Link
                href={item.to}
                className="inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-soft"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </StaticPage>
  )
}
