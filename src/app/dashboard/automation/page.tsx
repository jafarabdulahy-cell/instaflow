"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, CheckCircle2, FileText, Loader2, MessageCircle, MessageSquare, Paperclip, Plus, ShieldAlert, Zap } from "lucide-react";
import { AppNav } from "@/components/app-nav";

type Decision = {
  shouldReply: boolean;
  mode: "off" | "preview" | "live";
  liveSendAllowed: boolean;
  category: string;
  confidence: number;
  trigger: string;
  action: string;
  responseText: string;
  publicCommentReply?: string;
  privateReplyText?: string;
  needsHumanReview: boolean;
  reason: string;
};

type Rule = {
  id?: string;
  name?: string;
  trigger?: string;
  triggers?: string[];
  keywords?: string[];
  category?: string;
  responseText?: string;
  dm?: string;
  isActive?: boolean;
};

function label(rule: Rule) {
  return rule.name || rule.trigger || rule.category || "قانون";
}

function keywords(rule: Rule) {
  return (rule.triggers?.length ? rule.triggers : rule.keywords || []).join("، ");
}

export default function AutomationPage() {
  const [text, setText] = useState("منو");
  const [source, setSource] = useState("instagram_dm");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("preview");
  const [liveSendAllowed, setLiveSendAllowed] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("manual");

  async function loadRules() {
    const res = await fetch("/api/automation/rules", { cache: "no-store" });
    if (res.status === 401) {
      location.assign("/auth/login");
      return;
    }
    const json = await res.json();
    setRules(json.rules?.length ? json.rules : json.fallbackRules || []);
    setMode(json.mode || "preview");
    setLiveSendAllowed(Boolean(json.liveSendAllowed));
    setSourceLabel(json.source || "manual");
  }

  useEffect(() => { void loadRules().catch(() => setRules([])); }, []);

  async function preview() {
    setLoading(true);
    const res = await fetch("/api/automation/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source }),
    });
    setLoading(false);
    if (res.status === 401) {
      location.assign("/auth/login");
      return;
    }
    const json = await res.json();
    setDecision(json.decision || null);
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-24 pt-3">
        <header className="rounded-[30px] bg-gradient-to-br from-[#24123F] via-[#5B2BE2] to-[#8E58FF] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.22)]">
          <div className="flex items-start justify-between gap-3">
            <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
                <Bot className="h-3.5 w-3.5" /> Webhook Live Rules
              </p>
              <h1 className="mt-2 text-[25px] font-black leading-none">پاسخ خودکار اینستاگرام</h1>
              <p className="mt-2 text-[12px] font-bold leading-6 text-white/72">قانون را دستی بساز؛ پیام که برسد، Webhook همان لحظه جواب می‌دهد.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[11px] font-black">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/12">Mode: {mode}</div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/12">Live Send: {liveSendAllowed ? "فعال" : "خاموش"}</div>
          </div>
        </header>

        <section className="rounded-[26px] bg-emerald-50 p-3 text-right text-[12px] font-bold leading-6 text-emerald-900 ring-1 ring-emerald-100">
          <p className="flex items-center justify-end gap-2 font-black"><Zap className="h-4 w-4" /> مدل نهایی v23</p>
          <p className="mt-1">پاسخ‌ها نباید به باز بودن اینباکس وابسته باشند. آدرس Webhook را در Meta ثبت کن تا پیام‌ها به‌صورت Live روی Railway پردازش شوند.</p>
          <p dir="ltr" className="mt-2 break-all rounded-2xl bg-white p-2 text-left text-[10px] text-emerald-800 ring-1 ring-emerald-100">/api/webhook یا /api/meta/webhook</p>
        </section>

        <Link href="/dashboard/automation/rules" className="flex h-14 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[14px] font-black text-white shadow-[0_18px_34px_rgba(91,43,226,0.22)]"><Plus className="h-5 w-5" /> مدیریت و افزودن قوانین دستی</Link>

        <section className="grid grid-cols-4 gap-2">
          <Link href="/dashboard/assets" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Paperclip className="h-4 w-4" />پیوست</Link>
          <Link href="/dashboard/comments" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><MessageSquare className="h-4 w-4" />کامنت</Link>
          <Link href="/dashboard/templates" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><BookOpen className="h-4 w-4" />قالب‌ها</Link>
          <Link href="/dashboard/logs" className="flex h-14 flex-col items-center justify-center rounded-2xl bg-white text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><FileText className="h-4 w-4" />لاگ‌ها</Link>
        </section>

        <section className="rounded-[28px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-[#F2EEFF] px-3 py-1 text-[11px] font-black text-[#5B2BE2]">تست قانون‌ها</span>
            <MessageCircle className="h-5 w-5 text-[#5B2BE2]" />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[90px] w-full rounded-2xl border border-[#E6DCF8] bg-[#FBFAFF] p-3 text-right text-[13px] font-bold outline-none focus:border-[#5B2BE2]"
            placeholder="مثلاً: منو / امشب جا دارید؟ / آدرس کجاست؟"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-2xl border border-[#E6DCF8] bg-white p-3 text-right text-[12px] font-black outline-none">
              <option value="instagram_dm">دایرکت</option>
              <option value="instagram_comment">کامنت پست</option>
              <option value="instagram_story_reply">ریپلای استوری</option>
            </select>
            <button onClick={preview} disabled={loading} className="rounded-2xl bg-[#5B2BE2] p-3 text-[12px] font-black text-white disabled:opacity-60">
              {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "تشخیص و جواب"}
            </button>
          </div>
        </section>

        {decision && (
          <section className="rounded-[28px] bg-white p-4 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">{decision.trigger} | {decision.confidence}%</span>
              {decision.needsHumanReview ? <ShieldAlert className="h-5 w-5 text-amber-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            </div>
            <p className="mt-2 text-[12px] font-bold leading-6 text-[#6D6780]">{decision.reason}</p>
            <p className="mt-1 text-[11px] font-black text-[#5B2BE2]">Action: {decision.action}</p>
            <div className="mt-3 whitespace-pre-line rounded-2xl bg-[#FBFAFF] p-3 text-[13px] font-bold leading-7 text-[#24123F] ring-1 ring-[#ECE8F6]">
              <p className="mb-1 text-[11px] font-black text-[#5B2BE2]">متن پاسخ</p>
              {decision.privateReplyText || decision.responseText}
            </div>
          </section>
        )}

        <section className="rounded-[28px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-[#F2EEFF] px-3 py-1 text-[10px] font-black text-[#5B2BE2]">{sourceLabel === "manual" ? "قوانین دستی" : "پیش‌فرض"}</span>
            <p className="text-[13px] font-black text-[#24123F]">قانون‌های فعال</p>
          </div>
          <div className="space-y-2">
            {rules.slice(0, 8).map((rule, index) => (
              <div key={rule.id || rule.category || index} className="rounded-2xl bg-[#FBFAFF] p-3 ring-1 ring-[#ECE8F6]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-black text-[#24123F]">{label(rule)}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]">{rule.isActive === false ? "خاموش" : "فعال"}</span>
                </div>
                <p className="mt-2 text-[11px] font-bold leading-6 text-[#6D6780]">{keywords(rule) || "بدون کلیدواژه"}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <AppNav />
    </div>
  );
}
