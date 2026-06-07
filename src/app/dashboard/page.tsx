"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  LogOut,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Settings,
  ShoppingBag,
  Sparkles,
  UsersRound,
  WifiOff,
  Zap,
} from "lucide-react";
import { ShanigramMark } from "@/components/brand-shanigram";
import { AppNav } from "@/components/app-nav";

type DashboardData = {
  stats: {
    accounts: number;
    conversations: number;
    unread: number;
    webhookEvents: number;
    leads?: number;
    followups?: number;
    customers?: number;
    webhookStatus: string;
  };
};

type QuickLink = {
  href: string;
  label: string;
  sub: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
};

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("fa-IR");
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("جعفر");

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.status === 401) { window.location.href = "/auth/login"; return; }
      const json = await res.json();
      if (json.user?.name) setUserName(json.user.name);
    });
    fetch("/api/dashboard").then((res) => res.json()).then(setData).catch(() => setData(null));
  }, []);

  const stats = data?.stats;
  const isConnected = stats?.webhookStatus === "connected";

  const setupScore = useMemo(() => {
    const accounts = stats?.accounts ?? 0;
    const leads = stats?.leads ?? 0;
    const conversations = stats?.conversations ?? 0;
    const unread = stats?.unread ?? 0;
    return Math.min(100, accounts * 25 + conversations * 7 + leads * 6 + unread * 5 + (isConnected ? 20 : 0));
  }, [stats, isConnected]);

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => { location.href = "/auth/login"; });
  }

  const quickLinks: QuickLink[] = [
    { href: "/dashboard/inbox", label: "اینباکس", sub: "دایرکت‌ها", icon: MessageCircle, accent: "text-blue-600 bg-blue-50 ring-blue-100" },
    { href: "/dashboard/automation/rules", label: "قوانین", sub: "Auto Reply", icon: Bot, accent: "text-[#5B2BE2] bg-[#F2EEFF] ring-[#E6DCF8]" },
    { href: "/dashboard/cards", label: "کارت‌ها", sub: "ویترین دایرکت", icon: ShoppingBag, accent: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
    { href: "/dashboard/comments", label: "کامنت", sub: "هوشمند", icon: MessageSquare, accent: "text-pink-600 bg-pink-50 ring-pink-100" },
    { href: "/dashboard/assets", label: "پیوست‌ها", sub: "رسانه‌ها", icon: Paperclip, accent: "text-amber-700 bg-amber-50 ring-amber-100" },
    { href: "/dashboard/leads", label: "لیدها", sub: "مخاطبین", icon: UsersRound, accent: "text-violet-700 bg-violet-50 ring-violet-100" },
    { href: "/dashboard/logs", label: "لاگ‌ها", sub: "رویدادها", icon: Activity, accent: "text-slate-600 bg-slate-50 ring-slate-100" },
    { href: "/connect", label: "اتصال", sub: "Instagram API", icon: Settings, accent: "text-[#24123F] bg-[#F4F0FF] ring-[#E6DCF8]" },
  ];

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">

        {/* Header */}
        <header className="flex h-[58px] shrink-0 items-center justify-between rounded-[26px] bg-white/92 px-3 shadow-[0_12px_35px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
          <button onClick={logout} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFF1F2] text-[#FF3B30] ring-1 ring-[#FFE0E6] active:scale-95" aria-label="خروج">
            <LogOut className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 px-3 text-right">
            <p className="truncate text-[15px] font-black">سلام {userName} 👋</p>
            <p className="truncate text-[11px] font-bold text-[#7C748E]">پنل اتوماسیون اینستاگرام</p>
          </div>
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-xl ring-1 ring-[#E6DCF8]">
            👨🏻‍💼
            {(stats?.unread ?? 0) > 0 && (
              <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF2D55] px-1 text-[10px] font-black text-white">
                {formatNumber(stats?.unread)}
              </span>
            )}
          </div>
        </header>

        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#5B2BE2] via-[#7A35F0] to-[#A56BFF] p-4 text-white shadow-[0_20px_55px_rgba(91,43,226,0.26)]">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[26px] bg-white/14 ring-1 ring-white/20">
              <ShanigramMark className="h-14 w-14 brightness-0 invert" />
            </div>
            <div className="min-w-0 text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1 text-[11px] font-black text-white/90">
                <Sparkles className="h-3.5 w-3.5" /> Instaflow v26
              </span>
              <h1 className="mt-2 text-[27px] font-black leading-none tracking-tight">Shanigram</h1>
              <p className="mt-1 text-[12px] font-bold text-white/78">اتوماسیون دایرکت و کامنت اینستاگرام</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative mt-4 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-[18px] bg-white/12 p-2 ring-1 ring-white/14">
              <p className="text-[20px] font-black leading-none">{formatNumber(stats?.leads)}</p>
              <p className="mt-1 text-[9px] font-bold text-white/60">لید</p>
            </div>
            <div className="rounded-[18px] bg-white/12 p-2 ring-1 ring-white/14">
              <p className="text-[20px] font-black leading-none">{formatNumber(stats?.unread)}</p>
              <p className="mt-1 text-[9px] font-bold text-white/60">پیام جدید</p>
            </div>
            <div className="rounded-[18px] bg-white/12 p-2 ring-1 ring-white/14">
              <p className="text-[20px] font-black leading-none">{formatNumber(stats?.conversations)}</p>
              <p className="mt-1 text-[9px] font-bold text-white/60">گفتگو</p>
            </div>
            <div className={`rounded-[18px] p-2 ring-1 ${isConnected ? "bg-emerald-400/20 ring-emerald-300/30" : "bg-amber-400/20 ring-amber-300/30"}`}>
              <div className="flex justify-center">
                {isConnected ? <CheckCircle2 className="h-5 w-5 text-emerald-200" /> : <WifiOff className="h-5 w-5 text-amber-200" />}
              </div>
              <p className="mt-1 text-[9px] font-bold text-white/60">{isConnected ? "متصل" : "قطع"}</p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="relative mt-3 grid grid-cols-2 gap-2">
            <Link href="/dashboard/automation/rules/new" className="flex h-11 items-center justify-center gap-2 rounded-[20px] bg-white px-2 text-[12px] font-black text-[#5B2BE2] shadow-[0_16px_36px_rgba(42,16,90,0.16)]">
              <Zap className="h-4 w-4" /> قانون جدید
            </Link>
            <Link href="/dashboard/inbox" className="flex h-11 items-center justify-center gap-2 rounded-[20px] bg-white/16 px-2 text-[12px] font-black text-white ring-1 ring-white/18">
              <MessageCircle className="h-4 w-4" /> اینباکس
            </Link>
          </div>
        </section>

        {/* Quick links grid */}
        <section className="grid grid-cols-4 gap-2">
          {quickLinks.map(({ href, label, sub, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1.5 rounded-[22px] bg-white py-3 text-center shadow-[0_10px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]"
            >
              <div className={`grid h-9 w-9 place-items-center rounded-2xl ring-1 ${accent}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-black text-[#24123F] leading-tight">{label}</p>
              <p className="text-[9px] font-bold text-[#8A8498] leading-tight">{sub}</p>
            </Link>
          ))}
        </section>

        {/* Status card */}
        <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="flex items-center justify-between gap-3">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[20px] ${isConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {isConnected ? <CheckCircle2 className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[14px] font-black">
                {isConnected ? "اتصال اینستاگرام برقرار است" : "اتصال اینستاگرام برقرار نیست"}
              </p>
              <p className="mt-1 text-[12px] font-bold leading-6 text-[#7C748E]">
                {isConnected
                  ? "Webhook و Auto Reply فعال — پیام‌ها پردازش می‌شوند."
                  : "برای شروع، از منوی اتصال Instagram API را تنظیم کن."}
              </p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-[#17112A] to-[#5B2BE2] text-[18px] font-black text-white">
              {setupScore.toLocaleString("fa-IR")}٪
            </div>
          </div>
          {!isConnected && (
            <Link href="/connect" className="mt-3 flex h-10 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[12px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]">
              رفتن به صفحه اتصال ←
            </Link>
          )}
        </section>

      </main>
      <AppNav />
    </div>
  );
}
