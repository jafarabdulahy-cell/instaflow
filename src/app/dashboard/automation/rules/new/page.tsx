"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Image as ImageIcon, Loader2, Play, Save, Smile, Volume2, X } from "lucide-react";

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

const mediaTypes = [
  { key: "image", label: "افزودن عکس", icon: ImageIcon },
  { key: "video", label: "افزودن ویدیو", icon: Play },
  { key: "audio", label: "افزودن صدا", icon: Volume2 },
  { key: "file", label: "افزودن فایل", icon: FileText },
] as const;

function clean(value: string) { return value.trim(); }
function fromParam(name: string) {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) || "";
}

export default function NewAutomationRulePage() {
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [triggerInput, setTriggerInput] = useState("");
  const [triggers, setTriggers] = useState<string[]>(["منو"]);
  const [matchType, setMatchType] = useState<"equals" | "contains">("equals");
  const [responseText, setResponseText] = useState("سلام! خوشحالیم که با ما هستید 😊\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید:");
  const [mediaType, setMediaType] = useState<Rule["mediaType"]>("none");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sendOnce, setSendOnce] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = fromParam("id");
    if (!id) return;
    setEditingId(id);
    setLoading(true);
    fetch(`/api/automation/rules/${id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok || !json.rule) throw new Error(json.error || "قانون پیدا نشد.");
        const rule = json.rule as Rule;
        setName(rule.name || "");
        setTriggers(rule.triggers?.length ? rule.triggers : []);
        setMatchType(rule.matchType || "equals");
        setResponseText(rule.responseText || "");
        setMediaType(rule.mediaType || "none");
        setMediaUrl(rule.mediaUrl || "");
        setIsActive(rule.isActive !== false);
        setSendOnce(rule.sendOnce !== false);
      })
      .catch((error) => setMessage((error as Error).message || "خواندن قانون ناموفق بود."))
      .finally(() => setLoading(false));
  }, []);

  function addTrigger() {
    const value = clean(triggerInput).replace(/^#/, "");
    if (!value) return;
    setTriggers((old) => Array.from(new Set([...old, value])).slice(0, 20));
    setTriggerInput("");
  }

  function removeTrigger(value: string) {
    setTriggers((old) => old.filter((item) => item !== value));
  }

  async function save() {
    setMessage("");
    setLoading(true);
    try {
      const payload = { name, triggers, matchType, responseText, mediaType, mediaUrl, isActive, sendOnce };
      const res = await fetch(editingId ? `/api/automation/rules/${editingId}` : "/api/automation/rules", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "ذخیره قانون ناموفق بود.");
      location.assign("/dashboard/automation/rules?v=23");
    } catch (error) {
      setMessage((error as Error).message || "ذخیره قانون ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  const previewText = useMemo(() => {
    const parts = [responseText];
    if (mediaUrl && mediaType !== "none") parts.push(`${mediaTypes.find((item) => item.key === mediaType)?.label.replace("افزودن ", "") || "لینک"}: ${mediaUrl}`);
    return parts.filter(Boolean).join("\n\n");
  }, [responseText, mediaType, mediaUrl]);

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard/automation/rules" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link>
            <h1 className="text-[22px] font-black">{editingId ? "ویرایش قانون" : "ساخت قانون جدید"}</h1>
            <span className="w-10" />
          </div>
        </header>

        {message && <section className="rounded-[20px] bg-amber-50 p-3 text-right text-[12px] font-bold leading-6 text-amber-900 ring-1 ring-amber-100">{message}</section>}

        <section className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
          <label className="text-[12px] font-black text-[#24123F]">نام قانون <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: ارسال منو خدمات" className="mt-2 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[13px] font-bold outline-none focus:border-[#5B2BE2]" />
        </section>

        <section className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
          <p className="text-[12px] font-black text-[#24123F]">فعال‌کننده‌ها</p>
          <p className="mt-1 text-[11px] font-bold text-[#8A8498]">وقتی کاربر این کلمات را ارسال کند، پاسخ اجرا می‌شود.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {triggers.map((item) => (
              <button key={item} type="button" onClick={() => removeTrigger(item)} className="inline-flex items-center gap-1 rounded-full bg-[#F2EEFF] px-3 py-2 text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"><X className="h-3.5 w-3.5" /> {item}</button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={triggerInput} onChange={(e) => setTriggerInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrigger(); } }} placeholder="کلمه را وارد کنید و Enter بزنید" className="h-12 min-w-0 flex-1 rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[12px] font-bold outline-none focus:border-[#5B2BE2]" />
            <button type="button" onClick={addTrigger} className="h-12 rounded-2xl bg-[#5B2BE2] px-4 text-[12px] font-black text-white">افزودن</button>
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
          <label className="text-[12px] font-black text-[#24123F]">نوع شرط</label>
          <select value={matchType} onChange={(e) => setMatchType(e.target.value as "equals" | "contains")} className="mt-2 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[13px] font-bold outline-none focus:border-[#5B2BE2]">
            <option value="equals">برابر با</option>
            <option value="contains">شامل کلمه</option>
          </select>
        </section>

        <section className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
          <label className="text-[12px] font-black text-[#24123F]">پاسخ متنی <span className="text-red-500">*</span></label>
          <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="mt-2 min-h-[118px] w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] p-3 text-right text-[13px] font-bold leading-7 outline-none focus:border-[#5B2BE2]" />
          <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-[#8A8498]"><span>{responseText.length.toLocaleString("fa-IR")}/1000</span><Smile className="h-4 w-4" /></div>
          <p className="mt-3 text-[12px] font-black text-[#24123F]">رسانه / لینک اختیاری</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {mediaTypes.map((item) => {
              const Icon = item.icon;
              const active = mediaType === item.key;
              return <button key={item.key} type="button" onClick={() => setMediaType(active ? "none" : item.key)} className={`flex h-11 items-center justify-center gap-1 rounded-2xl text-[11px] font-black ring-1 ${active ? "bg-[#5B2BE2] text-white ring-[#5B2BE2]" : "bg-[#FBFAFF] text-[#5B2BE2] ring-[#E6DCF8]"}`}><Icon className="h-4 w-4" />{item.label}</button>;
            })}
          </div>
          {mediaType !== "none" && (
            <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} dir="ltr" placeholder="https://... لینک فایل / عکس / ویدیو" className="mt-3 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-left text-[12px] font-bold outline-none focus:border-[#5B2BE2]" />
          )}
        </section>

        <section className="space-y-2">
          <button type="button" onClick={() => setIsActive((v) => !v)} className="flex w-full items-center justify-between rounded-[22px] bg-white p-3 text-right shadow-[0_10px_22px_rgba(42,16,90,0.04)] ring-1 ring-[#ECE8F6]">
            <span><span className="block text-[13px] font-black text-[#24123F]">ارسال خودکار فعال</span><span className="mt-1 block text-[11px] font-bold text-[#8A8498]">پاسخ به محض دریافت پیام ارسال شود</span></span>
            <span className={`h-7 w-12 rounded-full p-1 transition ${isActive ? "bg-[#8A22C8]" : "bg-slate-200"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${isActive ? "translate-x-0" : "-translate-x-5"}`} /></span>
          </button>
          <button type="button" onClick={() => setSendOnce((v) => !v)} className="flex w-full items-center justify-between rounded-[22px] bg-white p-3 text-right shadow-[0_10px_22px_rgba(42,16,90,0.04)] ring-1 ring-[#ECE8F6]">
            <span><span className="block text-[13px] font-black text-[#24123F]">پاسخ فقط یک‌بار به هر پیام</span><span className="mt-1 block text-[11px] font-bold text-[#8A8498]">از پاسخ تکراری به پیام مشابه جلوگیری کند</span></span>
            <span className={`h-7 w-12 rounded-full p-1 transition ${sendOnce ? "bg-[#8A22C8]" : "bg-slate-200"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${sendOnce ? "translate-x-0" : "-translate-x-5"}`} /></span>
          </button>
        </section>

        <section className="rounded-[24px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
          <p className="flex items-center justify-end gap-2 text-[13px] font-black text-[#24123F]"><span className="h-2 w-2 rounded-full bg-emerald-500" /> پیش‌نمایش زنده</p>
          <div className="mt-3 rounded-[24px] bg-[#FBFAFF] p-3 ring-1 ring-[#ECE8F6]">
            <div className="flex items-center justify-between border-b border-[#ECE8F6] pb-2">
              <span className="text-[11px] font-bold text-[#8A8498]">فعال در اینستاگرام</span>
              <span dir="ltr" className="text-[12px] font-black text-[#24123F]">travel_with_me</span>
            </div>
            <div className="mt-3 space-y-3">
              <div className="mr-auto max-w-[80%] rounded-2xl bg-[#F2DFFF] px-3 py-2 text-[12px] font-bold text-[#24123F]">{triggers[0] || "منو"}</div>
              <div className="max-w-[86%] rounded-2xl bg-white p-3 text-[12px] font-bold leading-6 text-[#24123F] ring-1 ring-[#ECE8F6] whitespace-pre-line">{previewText || "پاسخ اینجا نمایش داده می‌شود."}</div>
            </div>
          </div>
        </section>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] bg-white/95 p-4 shadow-[0_-18px_36px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6] backdrop-blur">
        <button onClick={save} disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[15px] font-black text-white shadow-[0_18px_34px_rgba(91,43,226,0.22)] disabled:opacity-60">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} ذخیره قانون
        </button>
      </div>
    </div>
  );
}
