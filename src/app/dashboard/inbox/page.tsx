"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, RefreshCcw, ShieldCheck } from "lucide-react";

type Diagnostics = {
  ok?: boolean;
  profile?: { id?: string; username?: string; name?: string } | null;
  configuredInstagramId?: string;
  resolvedInstagramId?: string;
  idMismatch?: boolean;
  conversations?: Array<{ id: string; updated_time?: string; participants?: unknown }>;
  emptyReason?: string;
  error?: string;
};

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function InboxPage() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [message, setMessage] = useState("");
  const conversations = diagnostics?.conversations || [];

  const title = useMemo(() => {
    if (conversations.length) return "دایرکت‌های Instagram";
    if (diagnostics?.ok) return "اینباکس آماده است؛ فعلاً پیام برنگشته";
    return "اینباکس مستقل شانشین";
  }, [conversations.length, diagnostics?.ok]);

  async function loadInbox() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/instagram/diagnostics", { cache: "no-store" });
      const json = await res.json();
      if (res.status === 401) {
        location.assign("/auth/login");
        return;
      }
      if (!res.ok) throw new Error(json.error || "خواندن وضعیت اینباکس ناموفق بود.");
      setDiagnostics(json);
    } catch (error) {
      setMessage((error as Error).message || "خطا در خواندن اینباکس.");
    } finally {
      setLoading(false);
    }
  }

  async function syncDirects() {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "همگام‌سازی ناموفق بود.");
      setMessage(json.message || "همگام‌سازی انجام شد.");
      await loadInbox();
    } catch (error) {
      setMessage((error as Error).message || "خطا در همگام‌سازی.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-8 pt-3">
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#17112A] via-[#5B2BE2] to-[#FF2D80] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="flex items-start justify-between gap-3">
            <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
                <MessageCircle className="h-3.5 w-3.5" /> Instagram Inbox
              </p>
              <h1 className="mt-2 text-[25px] font-black leading-tight">{title}</h1>
              <p className="mt-2 text-[12px] font-bold leading-6 text-white/70">این صفحه مسیر مستقل شانشین را نشان می‌دهد؛ بدون ManyChat یا Directam.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[20px] bg-white/10 p-2 ring-1 ring-white/12"><p className="text-[18px] font-black">@{diagnostics?.profile?.username || "—"}</p><p className="mt-1 text-[10px] font-bold text-white/58">اکانت</p></div>
            <div className="rounded-[20px] bg-white/10 p-2 ring-1 ring-white/12"><p className="text-[22px] font-black">{conversations.length.toLocaleString("fa-IR")}</p><p className="mt-1 text-[10px] font-bold text-white/58">گفتگو</p></div>
            <div className="rounded-[20px] bg-white/10 p-2 ring-1 ring-white/12"><p className="text-[18px] font-black">{diagnostics?.ok ? "OK" : "—"}</p><p className="mt-1 text-[10px] font-bold text-white/58">API</p></div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2">
          <button onClick={loadInbox} disabled={loading} className="h-12 rounded-[22px] bg-white text-[12px] font-black text-[#5B2BE2] shadow-[0_12px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6] disabled:opacity-50">
            {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <><RefreshCcw className="ml-1 inline h-4 w-4" /> تازه‌سازی</>}
          </button>
          <button onClick={syncDirects} disabled={syncing || !diagnostics?.ok} className="h-12 rounded-[22px] bg-[#17112A] text-[12px] font-black text-white shadow-[0_12px_26px_rgba(42,16,90,0.12)] disabled:opacity-50">
            {syncing ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sync به لیدها"}
          </button>
        </section>

        {message && <section className="rounded-[24px] bg-blue-50 p-3 text-right text-[12px] font-bold leading-6 text-blue-900 ring-1 ring-blue-100">{message}</section>}

        {diagnostics?.idMismatch && (
          <section className="rounded-[24px] bg-amber-50 p-3 text-right text-[11px] font-bold leading-6 text-amber-900 ring-1 ring-amber-100">
            <p className="font-black">اختلاف ID تشخیص داده شد و برنامه با ID واقعی API کار می‌کند.</p>
            <p dir="ltr" className="mt-1 text-left">Configured: {diagnostics.configuredInstagramId}</p>
            <p dir="ltr" className="text-left">Resolved: {diagnostics.resolvedInstagramId}</p>
          </section>
        )}

        {diagnostics?.ok && !conversations.length && (
          <section className="rounded-[28px] bg-white p-4 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-[16px] font-black text-[#24123F]">اتصال برقرار است</p>
            <p className="mt-2 text-[12px] font-bold leading-7 text-[#6D6780]">{diagnostics.emptyReason || "Meta فعلاً گفتگویی برنگردانده است. این وضعیت برای Development/App Review قابل انتظار است و خطای برنامه نیست."}</p>
            <Link href="/review" className="mt-3 block rounded-2xl bg-[#F2EEFF] p-3 text-center text-[12px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]">رفتن به چک‌لیست Review</Link>
          </section>
        )}

        {conversations.length > 0 && (
          <section className="space-y-2">
            {conversations.map((item) => (
              <div key={item.id} className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">دریافت شد</span>
                  <p className="text-[12px] font-black text-[#24123F]" dir="ltr">{item.id}</p>
                </div>
                <p className="mt-2 text-[11px] font-bold text-[#6D6780]">آخرین بروزرسانی: {formatDate(item.updated_time)}</p>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-[26px] bg-white p-3 text-right text-[12px] font-bold leading-6 text-[#6D6780] shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="flex items-center justify-end gap-2 font-black text-[#24123F]"><ShieldCheck className="h-4 w-4 text-[#5B2BE2]" /> مسیر بعدی</p>
          <p className="mt-1">برای واقعی شدن دریافت پیام‌ها باید App Review/Advanced Access و Webhook رسمی کامل شود. این Inbox برای همان مسیر آماده شده است.</p>
        </section>
      </main>
    </div>
  );
}
