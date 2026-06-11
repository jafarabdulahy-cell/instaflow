"use client";

import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { AppNav } from "@/components/app-nav";

export default function AccountSettingsPage() {
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-4 px-4 pb-28 pt-4">
        {/* Header */}
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard/settings"
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="text-[22px] font-black">حساب کاربری</h1>
            <User className="h-5 w-5 text-[#5B2BE2]" />
          </div>
        </header>

        {/* Placeholder */}
        <section className="mt-4 rounded-[28px] bg-white p-6 text-center shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-[#F2EEFF] text-[#5B2BE2]">
            <User className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-[18px] font-black">تنظیمات حساب کاربری</h2>
          <p className="mt-2 text-[13px] font-bold leading-7 text-[#6D6780]">
            این بخش در فاز بعدی پیاده‌سازی می‌شود: ویرایش پروفایل، تغییر رمز عبور، امنیت و تنظیمات اعلان‌ها.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <AppNav />
    </div>
  );
}
