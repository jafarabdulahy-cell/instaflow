"use client";

import Link from "next/link";
import { ArrowRight, Bot, Grid3x3, Image, MessageCircle, Zap } from "lucide-react";
import { AppNav } from "@/components/app-nav";

const DIRECT_MODULES = [
  {
    title: "اینباکس",
    description: "مدیریت پیام‌های دایرکت دریافتی",
    icon: MessageCircle,
    href: "/dashboard/inbox",
    color: "from-[#5B2BE2] to-[#8E58FF]",
  },
  {
    title: "قوانین هوشمند",
    description: "پاسخ خودکار و Rule Builder",
    icon: Bot,
    href: "/dashboard/automation/rules",
    color: "from-[#FF2D80] to-[#FF6B35]",
  },
  {
    title: "ویترین",
    description: "کارت‌های محصول و سرویس",
    icon: Grid3x3,
    href: "/dashboard/cards",
    color: "from-[#00C9A7] to-[#0AA3FF]",
  },
  {
    title: "پاسخ‌های سریع",
    description: "قالب‌های آماده متنی",
    icon: Zap,
    href: "/dashboard/templates",
    color: "from-[#FFD60A] to-[#FF9500]",
  },
  {
    title: "رسانه‌ها",
    description: "آپلود و مدیریت عکس و ویدیو",
    icon: Image,
    href: "/dashboard/assets",
    color: "from-[#B000B8] to-[#5B2BE2]",
  },
];

export default function DirectPage() {
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
              <h1 className="text-[28px] font-black leading-none">دایرکت هوشمند</h1>
              <p className="mt-2 text-[13px] font-bold leading-6 text-white/70">
                مدیریت کامل پیام‌ها، پاسخ خودکار و محتوا
              </p>
            </div>
          </div>
        </header>

        {/* Module Cards - 2 Column Grid */}
        <section className="grid grid-cols-2 gap-3">
          {DIRECT_MODULES.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group relative overflow-hidden rounded-[26px] bg-white p-4 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6] transition-all active:scale-[0.98]"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br ${module.color} text-white shadow-lg`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Title Only */}
                  <h3 className="mt-3 text-[16px] font-black text-[#24123F]">{module.title}</h3>
                </div>
              </Link>
            );
          })}
        </section>
      </main>

      {/* Bottom Navigation */}
      <AppNav />
    </div>
  );
}
