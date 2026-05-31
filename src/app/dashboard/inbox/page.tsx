"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Home, Link2, MessageCircle, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

const filters = [
  ["all", "همه"],
  ["unread", "جدید"],
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

function formatName(item: Conversation) {
  return item.displayName || item.username || "کاربر اینستاگرام";
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
    <div className="h-[100dvh] overflow-hidden bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex h-full w-full max-w-[430px] flex-col gap-3 px-4 pb-3 pt-3">
        <header className="h-[168px] shrink-0 overflow-hidden rounded-[34px] bg-gradient-to-br from-[#24123F] via-[#5B2BE2] to-[#8E58FF] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="flex items-start justify-between gap-3">
            <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
                <Sparkles className="h-3.5 w-3.5" /> مرکز پیام‌ها
              </p>
              <h1 className="mt-2 text-[28px] font-black leading-none">اینباکس مشتریان</h1>
              <p className="mt-2 text-[12px] font-bold text-white/68">دایرکت‌ها، لیدها و VIPها در یک نمای کوتاه</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <MessageCircle className="mx-auto h-4 w-4" />
              <p className="mt-1 text-[22px] font-black leading-none">{formatCount(items.length)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">گفتگو</p>
            </div>
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <span className="mx-auto grid h-4 w-4 place-items-center rounded-full bg-[#FF2D55] text-[9px] font-black">!</span>
              <p className="mt-1 text-[22px] font-black leading-none">{formatCount(unreadTotal)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">جدید</p>
            </div>
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <Crown className="mx-auto h-4 w-4 text-[#FFD66B]" />
              <p className="mt-1 text-[22px] font-black leading-none">{formatCount(vipTotal)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">VIP</p>
            </div>
          </div>
        </header>

        <section className="h-[102px] shrink-0 rounded-[28px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="flex h-11 items-center gap-2 rounded-[20px] bg-[#FAF9FF] px-3 ring-1 ring-[#ECE8F6]">
            <Search className="h-5 w-5 text-[#8A8498]" />
            <Input
              placeholder="جستجوی نام یا متن پیام..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {filters.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`h-9 rounded-2xl text-[12px] font-black transition active:scale-95 ${
                  filter === key ? "bg-[#5B2BE2] text-white shadow-lg shadow-violet-200" : "bg-[#F8F6FF] text-[#6D6780] ring-1 ring-[#ECE8F6]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto rounded-[30px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          {!items.length ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[#DAD1EF] bg-[#FAF9FF] p-5 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-[#F2EEFF] text-[#5B2BE2]">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-[17px] font-black">هنوز گفتگویی ثبت نشده</h2>
              <p className="mt-2 max-w-[280px] text-[12px] font-bold leading-6 text-[#7C748E]">
                بعد از اتصال پیج، پیام‌ها همینجا کوتاه و مرتب نمایش داده می‌شوند.
              </p>
              <Link href="/connect" className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-[#5B2BE2] px-5 text-[13px] font-black text-white shadow-lg shadow-violet-200">
                اتصال پیج
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/dashboard/inbox/${conversation.id}`}
                  className="flex items-center gap-3 rounded-[24px] bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6] active:scale-[0.99]"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-[#FF2D55] via-[#8E58FF] to-[#5B2BE2] text-lg font-black text-white">
                    {formatName(conversation).slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {conversation.isVip && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">VIP</span>}
                      <p className="truncate text-[14px] font-black">{formatName(conversation)}</p>
                    </div>
                    <p className="mt-1 truncate text-[12px] font-bold text-[#6D6780]">{conversation.lastMessage || "بدون متن"}</p>
                    <p className="mt-1 truncate text-[10px] font-bold text-[#9A93AA]" dir="ltr">
                      @{conversation.instagramAccount?.username || conversation.username || "instagram"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[#FF2D55] px-2 text-[11px] font-black text-white">
                      {formatCount(conversation.unreadCount)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        <nav className="h-[66px] shrink-0 rounded-[26px] bg-white/96 p-2 shadow-[0_-10px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] safe-bottom">
          <div className="grid h-full grid-cols-3 gap-2">
            <Link href="/dashboard" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]">
              <Home className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">داشبورد</span>
            </Link>
            <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]">
              <MessageCircle className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">اینباکس</span>
            </Link>
            <Link href="/connect" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]">
              <Link2 className="h-5 w-5" />
              <span className="mt-1 text-[11px] font-black">اتصال</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
