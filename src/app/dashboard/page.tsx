"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type DashboardData = {
  stats: {
    accounts: number;
    conversations: number;
    unread: number;
    webhookEvents: number;
    webhookStatus: string;
  };
  accounts: Array<{ id: string; username: string; name?: string; profilePicUrl?: string; webhookStatus: string; followersCount: number }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("کاربر");

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.status === 401) window.location.href = "/auth/login";
      const json = await res.json();
      if (json.user?.name) setUserName(json.user.name);
    });
    fetch("/api/dashboard").then((res) => res.json()).then(setData).catch(() => setData(null));
  }, []);

  const stats = [
    { label: "DM جدید", value: data?.stats.unread ?? 0, icon: "💬", tone: "from-violet-500 to-fuchsia-500" },
    { label: "گفتگوها", value: data?.stats.conversations ?? 0, icon: "👥", tone: "from-sky-500 to-cyan-500" },
    { label: "پیج‌ها", value: data?.stats.accounts ?? 0, icon: "📸", tone: "from-rose-500 to-orange-400" },
    { label: "Webhook", value: data?.stats.webhookStatus === "connected" ? "Online" : "Pending", icon: "⚡", tone: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-24">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-slate-200 safe-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">سلام {userName} 👋</p>
            <h1 className="text-xl font-extrabold text-slate-950">InstaFlow</h1>
          </div>
          <Badge variant={data?.stats.webhookStatus === "connected" ? "success" : "warning"}>
            {data?.stats.webhookStatus === "connected" ? "متصل" : "در انتظار اتصال"}
          </Badge>
        </div>
      </header>

      <main className="px-4 pt-5 space-y-5 max-w-md mx-auto">
        <section className="rounded-3xl p-5 text-white shadow-xl bg-gradient-to-br from-[#6d5dfc] via-[#8b5cf6] to-[#ec4899]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm/6 opacity-90">هسته فاز ۱</p>
              <h2 className="text-2xl font-extrabold mt-1">Inbox Core</h2>
              <p className="text-xs/6 opacity-85 mt-2">اتصال اینستاگرام، دریافت وبهوک، مدیریت گفتگوها و آماده برای CRM.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">✨</div>
          </div>
          <Button asChild className="mt-5 w-full bg-white text-[#6d5dfc] hover:bg-white/90">
            <Link href="/connect">+ اتصال پیج جدید</Link>
          </Button>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="overflow-hidden border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.tone} flex items-center justify-center text-lg text-white`}>{s.icon}</div>
                <p className="mt-3 text-xs text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Link href="/dashboard/inbox" className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-100">
            <div className="text-2xl">💬</div><p className="text-xs font-bold mt-2">Inbox</p>
          </Link>
          <Link href="/connect" className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-100">
            <div className="text-2xl">🔗</div><p className="text-xs font-bold mt-2">Connect</p>
          </Link>
          <button onClick={() => fetch('/api/auth/logout',{method:'POST'}).then(()=>location.href='/auth/login')} className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-100">
            <div className="text-2xl">🚪</div><p className="text-xs font-bold mt-2">خروج</p>
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-950">پیج‌های متصل</h3>
            <Link href="/connect" className="text-xs font-bold text-[#6d5dfc]">افزودن</Link>
          </div>
          {!data?.accounts.length ? (
            <Card className="bg-white border-dashed">
              <CardContent className="p-5 text-center">
                <div className="text-3xl mb-2">📸</div>
                <p className="font-bold text-sm">هنوز پیجی وصل نشده</p>
                <p className="text-xs text-slate-500 mt-1">برای دریافت DM و Webhook، پیج Business یا Creator را وصل کن.</p>
              </CardContent>
            </Card>
          ) : data.accounts.map((account) => (
            <Card key={account.id} className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-black">
                  {account.profilePicUrl ? "" : account.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm truncate" dir="ltr">@{account.username}</p>
                  <p className="text-xs text-slate-500">{account.followersCount.toLocaleString("fa-IR")} follower</p>
                </div>
                <Badge variant="success">Webhook</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 text-center">
          {[
            ["🏠", "داشبورد", "/dashboard"],
            ["💬", "اینباکس", "/dashboard/inbox"],
            ["🔗", "اتصال", "/connect"],
            ["⚙️", "تنظیمات", "/dashboard"],
          ].map(([icon, label, href]) => (
            <Link key={label} href={href} className="py-3 text-slate-500 hover:text-[#6d5dfc]">
              <div className="text-xl">{icon}</div><div className="text-[10px] mt-1">{label}</div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
