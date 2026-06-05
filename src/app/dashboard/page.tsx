"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  Home,
  Link2,
  LogOut,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Settings,
  Sparkles,
  UserPlus,
  UsersRound,
  Zap,
} from "lucide-react";
import { ShanigramMark } from "@/components/brand-shanigram";

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

type MiniCard = {
  label: string;
  hint: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("fa-IR");
}

function webhookLabel(status?: string) {
  return status === "connected" ? "متصل" : "در انتظار";
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: ComponentType<{ className?: string }>; active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center rounded-2xl ${active ? "bg-[#F2EEFF] text-[#5B2BE2]" : "text-[#6D6780]"}`}>
      <Icon className="h-5 w-5" />
      <span className="mt-1 text-[10px] font-black">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("جعفر");

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.status === 401) window.location.href = "/auth/login";
      const json = await res.json();
      if (json.user?.name) setUserName(json.user.name);
    });

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const stats = data?.stats;
  const isConnected = stats?.webhookStatus === "connected";
  const score = useMemo(() => {
    const unread = stats?.unread ?? 0;
    const conversations = stats?.conversations ?? 0;
    const accounts = stats?.accounts ?? 0;
    const leads = stats?.leads ?? 0;
    return Math.min(100, accounts * 25 + conversations * 7 + leads * 6 + unread * 5 + (isConnected ? 20 : 0));
  }, [stats, isConnected]);

  const cards: MiniCard[] = [
    { label: "لید فعال", hint: "در صف پیگیری", value: formatNumber(stats?.leads), icon: UsersRound, tone: "from-[#2A105A] to-[#5B2BE2]" },
    { label: "پیام جدید", hint: "نیازمند پاسخ", value: formatNumber(stats?.unread), icon: MessageCircle, tone: "from-[#0EA5E9] to-[#5B2BE2]" },
    { label: "قوانین پاسخ", hint: "مدیریت اتوماسیون", value: "قوانین", icon: Bot, tone: "from-[#B000B8] to-[#5B2BE2]" },
    { label: "Webhook", hint: "دریافت خودکار", value: webhookLabel(stats?.webhookStatus), icon: Zap, tone: isConnected ? "from-[#10B981] to-[#14B8A6]" : "from-[#F59E0B] to-[#FF2D55]" },
  ];

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      location.href = "/auth/login";
    });
  }

  return (
    <div dir="rtl" className="h-[100dvh] overflow-hidden bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex h-full w-full max-w-[430px] flex-col gap-3 px-4 pb-3 pt-3">
        <header className="flex h-[58px] shrink-0 items-center justify-between rounded-[26px] bg-white/92 px-3 shadow-[0_12px_35px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
          <button onClick={logout} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFF1F2] text-[#FF3B30] ring-1 ring-[#FFE0E6] active:scale-95" aria-label="خروج">
            <LogOut className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 px-3 text-right">
            <p className="truncate text-[15px] font-black">سلام {userName} 👋</p>
            <p className="truncate text-[11px] font-bold text-[#7C748E]">داشبورد سریع اتوماسیون دایرکت</p>
          </div>
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-xl ring-1 ring-[#E6DCF8]">
            👨🏻‍💼
            {(stats?.unread ?? 0) > 0 && <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF2D55] px-1 text-[10px] font-black text-white">{formatNumber(stats?.unread)}</span>}
          </div>
        </header>

        <section className="relative h-[172px] shrink-0 overflow-hidden rounded-[34px] bg-gradient-to-br from-[#5B2BE2] via-[#7A35F0] to-[#A56BFF] p-4 text-white shadow-[0_20px_55px_rgba(91,43,226,0.26)]">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-[26px] bg-white/14 ring-1 ring-white/20"><ShanigramMark className="h-14 w-14 brightness-0 invert" /></div>
              <div className="min-w-0 text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1 text-[11px] font-black text-white/90"><Sparkles className="h-3.5 w-3.5" /> Instaflow Live Rules</span>
                <h1 className="mt-2 text-[27px] font-black leading-none tracking-tight">Shanigram</h1>
                <p className="mt-2 text-[12px] font-bold text-white/78">دسترسی سریع به قوانین، اینباکس، لیدها و اتصال</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/automation/rules" className="flex h-11 items-center justify-center gap-2 rounded-[20px] bg-white px-2 text-[12px] font-black text-[#5B2BE2] shadow-[0_16px_36px_rgba(42,16,90,0.16)]"><Bot className="h-4 w-4" /> قوانین پاسخ</Link>
              <Link href="/dashboard/automation/rules/new" className="flex h-11 items-center justify-center gap-2 rounded-[20px] bg-white/16 px-2 text-[12px] font-black text-white ring-1 ring-white/18"><Zap className="h-4 w-4" /> قانون جدید</Link>
            </div>
          </div>
        </section>

        <section className="grid h-[132px] shrink-0 grid-cols-4 gap-2">
          <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><MessageCircle className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">اینباکس</span></Link>
          <Link href="/dashboard/automation/rules" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#5B2BE2] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><Bot className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">قوانین</span></Link>
          <Link href="/dashboard/assets" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><Paperclip className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">پیوست‌ها</span></Link>
          <Link href="/dashboard/comments" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><MessageSquare className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">کامنت</span></Link>
          <Link href="/dashboard/templates" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><BookOpen className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">قالب‌ها</span></Link>
          <Link href="/dashboard/logs" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><Activity className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">لاگ‌ها</span></Link>
          <Link href="/dashboard/leads" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><UsersRound className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">لیدها</span></Link>
          <Link href="/connect" className="flex flex-col items-center justify-center rounded-[22px] bg-white text-[#24123F] shadow-[0_10px_28px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><Settings className="h-5 w-5" /><span className="mt-1 text-[9px] font-black">اتصال</span></Link>
        </section>

        <section className="grid h-[186px] shrink-0 grid-cols-2 gap-2">
          {cards.map((card) => {
            const Icon = card.icon;
            const content = (
              <div className={`relative h-full overflow-hidden rounded-[26px] bg-gradient-to-br ${card.tone} p-3 text-white shadow-[0_13px_32px_rgba(42,16,90,0.12)]`}>
                <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-white/13 blur-xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-2"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/16 ring-1 ring-white/18"><Icon className="h-5 w-5" /></div><p className="text-right text-[12px] font-black text-white/86">{card.label}</p></div>
                  <div className="text-right"><p className="text-[25px] font-black leading-none">{card.value}</p><p className="mt-1 text-[10px] font-bold text-white/64">{card.hint}</p></div>
                </div>
              </div>
            );
            if (card.label === "قوانین پاسخ") return <Link key={card.label} href="/dashboard/automation/rules">{content}</Link>;
            return <div key={card.label}>{content}</div>;
          })}
        </section>

        <section className="min-h-0 flex-1 overflow-hidden rounded-[28px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] bg-[#F2EEFF] text-[#5B2BE2]"><Bell className="h-7 w-7" /></div>
            <div className="min-w-0 flex-1 text-right"><p className="text-[14px] font-black">وضعیت امروز</p><p className="mt-1 text-[12px] font-bold leading-6 text-[#7C748E]">{score > 45 ? "سیستم آماده اتوماسیون و پیگیری لیدهاست." : "برای شروع، اتصال و قوانین پاسخ را کامل کن."}</p></div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[24px] bg-gradient-to-br from-[#17112A] to-[#5B2BE2] text-[22px] font-black text-white">{formatNumber(score)}٪</div>
          </div>
        </section>

        <nav className="h-[66px] shrink-0 rounded-[26px] bg-white/96 p-2 shadow-[0_-10px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] safe-bottom">
          <div className="grid h-full grid-cols-5 gap-1">
            <NavItem href="/dashboard" label="خانه" icon={Home} active />
            <NavItem href="/dashboard/inbox" label="اینباکس" icon={MessageCircle} />
            <NavItem href="/dashboard/automation/rules" label="قوانین" icon={Bot} />
            <NavItem href="/dashboard/leads" label="لیدها" icon={UsersRound} />
            <NavItem href="/connect" label="اتصال" icon={Link2} />
          </div>
        </nav>
      </main>
    </div>
  );
}
