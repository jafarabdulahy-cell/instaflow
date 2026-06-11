"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function HeroBanner() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // چک کردن وضعیت اتصال بدون Meta API
    fetch("/api/instagram/settings")
      .then((res) => res.json())
      .then((data) => {
        setIsConnected(data.configured || false);
      })
      .catch(() => setIsConnected(false));
  }, []);
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#5B2BE2] via-[#7A35F0] to-[#A56BFF] p-4 text-white shadow-[0_20px_55px_rgba(91,43,226,0.26)]"
    >
      {/* بک‌گراند دکوراتیو */}
      <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      {/* محتوا */}
      <div className="relative z-10 text-right">
        <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black">
          <Sparkles className="h-3 w-3" />
          <span>InstaFlow v26</span>
        </div>
        <h2 className="mt-2 text-[20px] font-black leading-tight">
          دایرکت و کامنت پیجت را
          <br />
          هوشمند کن
        </h2>
        <p className="mt-1.5 text-[13px] font-bold text-white/80">
          پاسخ خودکار، جذب لید و تولید محتوا
        </p>

        {/* دکمه CTA */}
        <Link
          href={isConnected ? "/dashboard/direct" : "/dashboard/settings/connection"}
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-[16px] bg-white px-4 text-[13px] font-black text-[#5B2BE2] shadow-lg hover:bg-white/95"
        >
          {isConnected ? "مدیریت دایرکت هوشمند" : "اتصال به اینستاگرام"} →
        </Link>
      </div>

      {/* ایلوستریشن (اختیاری - فعلاً بدون تصویر) */}
      <div className="absolute bottom-2 left-2 text-5xl opacity-30">🤖</div>
    </section>
  );
}
