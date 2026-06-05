"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Copy, Edit3, FileText, Home, Image as ImageIcon, Link2, Loader2, MessageCircle, MessageSquare, Paperclip, Plus, RefreshCcw, Search, ToggleLeft, UsersRound, Video, Volume2, Zap } from "lucide-react";

type Rule = {
  id: string;
  name: string;
  triggers: string[];
  matchType: "equals" | "contains";
  responseText: string;
  mediaType: "none" | "image" | "video" | "audio" | "file" | "link";
  mediaUrl: string;
  isActive: boolean;
  sendOnce: boolean;
};

type ApiRules = {
  ok: boolean;
  mode: string;
  liveSendAllowed: boolean;
  rules: Rule[];
  source?: string;
};

const matchLabel: Record<string, string> = { equals: "برابر", contains: "شامل" };
const mediaLabel: Record<string, string> = { none: "متن", image: "عکس", video: "ویدیو", audio: "صدا", file: "فایل", link: "لینک" };

function mediaIcon(type: string) {
  if (type === "image") return <ImageIcon className="h-4 w-4" />;
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "audio") return <Volume2 className="h-4 w-4" />;
  if (type === "file") return <FileText className="h-4 w-4" />;
  if (type === "link") return <Link2 className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function short(text: string, max = 86) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function AutomationRulesPage() {
  const [data, setData] = useState<ApiRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/automation/rules", { cache: "no-store" });
      if (res.status === 401) {
        location.assign("/auth/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (error) {
      setMessage((error as Error).message || "خواندن قوانین ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function removeRule(id: string) {
    if (!confirm("این قانون حذف شود؟")) return;
    setMessage("");
    const res = await fetch(`/api/automation/rules/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) {
      setMessage(json.error || "حذف قانون ناموفق بود.");
      return;
    }
    await load();
  }

  async function duplicateRule(rule: Rule) {
    setMessage("");
    const res = await fetch("/api/automation/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rule, name: `${rule.name} - کپی` }),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) {
      setMessage(json.error || "کپی قانون ناموفق بود.");
      return;
    }
    await load();
  }

  const rules = useMemo(() => {
    const list = data?.rules || [];
    const text = query.trim().toLowerCase();
    if (!text) return list;
    return list.filter((rule) => `${rule.name} ${rule.triggers.join(" ")} ${rule.responseText}`.toLowerCase().includes(text));
  }, [data?.rules, query]);

  const activeCount = (data?.rules || []).filter((rule) => rule.isActive).length;

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard/automation" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link>
            <h1 className="text-[22px] font-black">قوانین پاسخ خودکار</h1>
            <button onClick={load} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#5B2BE2] shadow-sm ring-1 ring-[#ECE8F6]"><RefreshCcw className="h-4 w-4" /></button>
          </div>
        </header>

        <section className="rounded-[24px] bg-[#F4EBFF] p-3 text-right text-[12px] font-bold leading-6 text-[#5B2BE2] ring-1 ring-[#E6D6FF]">
          <p className="flex items-center justify-end gap-2 text-[13px] font-black"><Zap className="h-4 w-4" /> پاسخ‌ها از Webhook به‌صورت آنی ارسال می‌شوند.</p>
          <p className="mt-1 text-[#6D6780]">حتی وقتی صفحه اینباکس باز نیست، پیام ورودی بررسی و قانون مناسب اجرا می‌شود.</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[11px] font-black">
            <span className="rounded-2xl bg-white px-2 py-2 text-[#24123F] ring-1 ring-[#ECE8F6]">Mode: {data?.mode || "—"}</span>
            <span className={`rounded-2xl px-2 py-2 ring-1 ${data?.liveSendAllowed ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>{data?.liveSendAllowed ? "ارسال زنده فعال" : "ارسال زنده خاموش"}</span>
          </div>
        </section>

        <Link href="/dashboard/automation/rules/new" className="flex h-14 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[14px] font-black text-white shadow-[0_18px_34px_rgba(91,43,226,0.22)]"><Plus className="h-5 w-5" /> افزودن قانون جدید</Link>

        <section className="grid grid-cols-4 gap-2">
          <Link href="/dashboard/assets" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Paperclip className="h-4 w-4" />پیوست‌ها</Link>
          <Link href="/dashboard/comments" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><MessageSquare className="h-4 w-4" />کامنت</Link>
          <Link href="/dashboard/templates" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><BookOpen className="h-4 w-4" />قالب‌ها</Link>
          <Link href="/dashboard/logs" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><RefreshCcw className="h-4 w-4" />لاگ‌ها</Link>
        </section>

        <section className="space-y-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8498]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در قوانین..." className="h-13 w-full rounded-[22px] border border-[#ECE8F6] bg-white px-4 py-4 pl-12 text-right text-[13px] font-bold outline-none focus:border-[#5B2BE2]" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
            <span className="rounded-2xl bg-white px-2 py-3 text-emerald-700 ring-1 ring-[#ECE8F6]">● {activeCount.toLocaleString("fa-IR")} قانون فعال</span>
            <span className="rounded-2xl bg-white px-2 py-3 text-[#5B2BE2] ring-1 ring-[#ECE8F6]">{(data?.rules?.length || 0).toLocaleString("fa-IR")} کل قوانین</span>
            <span className="rounded-2xl bg-white px-2 py-3 text-[#6D6780] ring-1 ring-[#ECE8F6]">{data?.source === "manual" ? "دستی" : "پیش‌فرض"}</span>
          </div>
        </section>

        {message && <section className="rounded-[20px] bg-amber-50 p-3 text-right text-[12px] font-bold leading-6 text-amber-900 ring-1 ring-amber-100">{message}</section>}
        {loading && <section className="rounded-[24px] bg-white p-5 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></section>}

        {!loading && !rules.length && (
          <section className="rounded-[24px] bg-white p-4 text-right text-[12px] font-bold leading-7 text-[#6D6780] ring-1 ring-[#ECE8F6]">
            هنوز قانون دستی ثبت نشده است. از دکمه «افزودن قانون جدید» یک قانون مثل منو، آدرس یا رزرو بساز.
          </section>
        )}

        <section className="space-y-3">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-[26px] bg-white p-3 text-right shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5B2BE2] text-white shadow-[0_12px_24px_rgba(91,43,226,0.18)]">{mediaIcon(rule.mediaType)}</div>
                  <div className="min-w-0">
                    <p className="text-[16px] font-black text-[#24123F]">{rule.name}</p>
                    <p className="mt-1 text-[12px] font-bold text-[#8A8498]">کلمه کلیدی: <span className="text-[#5B2BE2]">{rule.triggers.join("، ")}</span></p>
                    <div className="mt-2 flex flex-wrap justify-start gap-1.5 text-[10px] font-black">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-blue-100">{matchLabel[rule.matchType] || rule.matchType}</span>
                      <span className="rounded-full bg-[#F2EEFF] px-2 py-1 text-[#5B2BE2] ring-1 ring-[#E6DCF8]">{mediaLabel[rule.mediaType] || "متن"}</span>
                      {rule.sendOnce && <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-100">یک‌بار</span>}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${rule.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}><ToggleLeft className="h-4 w-4" /> {rule.isActive ? "فعال" : "خاموش"}</div>
                </div>
              </div>
              <p className="mt-3 rounded-2xl bg-[#FBFAFF] p-3 text-[11px] font-bold leading-6 text-[#6D6780] ring-1 ring-[#ECE8F6]">{short(rule.responseText || rule.mediaUrl || "بدون متن")}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Link href={`/dashboard/automation/rules/new?id=${rule.id}`} className="flex h-11 items-center justify-center gap-1 rounded-2xl bg-[#F2EEFF] text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"><Edit3 className="h-4 w-4" /> ویرایش</Link>
                <button onClick={() => duplicateRule(rule)} className="flex h-11 items-center justify-center gap-1 rounded-2xl bg-white text-[11px] font-black text-[#24123F] ring-1 ring-[#ECE8F6]"><Copy className="h-4 w-4" /> کپی</button>
                <button onClick={() => removeRule(rule.id)} className="h-11 rounded-2xl bg-red-50 text-[11px] font-black text-red-700 ring-1 ring-red-100">حذف</button>
              </div>
            </article>
          ))}
        </section>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] rounded-t-[26px] bg-white/96 px-4 py-3 shadow-[0_-18px_36px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6] backdrop-blur">
        <div className="grid h-full grid-cols-5 gap-1 text-center text-[9px] font-black text-[#6D6780]">
          <Link href="/dashboard" className="flex flex-col items-center justify-center rounded-2xl"><Home className="h-5 w-5" /><span className="mt-1">خانه</span></Link>
          <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-2xl"><MessageCircle className="h-5 w-5" /><span className="mt-1">اینباکس</span></Link>
          <Link className="flex flex-col items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]" href="/dashboard/automation/rules"><Zap className="h-5 w-5" /><span className="mt-1">قوانین</span></Link>
          <Link href="/dashboard/leads" className="flex flex-col items-center justify-center rounded-2xl"><UsersRound className="h-5 w-5" /><span className="mt-1">لیدها</span></Link>
          <Link href="/connect" className="flex flex-col items-center justify-center rounded-2xl"><Link2 className="h-5 w-5" /><span className="mt-1">اتصال</span></Link>
        </div>
      </nav>
    </div>
  );
}
