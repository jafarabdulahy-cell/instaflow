import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, Link2, MessageCircle, ShieldCheck, Video, Webhook } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "https://YOUR-DOMAIN";

const checklist = [
  {
    title: "کاربرد اصلی برنامه",
    body: "Instaflow یک پنل جهانی برای اکانت‌های Instagram Professional است. در تست فعلی، shanshin.rest به عنوان اکانت پایلوت برای نمایش خواندن دایرکت، ساخت لید و پیگیری مشتری استفاده می‌شود.",
    done: true,
  },
  {
    title: "اتصال رسمی Meta API",
    body: "Page ID و Page Access Token از Environment Variables سرور خوانده می‌شود؛ توکن در فرم و Debug عمومی نمایش داده نمی‌شود. مسیر اصلی Inbox با graph.facebook.com/{PAGE_ID}/conversations?platform=instagram است.",
    done: true,
  },
  {
    title: "اینباکس مستقل قابل نمایش برای Reviewer",
    body: "صفحه Inbox وضعیت اتصال Page Token، لیست گفتگوها، چند پیام آخر هر گفتگو و مسیر تبدیل دایرکت به Lead را نشان می‌دهد.",
    done: true,
  },
  {
    title: "Privacy / Terms / Data Deletion",
    body: "سه صفحه عمومی برای سیاست حریم خصوصی، شرایط استفاده و حذف داده آماده است و باید URL آن‌ها در Meta Dashboard ثبت شود.",
    done: true,
  },
  {
    title: "Webhook رسمی Meta",
    body: "endpoint آماده است، اما باید در Meta Dashboard ثبت و Verify شود و بعد Subscribe field مربوط به پیام‌ها فعال شود.",
    done: false,
  },
  {
    title: "ویدئوی تست App Review",
    body: "باید ویدئوی کوتاه ضبط شود: ورود به پنل، تست اتصال، نمایش Inbox، توضیح تبدیل پیام به Lead و دلیل نیاز به permission پیام‌ها.",
    done: false,
  },
  {
    title: "ارسال App Review / Advanced Access",
    body: "بعد از Webhook و ویدئو، Permissionهای پیام‌رسانی باید برای Advanced Access ارسال شوند تا کاربران عادی بدون Tester شدن قابل پشتیبانی باشند.",
    done: false,
  },
];

const permissions = [
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "business_management",
];

