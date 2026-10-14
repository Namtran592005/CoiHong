import type { Metadata } from 'next'
import Link from 'next/link'
import StaticPage, { Section } from '@/components/StaticPage'
import { AlertTriangle, CheckCircle2, Send, ShieldCheck } from '@/components/Icons'

export const metadata: Metadata = {
  title: 'DMCA và gỡ nội dung',
  description: 'Cách gửi khiếu nại bản quyền và yêu cầu gỡ nội dung khỏi CoiHong.',
  alternates: { canonical: '/dmca' },
}

export default function DmcaPage() {
  return (
    <StaticPage
      title="DMCA và gỡ nội dung"
      lead="CoiHong tôn trọng quyền tác giả. Nếu bạn là chủ sở hữu bản quyền và muốn gỡ một tác phẩm, hãy gửi khiếu nại — chúng tôi xử lý trong thời gian sớm nhất có thể."
    >
      <Section heading="Vai trò của CoiHong">
        <p>
          CoiHong không sản xuất, không tải lên và không lưu trữ bất kỳ nội dung nào. Toàn bộ dữ
          liệu phim và nguồn phát đến từ API công khai của nhà cung cấp nội dung bên thứ ba, và mọi
          request phát nội dung đi thẳng từ máy của người xem tới máy chủ phát bên thứ ba. Điều này
          không miễn trừ chúng tôi khỏi trách nhiệm trước các yêu cầu gỡ nội dung hợp pháp.
        </p>
        <p>
          Khi nhận được khiếu nại hợp lệ, chúng tôi sẽ gỡ đường dẫn tương ứng khỏi trang và ngừng
          hiển thị tác phẩm đó trên mọi nền tảng.
        </p>
      </Section>

      <Section heading="Cách gửi khiếu nại">
        <p>Gửi tin nhắn qua Telegram kèm đầy đủ các mục dưới đây:</p>
        <ol className="list-decimal space-y-2 pl-5">
          {[
            'Tên pháp nhân hoặc tên tổ chức của bạn, kèm địa chỉ liên hệ và số điện thoại.',
            'Danh sách các tác phẩm bị vi phạm, kèm đường dẫn cụ thể trên CoiHong, ví dụ https://ten-mien-cua-ban/phim/ten-phim.',
            'Mô tả nội dung và vị trí vi phạm trong tác phẩm (thời điểm, tập, cảnh).',
            'Thông tin liên hệ của bạn để chúng tôi xác minh.',
            'Cam kết rằng thông tin trong yêu cầu là chính xác và bạn có quyền hành động với tư cách chủ sở hữu hoặc đại diện cho chủ sở hữu.',
            'Chữ ký số của bạn.',
          ].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p className="flex items-center gap-2 text-ink">
          <Send className="h-4 w-4 shrink-0 text-sky-300" />
          <a
            href="https://t.me/namtran5905"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-accent transition-colors hover:text-accent-soft"
          >
            Telegram @namtran5905
          </a>
          <span className="text-[13px] text-ink-faint">(ghi rõ chủ thể là DMCA takedown request)</span>
        </p>
      </Section>

      <Section heading="Điều chúng tôi không làm">
        <ul className="space-y-2.5">
          {[
            'Không chỉ định danh hay buộc tội người gửi khiếu nại trước khi xác minh yêu cầu hợp lệ.',
            'Không tiếp nhận yêu cầu gỡ mang tính spam hoặc nhằm cạnh tranh với chủ sở hữu hợp pháp.',
            'Không xóa bất kỳ dữ liệu nào chỉ vì không tìm thấy tác phẩm trong kho của mình — trang nhận nội dung qua API, không giữ bản sao.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Sau khi gỡ nội dung">
        <p>
          Nếu yêu cầu hợp lệ, đường dẫn sẽ bị chặn vĩnh viễn. Tác giả có thể gửi lại đường dẫn đã
          gỡ và được đưa trở lại danh sách chỉ khi chứng minh được quyền sở hữu hoặc được phép
          phát hành.
        </p>
        <p className="flex items-start gap-2 text-ink-faint">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          Cảnh báo: gửi khiếu nại sai sẽ chịu trách nhiệm pháp lý theo các quy định về khiếu nại
          bồi thường thiệt hại.
        </p>
      </Section>

      <Section heading="Nội dung khác">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>
            Về cách CoiHong lấy và hiển thị nội dung, xem trang{' '}
            <Link href="/gioi-thieu" className="text-accent transition-colors hover:text-accent-soft">
              Giới thiệu
            </Link>
            . Về dữ liệu người dùng, xem trang{' '}
            <Link href="/chinh-sach-rieng-tu" className="text-accent transition-colors hover:text-accent-soft">
              Chính sách riêng tư
            </Link>
            .
          </span>
        </p>
        <p className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>Mọi thắc mắc khác về bản quyền: trang Liên hệ.</span>
        </p>
      </Section>
    </StaticPage>
  )
}
