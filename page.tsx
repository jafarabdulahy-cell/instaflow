"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
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

const filters = [
  ["all", "همه"],
  ["unread", "خوانده‌نشده"],
  ["vip", "VIP"],
];

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

function formatCount(value: number) {
  return value.toLocaleString("fa-IR");
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F6FF] pb-[104px] text-[#17112A]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#efe9ff_0,#f9f7ff_38%,#ffffff_76%)]" />

      <header className="safe-top sticky top-0 z-20 border-b border-[#E9E4F5] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[430px] px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2] shadow-sm ring-1 ring-[#E6E2F4]"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="min-w-0 flex-1 text-right">
              <p className="text-[12px] font-black text-[#8A8498]">مرکز پیام‌ها</p>
              <h1 className="text-[22px] font-black tracking-tight text-[#17112A]">اینباکس اینستاگرام</h1>
            </div>

            <Badge className="h-9 rounded-full bg-[#5B2BE2] px-3 text-white">
              {formatCount(items.length)} گفتگو
            </Badge>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8498]" />
            <Input
              placeholder="جستجوی نام، یوزرنیم یا متن پیام..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-12 rounded-2xl border-[#E6E2F4] bg-[#FAF9FF] pr-10 text-right font-bold text-[#17112A] placeholder:text-[#9A94AA]"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`h-10 shrink-0 rounded-full px-4 text-xs font-black transition active:scale-[0.98] ${
                  filter === key
                    ? "bg-[#5B2BE2] text-white shadow-[0_10px_22px_rgba(91,43,226,0.24)]"
                    : "bg-white text-[#6D6780] ring-1 ring-[#ECE8F6]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[430px] px-4 pt-4">
        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white p-4 shadow-[0_14px_32px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <MessageCircle className="h-6 w-6 text-[#5B2BE2]" />
            <p className="mt-3 text-2xl font-black text-[#17112A]">{formatCount(items.length)}</p>
            <p className="text-[11px] font-bold text-[#777187]">کل گفتگوها</p>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-[0_14px_32px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <Sparkles className="h-6 w-6 text-[#FF2D55]" />
            <p className="mt-3 text-2xl font-black text-[#17112A]">{formatCount(unreadTotal)}</p>
            <p className="text-[11px] font-bold text-[#777187]">پیام جدید</p>
          </div>
        </section>

        {!items.length ? (
          <div className="rounded-[30px] border border-dashed border-[#D8D2E8] bg-white/82 px-6 py-9 text-center shadow-[0_16px_38px_rgba(42,16,90,0.06)]">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#F2EEFF] text-[#5B2BE2]">
              <MessageCircle className="h-8 w-8" />
            </div>
            <p className="mt-4 text-[16px] font-black text-[#17112A]">هنوز گفتگویی ثبت نشده</p>
            <p className="mx-auto mt-2 max-w-[310px] text-[12px] font-medium leading-6 text-[#6D6780]">
              بعد از اتصال پیج و دریافت Webhook، پیام‌ها اینجا نمایش داده می‌شوند.
            </p>
            <Link
              href="/connect"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#5B2BE2] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(91,43,226,0.22)]"
            >
              اتصال پیج
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((conversation) => {
              const title = conversation.displayName || conversation.username || "مخاطب اینستاگرام";
              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/inbox/${conversation.id}`}
                  className="block rounded-[26px] bg-white p-3.5 shadow-[0_14px_30px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6] transition active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-[#5B2BE2] via-[#8E58FF] to-[#FF2D55] text-lg font-black text-white shadow-lg">
                      {title.slice(0, 1)}
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {conversation.isVip && (
                          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-amber-50 px-2 text-[10px] font-black text-amber-700">
                            <Crown className="h-3 w-3" /> VIP
                          </span>
                        )}
                        <p className="truncate text-[14px] font-black text-[#17112A]">{title}</p>
                      </div>
                      <p className="mt-1 truncate text-[12px] font-medium text-[#6D6780]">
                        {conversation.lastMessage || "بدون متن"}
                      </p>
                      <p className="mt-1 truncate text-[10px] font-bold text-[#9A94AA]" dir="ltr">
                        @{conversation.instagramAccount?.username || "instagram"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      {conversation.unreadCount > 0 ? (
                        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#FF2D55] px-2 text-xs font-black text-white shadow-[0_8px_16px_rgba(255,45,85,0.2)]">
                          {formatCount(conversation.unreadCount)}
                        </span>
                      ) : (
                        <UserRound className="h-5 w-5 text-[#C3BDD2]" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-[#E9E4F5] bg-white/92 px-3 pb-2 pt-2 shadow-[0_-18px_40px_rgba(42,16,90,0.08)] backdrop-blur-xl">
        <div className="grid grid-cols-4 text-center">
          {[
            { icon: Settings, label: "تنظیمات", href: "/dashboard", active: false },
            { icon: Link2, label: "اتصال", href: "/connect", active: false },
            { icon: MessageCircle, label: "اینباکس", href: "/dashboard/inbox", active: true },
            { icon: Home, label: "داشبورد", href: "/dashboard", active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`mx-1 flex h-[62px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition active:scale-[0.98] ${
                  item.active ? "bg-[#F2EEFF] text-[#5B2BE2]" : "text-[#6D6780]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
