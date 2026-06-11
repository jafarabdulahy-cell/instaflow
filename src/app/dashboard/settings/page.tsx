"use client";

import Link from "next/link";
import { ArrowRight, Bell, Link2, Settings as SettingsIcon, User } from "lucide-react";
import { AppNav } from "@/components/app-nav";

const SETTINGS_SECTIONS = [
  {
    title: "اتصال پیج اینستاگرام",
    description: "مدیریت اتصال به Instagram API",
    icon: Link2,
    href: "/dashboard/settings/connection",
    color: "from-[#5B2BE2] to-[#8E58FF]",
  },
  {
    title: "حساب کاربری",
    description: "تنظیمات پروفایل و امنیت",
    icon: User,
    href: "/dashboard/settings/account",
    color: "from-[#FF2D80] to-[#FF6B35]",
  },
  {
    title: "مدیریت پیج",
    description: "اطلاعات و تنظیمات پیج",
    icon: SettingsIcon,
    href: "/dashboard/settings/page-info",
    color: "from-[#00C9A7] to-[#0AA3FF]",
  },
];

export default function SettingsPage() {
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-4 px-4 pb-28 pt-4">
        {/* Header */}
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#24123F] via-[#5B2BE2] to-[#8E58FF] p-5 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <Link
              href="/dashboard"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex-1 text-right">
              <h1 className="text-[28px] font-black leading-none">تنظیمات</h1>
              <p className="mt-2 text-[13px] font-bold leading-6 text-white/70">
                مدیریت اتصال، حساب کاربری و پیج
              </p>
            </div>
          </div>
        </header>

        {/* Settings Cards - 2 Column Grid */}
        <section className="grid grid-cols-2 gap-3">
          {SETTINGS_SECTIONS.map((section, index) => {
            const Icon = section.icon;
            const isLast = index === SETTINGS_SECTIONS.length - 1;
            const isOdd = SETTINGS_SECTIONS.length % 2 === 1;
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`group relative overflow-hidden rounded-[26px] bg-white p-4 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6] transition-all active:scale-[0.98] ${isLast && isOdd ? "col-span-2" : ""}`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br ${section.color} text-white shadow-lg`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Title Only */}
                  <h3 className="mt-3 text-[16px] font-black text-[#24123F]">{section.title}</h3>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Info Card */}
        <section className="rounded-[26px] bg-blue-50 p-4 text-right text-[12px] font-bold leading-6 text-blue-900 ring-1 ring-blue-100">
          <p className="font-black">راهنما</p>
          <p className="mt-2">
            برای شروع، پیج اینستاگرام خود را وصل کنید و از قابلیت‌های دایرکت هوشمند استفاده کنید.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <AppNav />
    </div>
  );
}
