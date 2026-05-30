import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShanigramLogo, ShanigramMark } from "@/components/brand-shanigram";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#efe9ff_0,#ffffff_68%)] px-4 py-8 text-[#17112A]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[430px] flex-col items-center justify-center text-center animate-fade-in">
        <div className="mb-6 rounded-[32px] bg-white/80 p-5 shadow-[0_22px_60px_rgba(42,16,90,0.12)] ring-1 ring-[#ECE8F6]">
          <ShanigramMark className="mx-auto h-28 w-28" />
        </div>

        <ShanigramLogo className="justify-center" markClassName="hidden" />

        <p className="mt-4 max-w-xs text-sm font-medium leading-7 text-[#6D6780]">
          مدیریت هوشمند دایرکت، ارتباط با مشتریان و رشد حرفه‌ای پیج اینستاگرام
        </p>
        <p className="mt-3 rounded-full bg-[#F2EEFF] px-4 py-2 text-xs font-black text-[#5B2BE2]">
          طراح: جعفر عبدالهی
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Button asChild size="lg" className="h-[52px] w-full rounded-2xl bg-[#5B2BE2] text-white shadow-[0_14px_32px_rgba(91,43,226,0.25)] hover:bg-[#4A20C9]">
            <Link href="/auth/login">ورود به حساب</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-[52px] w-full rounded-2xl border-[#DED8EF] bg-white hover:bg-[#F9F7FF]">
            <Link href="/auth/register">ساخت حساب جدید</Link>
          </Button>
        </div>

        <p className="mt-8 text-xs font-medium leading-6 text-[#8A8498]">
          با اتصال به اینستاگرام، قوانین متا را می‌پذیری.
        </p>
      </div>
    </main>
  );
}
