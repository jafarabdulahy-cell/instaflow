"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Home, Link2, Loader2, MessageCircle, RefreshCcw, UsersRound, XCircle, Zap } from "lucide-react";

type Log = { id: string; type: string; processed: boolean; createdAt: string; senderId?: string };

function dateText(value: string) {
  try { return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); } catch { return value; }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/automation/logs", { cache: "no-store" });
    if (res.status === 401) location.assign("/auth/login");
    const json = await res.json().catch(() => ({}));
    setLogs(json.logs || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur"><div className="flex items-center justify-between gap-3"><Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link><h1 className="text-[22px] font-black">لاگ اتوماسیون</h1><button onClick={load} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><RefreshCcw className="h-4 w-4" /></button></div></header>
        <section className="rounded-[24px] bg-[#F4EBFF] p-3 text-right text-[12px] font-bold leading-6 text-[#5B2BE2] ring-1 ring-[#E6D6FF]">آخرین Webhookها و رخدادهای پردازش‌شده برای بررسی اینکه پیام از Meta رسیده یا نه.</section>
        {loading && <section className="rounded-[24px] bg-white p-4 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></section>}
        <section className="space-y-3">
          {logs.map((log) => (
            <article key={log.id} className="rounded-[24px] bg-white p-3 text-right shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-center justify-between gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${log.processed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{log.processed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</div>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-black text-[#24123F]">{log.type || "event"}</p><p className="mt-1 text-[11px] font-bold text-[#8A8498]">{dateText(log.createdAt)}</p></div>
                <Activity className="h-5 w-5 text-[#5B2BE2]" />
              </div>
              <p className="mt-3 rounded-2xl bg-[#FBFAFF] p-2 text-[10px] font-bold text-[#6D6780] ring-1 ring-[#ECE8F6]">{log.processed ? "پردازش شد" : "ثبت شد ولی پردازش انجام نشد"}{log.senderId ? ` | sender: ${log.senderId}` : ""}</p>
            </article>
          ))}
          {!loading && !logs.length && <section className="rounded-[24px] bg-white p-4 text-center text-[12px] font-bold text-[#6D6780] ring-1 ring-[#ECE8F6]">هنوز لاگی ثبت نشده است.</section>}
        </section>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] rounded-t-[26px] bg-white/96 px-4 py-3 shadow-[0_-18px_36px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6] backdrop-blur"><div className="grid h-full grid-cols-5 gap-1 text-center text-[9px] font-black text-[#6D6780]"><Link href="/dashboard"><Home className="mx-auto h-5 w-5" /><span>خانه</span></Link><Link href="/dashboard/inbox"><MessageCircle className="mx-auto h-5 w-5" /><span>اینباکس</span></Link><Link href="/dashboard/automation/rules"><Zap className="mx-auto h-5 w-5" /><span>قوانین</span></Link><Link href="/dashboard/leads"><UsersRound className="mx-auto h-5 w-5" /><span>لیدها</span></Link><Link href="/connect"><Link2 className="mx-auto h-5 w-5" /><span>اتصال</span></Link></div></nav>
    </div>
  );
}
