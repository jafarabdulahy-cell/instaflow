import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, MessageCircle, ShieldCheck, Video } from "lucide-react";

const items = [
  {
    title: "کاربرد اصلی برنامه",
    body: "Instaflow برای مدیریت دایرکت‌های Instagram اکانت حرفه‌ای shanshin.rest، ساخت لید، پیگیری مشتری و پاسخ‌گویی دستی/هوشمند استفاده می‌شود.",
    done: true,
  },
  {
    title: "اتصال رسمی Meta",
    body: "Instagram ID و Access Token از Environment Variables سرور خوانده می‌شود؛ توکن در فرم یا Debug عمومی نمایش داده نمی‌شود.",
    done: true,
  },
  {
    title: "اینباکس قابل نمایش برای Reviewer",
    body: "صفحه Inbox وضعیت اتصال، empty state، و مسیر همگام‌سازی دایرکت‌ها را نشان می‌دهد تا حتی در Development هم روند کار قابل توضیح باشد.",
    done: true,
  },
  {
    title: "Webhook رسمی",
    body: "endpoint وبهوک در پروژه وجود دارد و در مرحله بعد باید در Meta Dashboard Subscribe شود تا notification پیام‌ها دریافت شود.",
    done: false,
  },
  {
    title: "ویدئوی تست App Review",
    body: "باید یک ویدئوی کوتاه ضبط شود: ورود به پنل، تست اتصال، نمایش Inbox، توضیح ساخت Lead از پیام و دلیل نیاز به permission پیام‌ها.",
    done: false,
  },
];

export default function ReviewPage() {
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-8 pt-3">
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#17112A] via-[#5B2BE2] to-[#FF2D80] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <Link href="/connect" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
            <ShieldCheck className="h-3.5 w-3.5" /> Meta App Review
          </p>
          <h1 className="mt-2 text-[25px] font-black leading-tight">چک‌لیست مسیر مستقل شانشین</h1>
          <p className="mt-2 text-[12px] font-bold leading-6 text-white/70">این صفحه برای آماده‌سازی تأیید Meta و کنار گذاشتن ابزارهای واسطه ساخته شده است.</p>
        </header>

        <section className="rounded-[28px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-right text-[15px] font-black">صفحه‌های مورد نیاز</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Link href="/privacy" className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]"><FileText className="mx-auto h-5 w-5 text-[#5B2BE2]" /><p className="mt-2 text-[10px] font-black">Privacy</p></Link>
            <Link href="/terms" className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]"><FileText className="mx-auto h-5 w-5 text-[#5B2BE2]" /><p className="mt-2 text-[10px] font-black">Terms</p></Link>
            <Link href="/data-deletion" className="rounded-2xl bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]"><ShieldCheck className="mx-auto h-5 w-5 text-[#5B2BE2]" /><p className="mt-2 text-[10px] font-black">Delete</p></Link>
          </div>
        </section>

        <section className="space-y-2">
          {items.map((item) => (
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
            <li>نمایش صفحه /connect و موفق بودن تست پروفایل shanshin.rest.</li>
            <li>نمایش Inbox و توضیح اینکه پیام‌های Instagram به لید تبدیل می‌شوند.</li>
            <li>نمایش Privacy، Terms و Data Deletion.</li>
            <li>توضیح نیاز به دسترسی پیام‌ها برای پاسخ‌گویی و پیگیری مشتریان رستوران.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
