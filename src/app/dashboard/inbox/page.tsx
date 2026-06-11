"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Loader2, MessageCircle, RefreshCcw, Send, ShieldCheck } from "lucide-react";
import { AppNav } from "@/components/app-nav";

type AutoReplyPreview = {
  shouldReply: boolean;
  mode: string;
  category: string;
  confidence: number;
  trigger: string;
  action: string;
  responseText: string;
  privateReplyText?: string;
  publicCommentReply?: string;
  needsHumanReview: boolean;
};

type DiagnosticsMessage = {
  id: string;
  message?: string;
  from?: { id?: string; username?: string; name?: string };
  to?: { data?: Array<{ id?: string; username?: string; name?: string }> };
  created_time?: string;
  attachments?: unknown;
  autoReply?: AutoReplyPreview;
};

type DiagnosticsConversation = {
  id: string;
  updated_time?: string;
  participants?: unknown;
  messages?: DiagnosticsMessage[];
};

type Diagnostics = {
  ok?: boolean;
  profile?: { id?: string; username?: string; name?: string } | null;
  configuredInstagramId?: string;
  resolvedInstagramId?: string;
  idMismatch?: boolean;
  mode?: "page_token" | "instagram_login";
  pageId?: string;
  conversations?: DiagnosticsConversation[];
  emptyReason?: string;
  error?: string;
  hint?: string;
  pageTokenLikelyMissing?: boolean;
  tokenSource?: string;
};

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}


function shortId(value?: string) {
  if (!value) return "—";
  return value.length > 22 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;
}

function firstAttachmentLabel(attachments: unknown) {
  if (!attachments || typeof attachments !== "object") return "";
  const record = attachments as Record<string, unknown>;
  const data = Array.isArray(record.data) ? record.data : [];
  if (!data.length) return "";
  return "پیام غیرمتنی / عکس یا استوری";
}

function conversationTitle(item: DiagnosticsConversation, profile?: Diagnostics["profile"]) {
  const selfIds = new Set([profile?.id, profile?.username].filter(Boolean));
  const names: string[] = [];
  for (const msg of item.messages || []) {
    const fromId = msg.from?.id || msg.from?.username;
    if (fromId && !selfIds.has(fromId)) {
      const name = msg.from?.username || msg.from?.name || msg.from?.id;
      if (name && !names.includes(name)) names.push(name);
    }
    for (const to of msg.to?.data || []) {
      const toId = to.id || to.username;
      if (toId && !selfIds.has(toId)) {
        const name = to.username || to.name || to.id;
        if (name && !names.includes(name)) names.push(name);
      }
    }
  }
  return names[0] ? `@${names[0]}` : "گفتگوی تستی";
}

function messageText(msg: DiagnosticsMessage) {
  const text = (msg.message || "").trim();
  if (text) return text;
  return firstAttachmentLabel(msg.attachments) || "پیام بدون متن / مدیا";
}


