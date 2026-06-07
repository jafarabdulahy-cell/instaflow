"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Copy,
  Edit3,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  RefreshCcw,
  Search,
  ShoppingBag,
  Trash2,
  Video,
  Volume2,
  Zap,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";

type Rule = {
  id: string;
  name: string;
  triggers: string[];
  matchType: "equals" | "contains";
  responseText: string;
  mediaType: "none" | "image" | "video" | "audio" | "file" | "link";
  mediaUrl: string;
  attachments?: Array<{ type: string; url: string; label?: string }>;
  cardId?: string;
  isActive: boolean;
  sendOnce: boolean;
  updatedAt?: string;
  createdAt?: string;
};

type ApiRules = {
  ok: boolean;
  mode: string;
  liveSendAllowed: boolean;
  rules: Rule[];
  source?: string;
};

const matchLabel: Record<string, string> = { equals: "برابر", contains: "شامل" };

function mediaIcon(type: string) {
  if (type === "image") return <ImageIcon className="h-4 w-4" />;
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "audio") return <Volume2 className="h-4 w-4" />;
  if (type === "file" || type === "link") return <FileText className="h-4 w-4" />;
  return <Zap className="h-4 w-4" />;
}

function mediaTypeBadge(type: string) {
  if (type === "image") return { label: "عکس", color: "bg-sky-50 text-sky-700 ring-sky-100" };
  if (type === "video") return { label: "ویدیو", color: "bg-purple-50 text-purple-700 ring-purple-100" };
  if (type === "audio") return { label: "صدا", color: "bg-orange-50 text-orange-700 ring-orange-100" };
  if (type === "file") return { label: "فایل", color: "bg-amber-50 text-amber-700 ring-amber-100" };
  if (type === "link") return { label: "لینک", color: "bg-teal-50 text-teal-700 ring-teal-100" };
  return { label: "متن", color: "bg-slate-50 text-slate-600 ring-slate-100" };
}

function shortDate(value?: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short" }).format(new Date(value));
  } catch {
    return null;
  }
}

