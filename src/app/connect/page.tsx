"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Instagram, Link2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShanigramLogo, ShanigramMark } from "@/components/brand-shanigram";

const steps = [
  "پیج اینستاگرام باید Business یا Creator باشد",
  "پیج باید به یک صفحه فیسبوک متصل باشد",
  "از مسیر رسمی Meta وارد حساب خود شوید",
  "مجوزهای لازم برای DM، Webhook و مدیریت پیج را تأیید کنید",
];

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);

  function handleConnect() {
    setLoading(true);
    window.location.href = "/api/auth/instagram/start";
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#efe9ff_0,#ffffff_72%)] px-4 py-5 text-[#17112A]">
      <div className="mx-auto w-full max-w-[430px] animate-fade-in">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#5B2BE2] shadow-sm ring-1 ring-[#ECE8F6]">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <ShanigramLogo compact markClassName="h-11 w-11" />
        </div>

        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#5B2BE2] via-[#722FE8] to-[#8E58FF] p-5 text-white shadow-[0_22px_50px_rgba(91,43,226,0.24)]">
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[12px] font-black text-white/80"><Sparkles className="h-4 w-4" /> اتصال امن</p>
              <h1 className="mt-2 text-2xl font-black">اتصال پیج اینستاگرام</h1>
              <p className="mt-2 text-[12px] font-medium leading-6 text-white/86">اتصال از مسیر رسمی Meta، بدون دریافت رمز عبور شما.</p>
            </div>
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] bg-white/13 ring-1 ring-white/20">
              <ShanigramMark className="h-[72px] w-[72px] brightness-0 invert" />
            </div>
          </div>
        </section>

        <div className="my-4 flex flex-wrap items-center justify-center gap-2">
          <Badge className="bg-green-50 text-green-700"><ShieldCheck className="ml-1 h-3.5 w-3.5" /> بدون پسورد</Badge>
          <Badge className="bg-[#F2EEFF] text-[#5B2BE2]"><ShieldCheck className="ml-1 h-3.5 w-3.5" /> OAuth رسمی</Badge>
          <Badge className="bg-pink-50 text-pink-700"><Instagram className="ml-1 h-3.5 w-3.5" /> Creator / Business</Badge>
        </div>

        <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_38px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
          <CardContent className="p-5">
            <h2 className="mb-4 text-[16px] font-black">پیش از اتصال</h2>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F2EEFF] text-xs font-black text-[#5B2BE2]">{index + 1}</div>
                  <p className="text-[13px] font-medium leading-6 text-[#5F596F]">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 rounded-[26px] border-0 bg-white shadow-[0_16px_38px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
          <CardContent className="p-5">
            <h2 className="mb-4 text-[16px] font-black">مجوزهای موردنیاز</h2>
            <div className="grid gap-2">
              {["دریافت و پاسخ DM", "خواندن اطلاعات پایه پیج", "ثبت Webhook", "آمار و گزارش‌های پیج"].map((permission) => (
                <div key={permission} className="flex items-center gap-2 rounded-2xl bg-[#FAF9FF] px-3 py-2 text-[13px] font-bold text-[#5F596F]">
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  {permission}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleConnect}
          disabled={loading}
          size="lg"
          className="mt-5 h-[56px] w-full rounded-2xl bg-[#5B2BE2] text-white shadow-[0_16px_34px_rgba(91,43,226,0.25)] hover:bg-[#4A20C9]"
        >
          <Link2 className="h-5 w-5" />
          {loading ? "در حال انتقال..." : "اتصال از طریق فیسبوک / اینستاگرام"}
        </Button>

        <p className="mt-4 text-center text-[12px] font-medium leading-6 text-[#8A8498]">هر زمان خواستی می‌توانی اتصال را قطع کنی.</p>
      </div>
    </main>
  );
}