export default function InboxPage() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sendingKey, setSendingKey] = useState("");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [autoSyncStatus, setAutoSyncStatus] = useState("Auto Reply در حالت تستِ زنده آماده است؛ هر ۲۰ ثانیه آخرین دایرکت بررسی می‌شود.");
  const [lastAutoSyncAt, setLastAutoSyncAt] = useState("");
  const autoSyncLock = useRef(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [message, setMessage] = useState("");
  const conversations = diagnostics?.conversations || [];

  const title = useMemo(() => {
    if (conversations.length) return "دایرکت تستی Instagram";
    if (loading) return "در حال خواندن دایرکت…";
    if (diagnostics?.ok) return "اینباکس آماده است؛ فعلاً پیام برنگشته";
    return "اینباکس رسمی Meta";
  }, [conversations.length, diagnostics?.ok, loading]);

  const loadInbox = useCallback(async (quiet = false) => {
    if (!quiet) {
      setLoading(true);
      setMessage("");
    }
    try {
      const res = await fetch("/api/instagram/inbox-test", { cache: "no-store" });
      
      // بررسی اینکه response body خالی نباشد
      const text = await res.text();
      if (!text || text.trim() === "") {
        throw new Error("سرور پاسخ خالی برگرداند. لطفاً لاگ‌های سرور را بررسی کنید.");
      }
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`پاسخ سرور JSON معتبر نیست: ${text.substring(0, 100)}`);
      }
      
      if (res.status === 401) {
        location.assign("/auth/login");
        return;
      }
      if (!res.ok && !json) throw new Error("خواندن وضعیت اینباکس ناموفق بود.");
      setDiagnostics(json);
      if (json?.error && !quiet) {
        const base = json.advancedAccessNeeded
          ? `${json.error} — اتصال درست است، اما برای خواندن همه دایرکت‌ها Advanced Access لازم است.`
          : json.error;
        setMessage(json.hint ? `${base}
${json.hint}` : base);
      }
    } catch (error) {
      if (!quiet) setMessage((error as Error).message || "خطا در خواندن اینباکس.");
      if (quiet) setAutoSyncStatus((error as Error).message || "خطا در خواندن اینباکس.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  async function syncDirects() {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "همگام‌سازی ناموفق بود.");
      setMessage(json.message || "همگام‌سازی انجام شد.");
      setLastAutoSyncAt(new Date().toLocaleTimeString("fa-IR"));
      await loadInbox(true);
    } catch (error) {
      setMessage((error as Error).message || "خطا در همگام‌سازی.");
    } finally {
      setSyncing(false);
    }
  }

  const runAutomaticSync = useCallback(async () => {
    if (autoSyncLock.current) return;
    autoSyncLock.current = true;
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST", cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Auto Reply Sync ناموفق بود.");
      const sent = Number(json.sentReplies || 0);
      const imported = Number(json.imported || 0);
      const duplicates = Number(json.duplicates || 0);
      setLastAutoSyncAt(new Date().toLocaleTimeString("fa-IR"));
      setAutoSyncStatus(!json.liveSendAllowed
        ? "Auto Reply در UI روشن است، اما ارسال واقعی در Railway هنوز live نشده است. دو Variable مربوط به live را فعال کنید."
        : sent > 0
          ? `✅ ${sent.toLocaleString("fa-IR")} پاسخ خودکار به دایرکت اینستاگرام ارسال شد.`
          : `Auto Reply فعال است؛ ${imported.toLocaleString("fa-IR")} پیام جدید، ${duplicates.toLocaleString("fa-IR")} تکراری، پاسخ جدیدی ارسال نشد.`);
      await loadInbox(true);
    } catch (error) {
      setAutoSyncStatus((error as Error).message || "خطا در Auto Reply Sync.");
    } finally {
      autoSyncLock.current = false;
    }
  }, [loadInbox]);

  async function sendReplyToInstagram(msg: DiagnosticsMessage) {
    const replyText = msg.autoReply?.privateReplyText || msg.autoReply?.responseText || "";
    const key = msg.id || msg.from?.id || "reply";
    setSendingKey(key);
    setMessage("");
    try {
      const res = await fetch("/api/instagram/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: msg.from?.id,
          sourceText: messageText(msg),
          text: replyText,
          confirm: "send_to_instagram",
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "ارسال پاسخ به اینستاگرام ناموفق بود.");
      setMessage(json.message || "پاسخ به دایرکت اینستاگرام ارسال شد.");
      await loadInbox();
    } catch (error) {
      setMessage((error as Error).message || "خطا در ارسال پاسخ.");
    } finally {
      setSendingKey("");
    }
  }

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!autoSyncEnabled) return;
    const firstRun = window.setTimeout(() => {
      void runAutomaticSync();
    }, 2500);
    const timer = window.setInterval(() => {
      void runAutomaticSync();
    }, 20000);
    return () => {
      window.clearTimeout(firstRun);
      window.clearInterval(timer);
    };
  }, [autoSyncEnabled, runAutomaticSync]);

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-8 pt-3">
        <header className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#17112A] via-[#5B2BE2] to-[#FF2D80] p-3 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="flex items-start justify-between gap-3">
            <Link href="/dashboard" className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
                <MessageCircle className="h-3.5 w-3.5" /> Instagram Inbox
              </p>
              <h1 className="mt-2 text-[21px] font-black leading-tight">{title}</h1>
              <p className="mt-1 text-[11px] font-bold leading-5 text-white/70">دایرکت‌ها از مسیر صحیح Page Token خوانده می‌شوند.</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[20px] bg-white/10 p-2 ring-1 ring-white/12"><p className="text-[18px] font-black">@{diagnostics?.profile?.username || "—"}</p><p className="mt-1 text-[10px] font-bold text-white/58">اکانت</p></div>
            <div className="rounded-[20px] bg-white/10 p-2 ring-1 ring-white/12"><p className="text-[22px] font-black">{conversations.length.toLocaleString("fa-IR")}</p><p className="mt-1 text-[10px] font-bold text-white/58">گفتگو</p></div>
            <div className="rounded-[20px] bg-white/10 p-2 ring-1 ring-white/12"><p className="text-[18px] font-black">{diagnostics?.ok ? "OK" : "—"}</p><p className="mt-1 text-[10px] font-bold text-white/58">API</p></div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2">
          <button onClick={() => loadInbox()} disabled={loading} className="h-12 rounded-[22px] bg-white text-[12px] font-black text-[#5B2BE2] shadow-[0_12px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6] disabled:opacity-50">
            {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <><RefreshCcw className="ml-1 inline h-4 w-4" /> تازه‌سازی</>}
          </button>
          <button onClick={syncDirects} disabled={syncing || !diagnostics?.ok || !conversations.length} className="h-12 rounded-[22px] bg-[#17112A] text-[12px] font-black text-white shadow-[0_12px_26px_rgba(42,16,90,0.12)] disabled:opacity-50">
            {syncing ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sync تستی یک گفتگو"}
          </button>
        </section>

        <section className="rounded-[24px] bg-emerald-50 p-3 text-right text-[11px] font-bold leading-6 text-emerald-900 shadow-[0_14px_34px_rgba(42,16,90,0.05)] ring-1 ring-emerald-100">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setAutoSyncEnabled((value) => !value)}
              className={`rounded-2xl px-3 py-2 text-[11px] font-black ${autoSyncEnabled ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 ring-1 ring-emerald-100"}`}
            >
              {autoSyncEnabled ? "Auto Reply روشن" : "Auto Reply خاموش"}
            </button>
            <div className="text-right">
              <p className="font-black">ارسال خودکار دایرکت</p>
              <p className="mt-0.5 text-[10px] text-emerald-800/80">{autoSyncStatus}</p>
              {lastAutoSyncAt && <p className="mt-0.5 text-[10px] text-emerald-800/70">آخرین بررسی: {lastAutoSyncAt}</p>}
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-emerald-800/80">از v23 مدل اصلی پاسخ خودکار با Webhook است و نیازی به باز بودن اینباکس ندارد. این دکمه فقط برای تست اضطراری/دستی باقی مانده است؛ حالت واقعی از مسیر /api/webhook یا /api/meta/webhook اجرا می‌شود.</p>
        </section>


        {loading && (
          <section className="rounded-[24px] bg-white p-3 text-right text-[12px] font-bold leading-6 text-[#5B2BE2] shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />
            در حال خواندن آخرین گفتگوی تستی از مسیر Page Token...
          </section>
        )}

        {!loading && !diagnostics && !message && (
          <section className="rounded-[24px] bg-white p-3 text-right text-[12px] font-bold leading-6 text-[#6D6780] shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            برای تست سبک اینباکس، دکمه تازه‌سازی را بزن. برنامه فقط آخرین گفتگو را با limit=1 می‌خواند.
          </section>
        )}

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
                  <div className="min-w-0 text-right">
                    <p className="truncate text-[14px] font-black text-[#24123F]" dir="ltr">{conversationTitle(item, diagnostics?.profile)}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#8A8498]" dir="ltr">ID: {shortId(item.id)}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] font-bold text-[#6D6780]">آخرین بروزرسانی: {formatDate(item.updated_time)}</p>
                {item.messages?.length ? (
                  <div className="mt-3 space-y-2">
                    {item.messages.slice(0, 5).map((msg) => {
                      const incoming = msg.from?.id !== diagnostics?.profile?.id && msg.from?.username !== diagnostics?.profile?.username;
                      return (
                        <div key={msg.id} className={`rounded-2xl p-2 text-[11px] font-bold leading-5 ring-1 ${incoming ? "bg-[#F4F0FF] text-[#24123F] ring-[#E6DCF8]" : "bg-emerald-50 text-emerald-900 ring-emerald-100"}`}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-[#8A8498]">{formatDate(msg.created_time)}</span>
                            <span dir="ltr" className="text-[10px] font-black">@{msg.from?.username || "user"}</span>
                          </div>
                          <p>{messageText(msg)}</p>
                          {incoming && msg.autoReply?.shouldReply && (
                            <div className="mt-2 rounded-xl bg-white/80 p-2 text-right text-[10px] font-bold leading-5 text-[#5B2BE2] ring-1 ring-[#E6DCF8]">
                              <p className="font-black">پاسخ آماده ارسال: {msg.autoReply.trigger} | {msg.autoReply.confidence}%</p>
                              <p className="mt-1 text-[#24123F]">{msg.autoReply.privateReplyText || msg.autoReply.responseText}</p>
                              <button
                                onClick={() => sendReplyToInstagram(msg)}
                                disabled={sendingKey === (msg.id || msg.from?.id)}
                                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#5B2BE2] px-3 text-[11px] font-black text-white shadow-[0_10px_22px_rgba(91,43,226,0.18)] disabled:opacity-50"
                              >
                                {sendingKey === (msg.id || msg.from?.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                ارسال همین پاسخ به دایرکت اینستاگرام
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        )}

        <section className="rounded-[26px] bg-white p-3 text-right text-[12px] font-bold leading-6 text-[#6D6780] shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="flex items-center justify-end gap-2 font-black text-[#24123F]"><ShieldCheck className="h-4 w-4 text-[#5B2BE2]" /> مسیر بعدی</p>
          <p className="mt-1">مسیر فنی دایرکت تأیید شد: graph.facebook.com / Page Token / platform=instagram. از v23 پاسخ واقعی باید از Webhook اجرا شود، نه باز بودن صفحه و نه تایمر. قوانین دستی را بساز و Callback را در Meta روی /api/webhook یا /api/meta/webhook تنظیم کن.</p>
          <Link href="/dashboard/automation/rules" className="mt-3 block rounded-2xl bg-[#F2EEFF] p-3 text-center text-[12px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]">مدیریت قوانین دستی</Link>
        </section>
      </main>
      <AppNav />
    </div>
  );
}