function short(text: string, max = 90) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function AutomationRulesPage() {
  const [data, setData] = useState<ApiRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/automation/rules", { cache: "no-store" });
      if (res.status === 401) { location.assign("/auth/login"); return; }
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
    if (!json.ok) { setMessage(json.error || "حذف قانون ناموفق بود."); return; }
    await load();
  }

  async function toggleActive(rule: Rule) {
    setToggling(rule.id);
    try {
      const res = await fetch(`/api/automation/rules/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rule, isActive: !rule.isActive }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) throw new Error(json.error || "تغییر وضعیت ناموفق بود.");
      await load();
    } catch (error) {
      setMessage((error as Error).message || "تغییر وضعیت ناموفق بود.");
    } finally {
      setToggling(null);
    }
  }

  async function duplicateRule(rule: Rule) {
    setMessage("");
    const res = await fetch("/api/automation/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rule, name: `${rule.name} — کپی` }),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) { setMessage(json.error || "کپی قانون ناموفق بود."); return; }
    await load();
  }

  const rules = useMemo(() => {
    const list = data?.rules || [];
    const text = query.trim().toLowerCase();
    if (!text) return list;
    return list.filter((rule) =>
      `${rule.name} ${rule.triggers.join(" ")} ${rule.responseText}`.toLowerCase().includes(text)
    );
  }, [data?.rules, query]);

  const activeCount = (data?.rules || []).filter((r) => r.isActive).length;
  const totalCount = data?.rules?.length || 0;

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">

        {/* Header */}
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="text-[22px] font-black">قوانین پاسخ خودکار</h1>
            <button onClick={load} disabled={loading} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#5B2BE2] shadow-sm ring-1 ring-[#ECE8F6] disabled:opacity-50">
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Status bar */}
        <section className="grid grid-cols-2 gap-2 text-center text-[11px] font-black">
          <div className={`rounded-2xl px-2 py-3 ring-1 ${data?.liveSendAllowed ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
            {data?.liveSendAllowed ? "✅ ارسال زنده فعال" : "⚠️ ارسال زنده خاموش"}
          </div>
          <div className="rounded-2xl bg-white px-2 py-3 text-[#5B2BE2] ring-1 ring-[#ECE8F6]">
            {activeCount.toLocaleString("fa-IR")} فعال از {totalCount.toLocaleString("fa-IR")} قانون
          </div>
        </section>

        {/* Add new button */}
        <Link
          href="/dashboard/automation/rules/new"
          className="flex h-14 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[14px] font-black text-white shadow-[0_18px_34px_rgba(91,43,226,0.22)]"
        >
          <Plus className="h-5 w-5" /> افزودن قانون جدید
        </Link>

        {/* Quick nav to related sections */}
        <section className="grid grid-cols-4 gap-2">
          <Link href="/dashboard/assets" className="flex h-12 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-[9px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Paperclip className="h-4 w-4" />پیوست‌ها</Link>
          <Link href="/dashboard/cards" className="flex h-12 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-[9px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><ShoppingBag className="h-4 w-4" />کارت‌ها</Link>
          <Link href="/dashboard/comments" className="flex h-12 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-[9px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><MessageSquare className="h-4 w-4" />کامنت</Link>
          <Link href="/dashboard/templates" className="flex h-12 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-[9px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><BookOpen className="h-4 w-4" />قالب‌ها</Link>
        </section>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8498]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در نام، کلمه کلیدی یا متن پاسخ..."
            className="h-12 w-full rounded-[20px] border border-[#ECE8F6] bg-white px-4 pl-11 text-right text-[12px] font-bold outline-none focus:border-[#5B2BE2]"
          />
        </div>

        {message && (
          <section className="rounded-[20px] bg-amber-50 p-3 text-right text-[12px] font-bold leading-6 text-amber-900 ring-1 ring-amber-100">
            {message}
          </section>
        )}

        {loading && (
          <section className="rounded-[24px] bg-white p-5 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </section>
        )}

        {!loading && !rules.length && (
          <section className="rounded-[24px] bg-white p-5 text-center ring-1 ring-[#ECE8F6]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#F2EEFF] text-[#5B2BE2]">
              <Zap className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[14px] font-black text-[#24123F]">
              {query ? "قانونی با این مشخصات پیدا نشد" : "هنوز قانونی ثبت نشده"}
            </p>
            <p className="mt-1 text-[12px] font-bold leading-6 text-[#6D6780]">
              {query ? "عبارت دیگری امتحان کن." : "از دکمه بالا یک قانون مثل منو، آدرس یا رزرو بساز."}
            </p>
          </section>
        )}

        {/* Rule cards */}
        <section className="space-y-3">
          {rules.map((rule) => {
            const typeBadge = mediaTypeBadge(rule.mediaType);
            const hasAttachments = (rule.attachments?.length ?? 0) > 0;
            const hasCard = Boolean(rule.cardId);
            const dateStr = shortDate(rule.updatedAt || rule.createdAt);

            return (
              <article key={rule.id} className={`rounded-[26px] bg-white p-3 text-right shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 transition-opacity ${rule.isActive ? "ring-[#ECE8F6]" : "opacity-60 ring-slate-200"}`}>

                {/* Top row: icon + name + active badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${rule.isActive ? "bg-[#5B2BE2] text-white" : "bg-slate-100 text-slate-400"} shadow-sm`}>
                      {mediaIcon(rule.mediaType)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-[#24123F] leading-tight">{rule.name}</p>
                      {dateStr && (
                        <p className="mt-0.5 text-[10px] font-bold text-[#AAA3B8]">آخرین ویرایش: {dateStr}</p>
                      )}
                    </div>
                  </div>

                  {/* Active toggle button */}
                  <button
                    onClick={() => toggleActive(rule)}
                    disabled={toggling === rule.id}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black ring-1 transition-colors ${
                      rule.isActive
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100 active:bg-emerald-100"
                        : "bg-slate-50 text-slate-500 ring-slate-100 active:bg-slate-100"
                    } disabled:opacity-50`}
                  >
                    {toggling === rule.id ? "…" : rule.isActive ? "فعال" : "خاموش"}
                  </button>
                </div>

                {/* Trigger badges */}
                <div className="mt-3 flex flex-wrap justify-end gap-1.5">
                  {rule.triggers.map((trigger) => (
                    <span key={trigger} className="rounded-full bg-[#F2EEFF] px-2.5 py-1 text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]">
                      {trigger}
                    </span>
                  ))}
                </div>

                {/* Info badges row */}
                <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700 ring-1 ring-blue-100">
                    {matchLabel[rule.matchType] || rule.matchType}
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ring-1 ${typeBadge.color}`}>
                    {typeBadge.label}
                  </span>
                  {rule.sendOnce && (
                    <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700 ring-1 ring-violet-100">
                      یک‌بار
                    </span>
                  )}
                  {hasAttachments && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 ring-1 ring-amber-100">
                      پیوست
                    </span>
                  )}
                  {hasCard && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">
                      کارت
                    </span>
                  )}
                </div>

                {/* Response preview */}
                {(rule.responseText || rule.mediaUrl) && (
                  <p className="mt-3 rounded-2xl bg-[#FBFAFF] px-3 py-2.5 text-[11px] font-bold leading-6 text-[#6D6780] ring-1 ring-[#ECE8F6]">
                    {short(rule.responseText || rule.mediaUrl)}
                  </p>
                )}

                {/* Action buttons */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link
                    href={`/dashboard/automation/rules/new?id=${rule.id}`}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#F2EEFF] text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> ویرایش
                  </Link>
                  <button
                    onClick={() => duplicateRule(rule)}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-white text-[11px] font-black text-[#24123F] ring-1 ring-[#ECE8F6]"
                  >
                    <Copy className="h-3.5 w-3.5" /> کپی
                  </button>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-red-50 text-[11px] font-black text-red-700 ring-1 ring-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> حذف
                  </button>
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
