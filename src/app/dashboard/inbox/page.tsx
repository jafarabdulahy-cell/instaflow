"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function InboxPage() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams({ filter });
    if (q) params.set("q", q);
    fetch(`/api/inbox?${params}`).then((res) => {
      if (res.status === 401) window.location.href = "/auth/login";
      return res.json();
    }).then((json) => setItems(json.conversations || [])).catch(() => setItems([]));
  }, [q, filter]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-24">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 safe-top">
        <div className="px-4 py-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="text-slate-500">←</Link>
            <h1 className="font-extrabold text-lg">Inbox</h1>
            <Badge variant="brand">{items.length.toLocaleString("fa-IR")}</Badge>
          </div>
          <Input placeholder="جستجوی نام، یوزرنیم یا متن پیام..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-slate-50 border-slate-200" />
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {[["all","همه"],["unread","خوانده نشده"],["vip","VIP"]].map(([key,label]) => (
              <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter===key ? "bg-[#6d5dfc] text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {!items.length ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-slate-100">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-extrabold">هنوز گفتگویی ثبت نشده</p>
            <p className="text-xs text-slate-500 mt-2 leading-6">بعد از اتصال Instagram و دریافت Webhook، پیام‌ها اینجا نمایش داده می‌شوند.</p>
            <Link href="/connect" className="inline-flex mt-5 px-4 py-2 rounded-xl bg-[#6d5dfc] text-white text-sm font-bold">اتصال پیج</Link>
          </div>
        ) : items.map((c) => (
          <Link key={c.id} href={`/dashboard/inbox/${c.id}`} className="block rounded-3xl bg-white p-4 shadow-sm border border-slate-100 active:scale-[0.99] transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center font-black">
                {(c.displayName || c.username || "U").slice(0,1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-slate-950 truncate">{c.displayName || c.username || "مخاطب اینستاگرام"}</p>
                  {c.unreadCount > 0 && <span className="min-w-6 h-6 px-2 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">{c.unreadCount}</span>}
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">{c.lastMessage || "بدون متن"}</p>
                <p className="text-[10px] text-slate-400 mt-2" dir="ltr">@{c.instagramAccount?.username || "instagram"}</p>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
