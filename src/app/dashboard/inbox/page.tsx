"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Clock3,
  Crown,
  Home,
  Link2,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Conversation = {
  id: string;
  username?: string;
  displayName?: string;
  lastMessage?: string;
  unreadCount: number;
  isVip: boolean;
  updatedAt: string;
  instagramAccount?: { username: string };
};

const filters = [
  ["all", "همه"],
  ["unread", "خوانده‌نشده"],
  ["vip", "VIP"],
];

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function formatName(item: Conversation) {
  return item.displayName || item.username || "مخاطب اینستاگرام";
}

export default function InboxPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams({ filter });
    if (q) params.set("q", q);

    fetch(`/api/inbox?${params}`)
      .then((res) => {
        if (res.status === 401) window.location.href = "/auth/login";
        return res.json();
      })
      .then((json) => setItems(json.conversations || []))
      .catch(() => setItems([]));
  }, [q, filter]);

  const unreadTotal = useMemo(() => items.reduce((sum, item) => sum + item.unreadCount, 0), [items]);
  const vipTotal = useMemo(() => items.filter((item) => item.isVip).length, [items]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F1FF] text-[#17112A]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,#eadfff_0,#faf8ff_42%,#ffffff_78%)]" />

      <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-5 px-4 pb-[104px] pt-4 lg:grid-cols-[390px_1fr] lg:px-6 lg:pb-8">
        <aside className="lg:sticky lg:top-4">
          <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#17112A] via-[#35205C] to-[#5B2BE2] p-5 text-white shadow-[0_28px_80px_rgba(42,16,90,0.28)]">
            <div className="flex items-start justify-between gap-3">
              <Link href="/dashboard" className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 text-white ring-1 ring-white/14 active:scale-[0.98]">
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="text-right">
                <p className="text-[12px] font-black text-white/70">مرکز پیام‌ها</p>
                <h1 className="mt-2 text-[30px] font-black leading-tight">اینباکس مشتریان</h1>
                <p className="mt-3 max-w-[280px] text-[12px] font-medium leading-6 text-white/72">
                  گفتگوهای اینستاگرام را مثل یک CRM پیگیری کن؛ لید جدید، VIP و پیام‌های خوانده‌نشده جدا می‌شوند.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-[22px] bg-white/10 p-3 text-center ring-1 ring-white/12">
                <MessageCircle className="mx-auto h-5 w-5 text-white/85" />
                <p className="mt-2 text-[22px] font-black">{formatNumber(items.length)}</p>
                <p className="text-[10px] font-bold text-white/62">گفتگو</p>
              </div>
              <div className="rounded-[22px] bg-white/10 p-3 text-center ring-1 ring-white/12">
                <BellRing className="mx-auto h-5 w-5 text-[#FFDF6E]" />
                <p className="mt-2 text-[22px] font-black">{formatNumber(unreadTotal)}</p>
                <p className="text-[10px] font-bold text-white/62">جدید</p>
              </div>
              <div className="rounded-[22px] bg-white/10 p-3 text-center ring-1 ring-white/12">
                <Crown className="mx-auto h-5 w-5 text-[#FBBF24]" />
                <p className="mt-2 text-[22px] font-black">{formatNumber(vipTotal)}</p>
                <p className="text-[10px] font-bold text-white/62">VIP</p>
              </div>
            </div>

            <Link href="/connect" className="mt-4 flex h-12 items-center justify-between rounded-2xl bg-white px-4 text-[#5B2BE2] shadow-[0_18px_35px_rgba(0,0,0,0.14)]">
              <Link2 className="h-5 w-5" />
              <span className="text-[13px] font-black">اتصال پیج جدید</span>
            </Link>
          </section>
        </aside>

        <section className="space-y-4">
          <header className="rounded-[32px] bg-white/88 p-4 shadow-[0_20px_55px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <Badge className="bg-[#F2EEFF] px-3 py-1.5 text-[#5B2BE2]">
                <Sparkles className="ml-1 h-3.5 w-3.5" /> CRM Inbox
              </Badge>
              <div className="text-right">
                <h2 className="text-[21px] font-black">پیام‌ها و لیدها</h2>
                <p className="mt-1 text-[12px] font-bold text-[#7C748E]">جستجو، فیلتر و پاسخ سریع</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[22px] bg-[#FAF9FF] px-3 py-2 ring-1 ring-[#ECE8F6]">
              <Search className="h-5 w-5 text-[#8A8498]" />
              <Input
                placeholder="جستجوی نام، یوزرنیم یا متن پیام..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {filters.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`h-10 rounded-full px-4 text-[12px] font-black whitespace-nowrap transition active:scale-[0.98] ${
                    filter === key
                      ? "bg-[#5B2BE2] text-white shadow-lg shadow-violet-200"
                      : "bg-white text-[#6D6780] ring-1 ring-[#ECE8F6]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "اولویت امروز", value: unreadTotal, icon: BellRing, tone: "bg-[#FFF1F4] text-[#FF2D55]" },
              { label: "کل گفتگوها", value: items.length, icon: MessageCircle, tone: "bg-[#F2EEFF] text-[#5B2BE2]" },
              { label: "نیازمند پیگیری", value: Math.min(items.length, 3), icon: Clock3, tone: "bg-[#ECFEFF] text-[#0891B2]" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[26px] bg-white p-4 shadow-[0_14px_35px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
                  <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[12px] font-black text-[#7C748E]">{card.label}</p>
                  <p className="mt-1 text-[28px] font-black">{formatNumber(card.value)}</p>
                </div>
              );
            })}
          </div>

          {!items.length ? (
            <div className="overflow-hidden rounded-[36px] bg-white p-6 text-center shadow-[0_20px_60px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6]">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-[30px] bg-[#F2EEFF] text-[#5B2BE2] shadow-inner">
                <MessageCircle className="h-9 w-9" />
              </div>
              <h3 className="mt-5 text-[20px] font-black">هنوز گفتگویی ثبت نشده</h3>
              <p className="mx-auto mt-3 max-w-[360px] text-[13px] font-medium leading-7 text-[#6D6780]">
                بعد از اتصال پیج و دریافت Webhook، پیام‌ها اینجا نمایش داده می‌شوند و می‌توانی آن‌ها را به لید، مشتری یا VIP تبدیل کنی.
              </p>
              <Link href="/connect" className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-[#5B2BE2] px-6 text-[14px] font-black text-white shadow-lg shadow-violet-200">
                اتصال پیج
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/dashboard/inbox/${conversation.id}`}
                  className="group grid gap-3 rounded-[30px] bg-white p-4 shadow-[0_14px_35px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(42,16,90,0.12)] sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:order-3">
                    <div className="grid h-14 w-14 place-items-center rounded-[22px] bg-gradient-to-br from-[#FF2D55] via-[#8E58FF] to-[#5B2BE2] text-[20px] font-black text-white shadow-lg shadow-violet-100">
                      {formatName(conversation).slice(0, 1)}
                    </div>
                    <div className="min-w-0 text-right sm:hidden">
                      <p className="truncate text-[15px] font-black">{formatName(conversation)}</p>
                      <p className="mt-1 truncate text-[11px] font-bold text-[#8A8498]" dir="ltr">
                        @{conversation.instagramAccount?.username || conversation.username || "instagram"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden min-w-0 text-right sm:block sm:order-2">
                    <p className="truncate text-[15px] font-black">{formatName(conversation)}</p>
                    <p className="mt-1 truncate text-[12px] font-medium text-[#6D6780]">{conversation.lastMessage || "بدون متن"}</p>
                    <p className="mt-2 truncate text-[11px] font-bold text-[#8A8498]" dir="ltr">
                      @{conversation.instagramAccount?.username || conversation.username || "instagram"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:order-1 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2">
                      {conversation.isVip && <Badge className="bg-amber-50 text-amber-700">VIP</Badge>}
                      {conversation.unreadCount > 0 && (
                        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#FF2D55] px-2 text-[12px] font-black text-white">
                          {formatNumber(conversation.unreadCount)}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A8498]">
                      <UserRound className="h-3.5 w-3.5" /> باز کردن گفتگو
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ECE8F6] bg-white/92 px-4 py-2 shadow-[0_-18px_45px_rgba(42,16,90,0.1)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-[430px] grid-cols-3 gap-2 safe-bottom">
            <Link href="/dashboard" className="flex flex-col items-center justify-center rounded-2xl py-2 text-[#6D6780]">
              <Home className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">داشبورد</span>
            </Link>
            <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-2xl bg-[#F2EEFF] py-2 text-[#5B2BE2]">
              <MessageCircle className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">اینباکس</span>
            </Link>
            <Link href="/connect" className="flex flex-col items-center justify-center rounded-2xl py-2 text-[#6D6780]">
              <Settings className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">اتصال</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
