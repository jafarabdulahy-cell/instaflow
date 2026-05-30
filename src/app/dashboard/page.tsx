"use client";

import { useEffect, useState, type ComponentType } from "react";
import NextLink from "next/link";
import {
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  Home,
  Instagram,
  Link2,
  LogOut,
  MessageCircle,
  MessagesSquare,
  MoreVertical,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShanigramLogo, ShanigramMark } from "@/components/brand-shanigram";

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

type StatCard = {
  label: string;
  hint: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  iconWrap: string;
  spark: string;
};

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

  const isConnected = data?.stats.webhookStatus === "connected";

  const stats: StatCard[] = [
    {
      label: "گفتگوها",
      hint: "کل گفتگوها",
      value: data?.stats.conversations ?? 0,
      icon: MessagesSquare,
      iconWrap: "bg-gradient-to-br from-[#5B2BE2] to-[#8E58FF] text-white shadow-violet-200",
      spark: "text-[#8E58FF]",
    },
    {
      label: "DM جدید",
      hint: "پیام جدید",
      value: data?.stats.unread ?? 0,
      icon: MessageCircle,
      iconWrap: "bg-gradient-to-br from-[#10B981] to-[#33D28E] text-white shadow-emerald-100",
      spark: "text-[#10B981]",
    },
    {
      label: "Webhook",
      hint: "وضعیت اتصال",
      value: isConnected ? "متصل" : "در انتظار",
      icon: Zap,
      iconWrap: "bg-gradient-to-br from-[#F59E0B] to-[#FFCB3D] text-white shadow-amber-100",
      spark: "text-[#F59E0B]",
    },
    {
      label: "پیج‌ها",
      hint: "پیج متصل",
      value: data?.stats.accounts ?? 0,
      icon: Instagram,
      iconWrap: "bg-gradient-to-br from-[#FF2D55] via-[#C13584] to-[#F59E0B] text-white shadow-pink-100",
      spark: "text-[#FF2D55]",
    },
  ];

  const quickActions = [
    {
      label: "Inbox",
      href: "/dashboard/inbox",
      icon: MessageCircle,
      className: "text-[#2D6BFF]",
    },
    {
      label: "Connect",
      href: "/connect",
      icon: Link2,
      className: "text-[#5B2BE2]",
    },
  ];

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      location.href = "/auth/login";
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F6FF] text-[#17112A]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#efe9ff_0,#f9f7ff_34%,#ffffff_70%)]" />

      <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col pb-[104px]">
        <header className="safe-top px-4 pt-4">
          <div className="flex items-center justify-between gap-3 rounded-[28px] bg-white/80 px-3.5 py-3 shadow-[0_16px_45px_rgba(42,16,90,0.08)] ring-1 ring-[#E6E2F4] backdrop-blur-xl">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#2A105A] shadow-sm ring-1 ring-[#E6E2F4]">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF2D55] px-1 text-[11px] font-black text-white">3</span>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#24123F]">سلام {userName} 👋</p>
                <p className="truncate text-[11px] font-medium text-[#6D6780]">خوش آمدی به شانیگرام</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#F3F4FF] to-[#EDE8FF] ring-2 ring-white">
                <span className="text-xl">👨🏻‍💼</span>
              </div>
            </div>
          </div>
        </header>

        <section className="px-4 pt-4">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#5B2BE2] via-[#722FE8] to-[#8E58FF] p-4 text-white shadow-[0_22px_50px_rgba(91,43,226,0.28)]">
            <div className="absolute -left-10 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 right-8 h-44 w-44 rounded-full bg-[#8E58FF]/60 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 pt-2">
                <h1 className="text-[30px] font-black leading-tight tracking-tight">Shanigram</h1>
                <p className="mt-2 text-[12px] font-medium leading-6 text-white/86">مدیریت هوشمند دایرکت و ارتباط با مشتریان</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-bold text-white/90 ring-1 ring-white/16">
                  <Sparkles className="h-3.5 w-3.5" />
                  طراح: جعفر عبدالهی
                </div>
              </div>
              <div className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-[26px] bg-white/12 ring-1 ring-white/20 backdrop-blur">
                <ShanigramMark className="h-[78px] w-[78px] brightness-0 invert drop-shadow-xl" />
              </div>
            </div>

            <NextLink
              href="/connect"
              className="relative mt-5 flex h-[58px] items-center justify-between rounded-2xl bg-white px-4 text-[#5B2BE2] shadow-[0_14px_30px_rgba(34,16,74,0.16)] active:scale-[0.99]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F3F4FF]">
                <Link2 className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2 text-[16px] font-black">
                <Plus className="h-5 w-5" /> اتصال پیج جدید
              </span>
            </NextLink>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 px-4 pt-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="overflow-hidden rounded-[24px] border-0 bg-white shadow-[0_14px_32px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
                <CardContent className="relative min-h-[118px] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl shadow-lg ${stat.iconWrap}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-black text-[#29223A]">{stat.label}</p>
                      <p className="mt-2 text-3xl font-black leading-none tracking-tight text-[#17112A]">{stat.value}</p>
                      <p className="mt-2 text-[11px] font-medium text-[#777187]">{stat.hint}</p>
                    </div>
                  </div>
                  <BarChart3 className={`absolute bottom-4 left-4 h-10 w-10 opacity-30 ${stat.spark}`} />
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="px-4 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-black text-[#17112A]">دسترسی سریع</h2>
            <Badge className="bg-[#F2EEFF] text-[#5B2BE2]">موبایل فرست</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={logout}
              className="flex h-[86px] flex-col items-center justify-center gap-2 rounded-[22px] bg-white text-[#FF3B30] shadow-[0_12px_28px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] active:scale-[0.98]"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-[12px] font-black text-[#29223A]">خروج</span>
            </button>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <NextLink
                  key={action.label}
                  href={action.href}
                  className="flex h-[86px] flex-col items-center justify-center gap-2 rounded-[22px] bg-white shadow-[0_12px_28px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] active:scale-[0.98]"
                >
                  <Icon className={`h-6 w-6 ${action.className}`} />
                  <span className="text-[12px] font-black text-[#29223A]">{action.label}</span>
                </NextLink>
              );
            })}
          </div>
        </section>

        <section className="px-4 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <NextLink href="/connect" className="flex items-center gap-1 text-[12px] font-black text-[#5B2BE2]">
              افزودن <ChevronLeft className="h-4 w-4" />
            </NextLink>
            <h2 className="text-[20px] font-black text-[#17112A]">پیج‌های متصل</h2>
          </div>

          {!data?.accounts.length ? (
            <div className="rounded-[26px] border border-dashed border-[#D8D2E8] bg-white/72 px-5 py-7 text-center shadow-[0_16px_38px_rgba(42,16,90,0.06)]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#F2EEFF] text-[#5B2BE2]">
                <Instagram className="h-8 w-8" />
              </div>
              <p className="mt-4 text-[15px] font-black text-[#17112A]">هنوز پیجی وصل نشده</p>
              <p className="mx-auto mt-2 max-w-[300px] text-[12px] font-medium leading-6 text-[#6D6780]">برای دریافت DM و Webhook، پیج اینستاگرام خود را متصل کنید.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.accounts.map((account, index) => (
                <Card key={account.id} className="rounded-[22px] border-0 bg-white shadow-[0_14px_30px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
                  <CardContent className="flex items-center gap-3 p-3.5">
                    <div className="grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#5B2BE2] to-[#8E58FF] text-white shadow-lg">
                      {account.profilePicUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={account.profilePicUrl} alt={account.username} className="h-full w-full object-cover" />
                      ) : index === 0 ? (
                        <ShanigramMark className="h-12 w-12 brightness-0 invert" />
                      ) : (
                        <Instagram className="h-6 w-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {index === 0 && <Badge className="bg-[#5B2BE2] text-white">اصلی</Badge>}
                        <p className="truncate text-[14px] font-black text-[#17112A]">{account.name || "رستوران شانشین"}</p>
                      </div>
                      <p className="mt-1 truncate text-[12px] font-medium text-[#6D6780]" dir="ltr">@{account.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-[#10B981]">متصل</span>
                      <MoreVertical className="h-5 w-5 text-[#8C8799]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="px-4 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-white p-4 shadow-[0_12px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <Bot className="h-6 w-6 text-[#5B2BE2]" />
              <p className="mt-3 text-[13px] font-black">اتوماسیون هوشمند</p>
              <p className="mt-1 text-[11px] leading-5 text-[#777187]">پاسخ خودکار و سناریوهای آماده</p>
            </div>
            <div className="rounded-[22px] bg-white p-4 shadow-[0_12px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <TrendingUp className="h-6 w-6 text-[#5B2BE2]" />
              <p className="mt-3 text-[13px] font-black">رشد کسب‌وکار</p>
              <p className="mt-1 text-[11px] leading-5 text-[#777187]">گزارش دقیق تعامل و مشتریان</p>
            </div>
          </div>
        </section>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-[#E9E4F5] bg-white/92 px-3 pb-2 pt-2 shadow-[0_-18px_40px_rgba(42,16,90,0.08)] backdrop-blur-xl">
        <div className="grid grid-cols-4 text-center">
          {[
            { icon: Settings, label: "تنظیمات", href: "/dashboard", active: false },
            { icon: Link2, label: "اتصال", href: "/connect", active: false },
            { icon: MessageCircle, label: "اینباکس", href: "/dashboard/inbox", active: false },
            { icon: Home, label: "داشبورد", href: "/dashboard", active: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NextLink
                key={item.label}
                href={item.href}
                className={`mx-1 flex h-[62px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition active:scale-[0.98] ${item.active ? "bg-[#F2EEFF] text-[#5B2BE2]" : "text-[#6D6780]"}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NextLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