export default function ReviewPage() {
  const callbackUrl = `${baseUrl}/api/webhook`;
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-8 pt-3">
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#17112A] via-[#5B2BE2] to-[#FF2D80] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <Link href="/connect" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
            <ShieldCheck className="h-3.5 w-3.5" /> Meta Review مسیر مستقل
          </p>
          <h1 className="mt-2 text-[25px] font-black leading-tight">چک‌لیست تأیید رسمی Instaflow</h1>
          <p className="mt-2 text-[12px] font-bold leading-6 text-white/70">هدف این صفحه آماده‌سازی اپ جهانی Instaflow برای App Review و دریافت دسترسی واقعی دایرکت‌هاست. شانشین فقط اکانت پایلوت تست است.</p>
        </header>

        <section className="rounded-[28px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-right text-[15px] font-black">صفحه‌های عمومی لازم</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Link href="/privacy" className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]"><FileText className="mx-auto h-5 w-5 text-[#5B2BE2]" /><p className="mt-2 text-[10px] font-black">Privacy</p></Link>
            <Link href="/terms" className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]"><FileText className="mx-auto h-5 w-5 text-[#5B2BE2]" /><p className="mt-2 text-[10px] font-black">Terms</p></Link>
            <Link href="/data-deletion" className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]"><ShieldCheck className="mx-auto h-5 w-5 text-[#5B2BE2]" /><p className="mt-2 text-[10px] font-black">Delete</p></Link>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="flex items-center justify-end gap-2 text-[15px] font-black text-[#24123F]"><Webhook className="h-5 w-5 text-[#5B2BE2]" /> Webhook رسمی</p>
          <div className="mt-3 space-y-2 text-[11px] font-bold leading-6 text-[#6D6780]">
            <div className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]">
              <p className="font-black text-[#24123F]">Callback URL</p>
              <p dir="ltr" className="mt-1 break-all text-left text-[10px] text-[#5B2BE2]">{callbackUrl}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-900 ring-1 ring-amber-100">
              <p className="font-black">Variable لازم در Railway</p>
              <p dir="ltr" className="mt-1 text-left text-[10px]">META_WEBHOOK_VERIFY_TOKEN=یک_کلمه_امن_دلخواه</p>
            </div>
            <p>در Meta Dashboard باید همین Verify Token را وارد کنی. endpoint فعلی GET verification و POST event را پشتیبانی می‌کند.</p>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="flex items-center justify-end gap-2 text-[15px] font-black text-[#24123F]"><ClipboardCheck className="h-5 w-5 text-[#5B2BE2]" /> Permissionهای قابل ارسال برای Review</p>
          <div className="mt-3 space-y-2">
            {permissions.map((permission) => (
              <div key={permission} dir="ltr" className="rounded-2xl bg-[#FAF9FF] px-3 py-2 text-left text-[11px] font-black text-[#24123F] ring-1 ring-[#ECE8F6]">{permission}</div>
            ))}
          </div>
          <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-[11px] font-bold leading-6 text-blue-900 ring-1 ring-blue-100">برای دایرکت، مهم‌ترین مورد instagram_manage_messages است. Permissionهای انتشار محتوا و مدیریت کامنت را فقط زمانی اضافه کن که واقعاً داخل محصول و ویدئو نشان داده شوند.</p>
        </section>

        <section className="space-y-2">
          {checklist.map((item) => (
            <div key={item.title} className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ring-1 ${item.done ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                  {item.done ? "آماده" : "مرحله بعد"}
                </span>
                <div>
                  <p className="text-[13px] font-black text-[#24123F]">{item.title}</p>
                  <p className="mt-1 text-[11px] font-bold leading-6 text-[#6D6780]">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] bg-[#17112A] p-4 text-right text-white shadow-[0_18px_40px_rgba(42,16,90,0.18)]">
          <p className="flex items-center justify-end gap-2 text-[15px] font-black"><Video className="h-5 w-5 text-[#FFD66B]" /> سناریوی ویدئوی Review</p>
          <ol className="mt-3 list-decimal space-y-2 pr-5 text-[11px] font-bold leading-6 text-white/75">
            <li>نمایش صفحه /connect و موفق بودن تست Page Token برای PAGE_ID=812762118592536 و Instagram=shanshin.rest.</li>
            <li>نمایش اینکه برنامه با graph.facebook.com و Page Access Token گفتگوهای Instagram را می‌خواند.</li>
            <li>نمایش /dashboard/inbox، لیست گفتگوها و چند پیام آخر گفتگو.</li>
            <li>توضیح اینکه دایرکت‌های Instagram برای ساخت Lead، پیگیری فروش/رزرو/پشتیبانی و پاسخ‌گویی کسب‌وکارها استفاده می‌شود.</li>
            <li>نمایش Privacy، Terms و Data Deletion.</li>
            <li>نمایش Callback URL و Verify Token برای Webhook.</li>
          </ol>
        </section>

        <section className="rounded-[28px] bg-white p-4 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="flex items-center justify-end gap-2 text-[15px] font-black text-[#24123F]"><MessageCircle className="h-5 w-5 text-[#5B2BE2]" /> متن توضیح کوتاه برای Reviewer</p>
          <p className="mt-2 rounded-2xl bg-[#FAF9FF] p-3 text-[11px] font-bold leading-7 text-[#6D6780] ring-1 ring-[#ECE8F6]">
            Instaflow is a SaaS dashboard for Instagram Professional accounts. It helps businesses connect their Instagram inbox, read and manage direct messages, convert customer DMs into leads, and support manual or assisted follow-up from a private dashboard. We request instagram_manage_messages only to read customer conversations, create follow-up leads, and help business staff respond to support, reservation, order, sales, and customer-service inquiries. The shanshin.rest account is used as our pilot account for the App Review demonstration.
          </p>
        </section>
      </main>
    </div>
  );
}
