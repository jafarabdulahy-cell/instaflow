"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Bot, CheckCircle2, Loader2, MessageCircle, MessageSquare, RefreshCcw, XCircle, Zap } from "lucide-react";
import { AppNav } from "@/components/app-nav";

type Log = {
  id: string;
  type: string;
  processed: boolean;
  createdAt: string;
  senderId?: string;
};

function dateText(value: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

type EventMeta = { label: string; color: string; icon: React.ReactNode };

function eventMeta(type: string): EventMeta {
  if (type === "message") return { label: "دایرکت جدید", color: "bg-blue-50 text-blue-700 ring-blue-100", icon: <MessageCircle className="h-4 w-4" /> };
  if (type === "change") return { label: "تعامل / کامنت", color: "bg-pink-50 text-pink-700 ring-pink-100", icon: <MessageSquare className="h-4 w-4" /> };
  if (type === "auto_reply") return { label: "پاسخ خودکار", color: "bg-emerald-50 text-emerald-700 ring-emerald-100", icon: <Bot className="h-4 w-4" /> };
  if (type === "webhook") return { label: "Webhook", color: "bg-violet-50 text-violet-700 ring-violet-100", icon: <Zap className="h-4 w-4" /> };
  return { label: type || "رویداد", color: "bg-[#F2EEFF] text-[#5B2BE2] ring-[#E6DCF8]", icon: <Activity className="h-4 w-4" /> };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/automation/logs", { cache: "no-store" });
    if (res.status === 401) { location.assign("/auth/login"); return; }
    const json = await res.json().catch(() => ({}));
    setLogs(json.logs || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">

        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="text-[22px] font-black">لاگ اتوماسیون</h1>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#5B2BE2] ring-1 ring-[#ECE8F6]">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="rounded-[24px] bg-[#F4EBFF] p-3 text-right text-[12px] font-bold leading-6 text-[#5B2BE2] ring-1 ring-[#E6D6FF]">
          رویدادهای Webhook و Auto Reply — هر بار که پیام یا کامنت می‌رسد یا پاسخ ارسال می‌شود اینجا ثبت می‌شود.
        </section>

        {loading && (
          <section className="rounded-[24px] bg-white p-4 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </section>
        )}

        {!loading && !logs.length && (
          <section className="rounded-[24px] bg-white p-6 text-center ring-1 ring-[#ECE8F6]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#F2EEFF] text-[#5B2BE2]">
              <Activity className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[14px] font-black text-[#24123F]">هنوز لاگی ثبت نشده</p>
            <p className="mt-1 text-[12px] font-bold leading-6 text-[#6D6780]">بعد از دریافت اولین دایرکت یا کامنت از Instagram، رویدادها اینجا نمایش داده می‌شوند.</p>
          </section>
        )}

        <section className="space-y-3">
          {logs.map((log) => {
            const meta = eventMeta(log.type);
            return (
              <article key={log.id} className="rounded-[24px] bg-white p-3 text-right shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
                <div className="flex items-center justify-between gap-3">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${log.processed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {log.processed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ring-1 ${meta.color}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-[#8A8498]">{dateText(log.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-[#FBFAFF] p-3 text-right ring-1 ring-[#ECE8F6]">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ring-1 ${log.processed ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                      {log.processed ? "✅ پردازش شد" : "⏳ پردازش نشد"}
                    </span>
                    {log.senderId && (
                      <p className="truncate text-[11px] font-bold text-[#6D6780]" dir="ltr">
                        sender: {log.senderId}
                      </p>
                    )}
                  </div>
                  {!log.processed && (
                    <p className="mt-2 text-[10px] font-bold leading-5 text-amber-700">
                      این رویداد دریافت شد اما پردازش نشد — ممکن است اکانت یا قانون مرتبطی یافت نشده باشد.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <AppNav />
    </div>
  );
}
