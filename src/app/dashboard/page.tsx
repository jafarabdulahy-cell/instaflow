"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  Link2,
  LogOut,
  MessageCircle,
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
    webhookStatus: string;
  };
  accounts: Array<{
    id: string;
    username: string;
    name?: string;
    profilePicUrl?: string;
    webhookStatus: string;
    followersCount: number;
  }>;
};

type MetricCard = {
  label: string;
  hint: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  className: string;
};

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("fa-IR");
}

function webhookLabel(status?: string) {
  return status === "connected" ? "متصل" : "انتظار";
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
  const todayScore = useMemo(() => {
    const accounts = stats?.accounts ?? 0;
    const conversations = stats?.conversations ?? 0;
    const unread = stats?.unread ?? 0;
    return Math.min(100, accounts * 25 + conversations * 8 + unread * 4 + (isConnected ? 22 : 0));
  }, [stats, isConnected]);

  const metrics: MetricCard[] = [
    {
      label: "پیام جدید",
      hint: "نیازمند پاسخ",
      value: formatNumber(stats?.unread),
      icon: MessageCircle,
      className: "from-[#18A8FF] to-[#5B2BE2]",
    },
    {
      label: "لید فعال",
      hint: "گفتگوهای مشتری",
      value: formatNumber(stats?.conversations),
      icon: UsersRound,
      className: "from-[#2A105A] to-[#5B2BE2]",
    },
    {
      label: "پیج متصل",
      hint: "Business / Creator",
      value: formatNumber(stats?.accounts),
      icon: UserPlus,
      className: "from-[#EC4899] to-[#8E58FF]",
    },
    {
      label: "Webhook",
      hint: "وضعیت اتصال",
      value: webhookLabel(stats?.webhookStatus),
      icon: Zap,
      className: isConnected ? "from-[#10B981] to-[#14B8A6]" : "from-[#FB923C] to-[#FF2D55]",
    },
  ];

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      location.href = "/auth/login";
    });
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex h-full w-full max-w-[430px] flex-col gap-2 px-3 pb-2 pt-2">
        <header className="flex h-[54px] shrink-0 items-center justify-between rounded-[24px] bg-white/95 px-3 shadow-[0_10px_28px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
          <button
            onClick={logout}
            className="grid h-10 w-10 place-items-center rounded-[18px] bg-[#FFF1F2] text-[#FF3B30] ring-1 ring-[#FFE0E6] active:scale-95"
            aria-label="خروج"
          >
            <LogOut className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 px-3 text-right">
            <p className="truncate text-[14px] font-black">سلام {userName} 👋</p>
            <p className="truncate text-[10.5px] font-bold text-[#7C748E]">امروز لیدها را سریع‌تر مدیریت کن</p>
          </div>

          <div className="relative grid h-10 w-10 place-items-center rounded-[18px] bg-[#F2EEFF] text-lg ring-1 ring-[#E6DCF8]">
            👨🏻‍💼
            {(stats?.unread ?? 0) > 0 && (
              <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF2D55] px-1 text-[10px] font-black text-white">
                {formatNumber(stats?.unread)}
              </span>
            )}
          </div>
        </header>

        <section className="relative h-[130px] shrink-0 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#5B2BE2] via-[#7A35F0] to-[#A56BFF] p-3 text-white shadow-[0_16px_42px_rgba(91,43,226,0.24)]">
          <div className="absolute -left-10 -top-12 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-white/14 ring-1 ring-white/20">
                <ShanigramMark className="h-12 w-12 brightness-0 invert" />
              </div>
              <div className="min-w-0 text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-2.5 py-0.5 text-[10px] font-black text-white/90">
                  <Sparkles className="h-3 w-3" /> Instaflow CRM
                </span>
                <h1 className="mt-1 text-[27px] font-black leading-none tracking-tight">Shanigram</h1>
                <p className="mt-1.5 line-clamp-1 text-[11px] font-bold text-white/76">داشبورد مدیریت دایرکت، لید و مشتریان</p>
              </div>
            </div>

            <Link
              href="/dashboard/inbox"
              className="flex h-10 items-center justify-between rounded-[19px] bg-white px-2.5 text-[#5B2BE2] shadow-[0_12px_28px_rgba(42,16,90,0.14)]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-[15px] bg-[#F2EEFF]">
                <MessageCircle className="h-4.5 w-4.5" />
              </span>
              <span className="text-[13px] font-black">رفتن به اینباکس مشتریان</span>
            </Link>
          </div>
        </section>

        <section className="grid h-[52px] shrink-0 grid-cols-3 gap-2">
          <Link href="/dashboard" className="flex items-center justify-center gap-1.5 rounded-[20px] bg-white text-[#5B2BE2] shadow-[0_8px_22px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <Home className="h-4.5 w-4.5" />
            <span className="text-[11px] font-black">داشبورد</span>
          </Link>
          <Link href="/dashboard/inbox" className="flex items-center justify-center gap-1.5 rounded-[20px] bg-white text-[#24123F] shadow-[0_8px_22px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <MessageCircle className="h-4.5 w-4.5" />
            <span className="text-[11px] font-black">اینباکس</span>
          </Link>
          <Link href="/connect" className="flex items-center justify-center gap-1.5 rounded-[20px] bg-white text-[#24123F] shadow-[0_8px_22px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <Settings className="h-4.5 w-4.5" />
            <span className="text-[11px] font-black">اتصال</span>
          </Link>
        </section>

        <section className="grid h-[144px] shrink-0 grid-cols-2 gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${metric.className} p-3 text-white shadow-[0_10px_26px_rgba(42,16,90,0.12)]`}
              >
                <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-white/13 blur-xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-[16px] bg-white/16 ring-1 ring-white/18">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="truncate text-right text-[11.5px] font-black text-white/86">{metric.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="truncate text-[24px] font-black leading-none">{metric.value}</p>
                    <p className="mt-1 truncate text-[9.5px] font-bold text-white/64">{metric.hint}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="h-[82px] shrink-0 rounded-[26px] bg-white px-3 py-2 shadow-[0_12px_30px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="flex h-full items-center justify-between gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[21px] bg-gradient-to-br from-[#17112A] to-[#5B2BE2] text-[18px] font-black text-white">
              {formatNumber(todayScore)}٪
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[13px] font-black">وضعیت امروز</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] font-bold text-[#7C748E]">
                {todayScore > 45 ? "سیستم آماده پیگیری لیدهاست." : "برای شروع، پیج اینستاگرام را وصل کن."}
              </p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[19px] bg-[#F2EEFF] text-[#5B2BE2]">
              <Bell className="h-6 w-6" />
            </div>
          </div>
        </section>

        <div className="min-h-0 flex-1" />

        <nav className="h-[58px] shrink-0 rounded-[24px] bg-white/96 p-1.5 shadow-[0_-10px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
          <div className="grid h-full grid-cols-3 gap-1.5">
            <Link href="/dashboard" className="flex flex-col items-center justify-center rounded-[18px] bg-[#F2EEFF] text-[#5B2BE2]">
              <Home className="h-4.5 w-4.5" />
              <span className="mt-0.5 text-[10.5px] font-black">داشبورد</span>
            </Link>
            <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-[18px] text-[#6D6780]">
              <MessageCircle className="h-4.5 w-4.5" />
              <span className="mt-0.5 text-[10.5px] font-black">اینباکس</span>
            </Link>
            <Link href="/connect" className="flex flex-col items-center justify-center rounded-[18px] text-[#6D6780]">
              <Link2 className="h-4.5 w-4.5" />
              <span className="mt-0.5 text-[10.5px] font-black">اتصال</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
