"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Image, Lightbulb, Sparkles, Timer } from "lucide-react";
import { AppNav } from "@/components/app-nav";

const UPCOMING_FEATURES = [
  { icon: Lightbulb, title: "تولید ایده", description: "ایده‌های خلاقانه برای پست با هوش مصنوعی" },
  { icon: Sparkles, title: "تولید کپشن", description: "کپشن فارسی و انگلیسی با AI" },
  { icon: Calendar, title: "تقویم محتوا", description: "برنامه‌ریزی پست و استوری" },
  { icon: Image, title: "طراحی استوری", description: "ساخت استوری زیبا با فونت‌های فارسی" },
  { icon: Timer, title: "زمان‌بندی انتشار", description: "انتشار خودکار پست در ساعت دلخواه" },
];

export default function ContentPage() {
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-4 px-4 pb-28 pt-4">
        {/* Header */}
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="text-[22px] font-black">تولید محتوا</h1>
            <Sparkles className="h-5 w-5 text-[#5B2BE2]" />
          </div>
        </header>

        {/* Placeholder Hero */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#5B2BE2] via-[#B000B8] to-[#FF2D80] p-6 text-center text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          
          <div className="relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-white/20 backdrop-blur">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-[24px] font-black leading-tight">
              ماژول تولید محتوا
            </h2>
            <p className="mt-2 text-[13px] font-bold leading-7 text-white/80">
              در فاز بعدی ساخته می‌شود
            </p>
          </div>
        </section>

        {/* Main Message */}
        <section className="rounded-[28px] bg-white p-5 text-center shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-[15px] font-bold leading-8 text-[#24123F]">
            ماژول تولید محتوا در فاز بعدی ساخته می‌شود: ایده، کپشن، تقویم محتوا، طراحی استوری و زمان‌بندی انتشار.
          </p>
        </section>

        {/* Upcoming Features - 2 Column Grid */}
        <section>
          <h3 className="mb-3 text-right text-[16px] font-black text-[#24123F]">
            قابلیت‌های در راه
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {UPCOMING_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const isLast = index === UPCOMING_FEATURES.length - 1;
              const isOdd = UPCOMING_FEATURES.length % 2 === 1;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center rounded-[24px] bg-white p-4 text-center shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6] ${isLast && isOdd ? "col-span-2" : ""}`}
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-[#F2EEFF] to-[#E6DCF8] text-[#5B2BE2]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-[15px] font-black text-[#24123F]">{feature.title}</p>
                  <p className="mt-1 text-[12px] font-bold text-[#6D6780]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info Card */}
        <section className="rounded-[26px] bg-blue-50 p-4 text-right text-[12px] font-bold leading-7 text-blue-900 ring-1 ring-blue-100">
          <p>
            این ماژول شامل ابزارهای کامل تولید محتوا برای اینستاگرام خواهد بود. از تولید ایده و کپشن با هوش مصنوعی تا طراحی استوری و برنامه‌ریزی انتشار خودکار.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <AppNav />
    </div>
  );
}
