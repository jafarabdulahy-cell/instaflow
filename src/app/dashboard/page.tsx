"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import NextLink from "next/link";
import {
  ArrowUpRight,
  Bell,
  Bot,
  Camera,
  ChevronLeft,
  Clock3,
  Home,
  Link2,
  LogOut,
  MessageCircle,
  MessagesSquare,
  Plus,
  Settings,
  Sparkles,
  Target,
  UserPlus,
  UsersRound,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

type StatCard = {
  label: string;
  hint: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  cardClass: string;
  iconClass: string;
};

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("fa-IR");
}

function webhookText(status?: string) {
  return status === "connected" ? "متصل" : "در انتظار";
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
  const leadScore = useMemo(() => {
    const conversations = stats?.conversations ?? 0;
    const accounts = stats?.accounts ?? 0;
    if (!accounts && !conversations) return 0;
    return Math.min(100, Math.round(conversations * 12 + accounts * 18 + (isConnected ? 22 : 0)));
  }, [stats, isConnected]);

  const statCards: StatCard[] = [
    {
      label: "لیدهای فعال",
      hint: "از گفتگوهای ثبت‌شده",
      value: formatNumber(stats?.conversations),
      icon: UsersRound,
      cardClass: "from-[#24123F] to-[#5B2BE2] text-white",
      iconClass: "bg-white/15 text-white ring-white/20",
    },
    {
      label: "پیام‌های جدید",
      hint: "نیازمند پاسخ سریع",
      value: formatNumber(stats?.unread),
      icon: MessageCircle,
      cardClass: "from-[#0EA5E9] to-[#5B2BE2] text-white",
      iconClass: "bg-white/15 text-white ring-white/20",
    },
    {
      label: "پیج‌های متصل",
      hint: "اکانت‌های Business / Creator",
      value: formatNumber(stats?.accounts),
      icon: Camera,
      cardClass: "from-[#FF2D55] via-[#C13584] to-[#F59E0B] text-white",
      iconClass: "bg-white/15 text-white ring-white/20",
    },
    {
      label: "اتصال Webhook",
      hint: "وضعیت دریافت خودکار پیام",
      value: webhookText(stats?.webhookStatus),
      icon: Zap,
      cardClass: isConnected ? "from-[#10B981] to-[#2DD4BF] text-white" : "from-[#F59E0B] to-[#FF2D55] text-white",
      iconClass: "bg-white/15 text-white ring-white/20",
    },
  ];

  const pipelineCards = [
    { label: "لید جدید", count: stats?.unread ?? 0, icon: UserPlus, tone: "bg-[#FFF1F4] text-[#FF2D55]" },
    { label: "در حال گفتگو", count: stats?.conversations ?? 0, icon: MessagesSquare, tone: "bg-[#F2EEFF] text-[#5B2BE2]" },
    { label: "پیگیری امروز", count: Math.max(0, Math.min(3, stats?.conversations ?? 0)), icon: Clock3, tone: "bg-[#ECFEFF] text-[#0891B2]" },
  ];

  function logout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      location.href = "/auth/login";
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F1FF] text-[#17112A]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#e9ddff_0,#f8f6ff_34%,#ffffff_72%)]" />

      <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-5 px-4 pb-[104px] pt-4 lg:grid-cols-[1fr_390px] lg:items-start lg:px-6 lg:pb-8">
        <section className="order-2 space-y-5 lg:order-1">
          <header className="rounded-[32px] bg-white/82 p-4 shadow-[0_20px_60px_rgba(42,16,90,0.08)] ring-1 ring-[#E9E2FA] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={logout}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFF1F2] text-[#FF3B30] ring-1 ring-[#FFE1E6] active:scale-[0.98]"
                aria-label="خروج"
              >
                <LogOut className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-black text-[#1F1831]">سلام {userName} 👋</p>
                  <p className="truncate text-[12px] font-bold text-[#7C748E]">امروز لیدها را سریع‌تر تبدیل کن</p>
                </div>
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F2EEFF] to-white text-xl shadow-inner ring-1 ring-[#E6DCF8]">
                  👨🏻‍💼
                  <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF2D55] px-1 text-[11px] font-black text-white">
                    {formatNumber(stats?.unread)}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className={`overflow-hidden rounded-[30px] border-0 bg-gradient-to-br ${stat.cardClass} shadow-[0_20px_50px_rgba(42,16,90,0.14)]`}>
                  <CardContent className="relative min-h-[148px] p-4">
                    <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-white/12 blur-2xl" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 ${stat.iconClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-black opacity-90">{stat.label}</p>
                        <p className="mt-3 text-[30px] font-black leading-none tracking-tight">{stat.value}</p>
                        <p className="mt-3 text-[11px] font-bold opacity-78">{stat.hint}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="overflow-hidden rounded-[32px] border-0 bg-white shadow-[0_20px_55px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
              <CardContent className="p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <Badge className="bg-[#F2EEFF] px-3 py-1.5 text-[#5B2BE2]">CRM زنده</Badge>
                  <div className="text-right">
                    <h2 className="text-[20px] font-black">مسیر تبدیل مشتری</h2>
                    <p className="mt-1 text-[12px] font-bold text-[#7C748E]">از دایرکت تا پیگیری و فروش</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {pipelineCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-[26px] bg-[#FAF9FF] p-4 ring-1 ring-[#EEE8FA]">
                        <div className={`mb-5 grid h-11 w-11 place-items-center rounded-2xl ${item.tone}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-[12px] font-black text-[#6D6780]">{item.label}</p>
                        <p className="mt-2 text-[28px] font-black text-[#17112A]">{formatNumber(item.count)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#17112A] to-[#37215F] p-4 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/12 text-[22px] font-black ring-1 ring-white/14">
                      {formatNumber(leadScore)}٪
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-black">امتیاز آماده‌سازی فروش</p>
                      <p className="mt-2 text-[12px] font-medium leading-6 text-white/72">
                        با اتصال Webhook و پاسخ سریع به پیام‌ها، امتیاز تبدیل مشتری بالاتر می‌رود.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[32px] border-0 bg-white shadow-[0_20px_55px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <NextLink href="/connect" className="inline-flex items-center gap-1 rounded-full bg-[#F2EEFF] px-3 py-1.5 text-[12px] font-black text-[#5B2BE2]">
                    افزودن <ChevronLeft className="h-4 w-4" />
                  </NextLink>
                  <h2 className="text-[18px] font-black">پیج‌های متصل</h2>
                </div>

                {!data?.accounts.length ? (
                  <div className="rounded-[28px] border border-dashed border-[#D8CEEE] bg-[#FAF9FF] p-5 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white text-[#5B2BE2] shadow-sm">
                      <Link2 className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-[15px] font-black">هنوز پیجی متصل نیست</p>
                    <p className="mx-auto mt-2 max-w-[260px] text-[12px] font-medium leading-6 text-[#7C748E]">
                      برای شروع دریافت لیدها، یک پیج Business یا Creator را متصل کن.
                    </p>
                    <NextLink href="/connect" className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-[#5B2BE2] px-5 text-[13px] font-black text-white shadow-lg shadow-violet-200">
                      اتصال پیج
                    </NextLink>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between gap-3 rounded-[24px] bg-[#FAF9FF] p-3 ring-1 ring-[#EEE8FA]">
                        <Badge className={account.webhookStatus === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                          {webhookText(account.webhookStatus)}
                        </Badge>
                        <div className="flex min-w-0 items-center gap-3 text-right">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-black">{account.name || account.username}</p>
                            <p className="truncate text-[11px] font-bold text-[#7C748E]" dir="ltr">@{account.username}</p>
                          </div>
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FF2D55] to-[#5B2BE2] text-white">
                            <Camera className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </section>

        <aside className="order-1 lg:sticky lg:top-4 lg:order-2">
          <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#5B2BE2] via-[#7436F0] to-[#9A63FF] p-5 text-white shadow-[0_28px_80px_rgba(91,43,226,0.3)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-white/13 ring-1 ring-white/20">
                <ShanigramMark className="h-[72px] w-[72px] brightness-0 invert" />
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1 text-[11px] font-black text-white/85 ring-1 ring-white/12">
                  <Sparkles className="h-3.5 w-3.5" /> Instaflow CRM
                </p>
                <h1 className="mt-4 text-[34px] font-black leading-none tracking-tight">Shanigram</h1>
                <p className="mt-3 text-[12px] font-medium leading-6 text-white/78">
                  داشبورد موبایل‌محور برای مدیریت دایرکت، لید و پیگیری مشتریان اینستاگرام.
                </p>
              </div>
            </div>

            <NextLink
              href="/dashboard/inbox"
              className="flex h-[62px] items-center justify-between rounded-[22px] bg-white px-4 text-[#5B2BE2] shadow-[0_18px_35px_rgba(34,16,74,0.18)] active:scale-[0.99]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF]">
                <ArrowUpRight className="h-5 w-5" />
              </span>
              <span className="text-[16px] font-black">رفتن به اینباکس مشتریان</span>
            </NextLink>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <NextLink href="/dashboard" className="flex h-[78px] flex-col items-center justify-center gap-2 rounded-[24px] bg-white text-[#5B2BE2] shadow-[0_12px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
              <Home className="h-5 w-5" />
              <span className="text-[12px] font-black">داشبورد</span>
            </NextLink>
            <NextLink href="/dashboard/inbox" className="flex h-[78px] flex-col items-center justify-center gap-2 rounded-[24px] bg-white text-[#17112A] shadow-[0_12px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
              <MessageCircle className="h-5 w-5" />
              <span className="text-[12px] font-black">اینباکس</span>
            </NextLink>
            <NextLink href="/connect" className="flex h-[78px] flex-col items-center justify-center gap-2 rounded-[24px] bg-white text-[#17112A] shadow-[0_12px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
              <Settings className="h-5 w-5" />
              <span className="text-[12px] font-black">اتصال</span>
            </NextLink>
          </div>
        </aside>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ECE8F6] bg-white/92 px-4 py-2 shadow-[0_-18px_45px_rgba(42,16,90,0.1)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-[430px] grid-cols-3 gap-2 safe-bottom">
            <NextLink href="/dashboard" className="flex flex-col items-center justify-center rounded-2xl bg-[#F2EEFF] py-2 text-[#5B2BE2]">
              <Home className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">داشبورد</span>
            </NextLink>
            <NextLink href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-2xl py-2 text-[#6D6780]">
              <MessageCircle className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">اینباکس</span>
            </NextLink>
            <NextLink href="/connect" className="flex flex-col items-center justify-center rounded-2xl py-2 text-[#6D6780]">
              <Bot className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">اتصال</span>
            </NextLink>
          </div>
        </nav>
      </main>
    </div>
  );
}
