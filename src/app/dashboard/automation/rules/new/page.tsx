"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Home, Image as ImageIcon, Link2, Loader2, MessageCircle, Mic, Plus, Save, UsersRound, Video, X, Zap } from "lucide-react";

type Attachment = { type: "image" | "video" | "audio" | "file" | "link"; url: string; label?: string };
type Rule = { id: string; name: string; triggers: string[]; matchType: "equals" | "contains"; responseText: string; mediaType: "none" | "image" | "video" | "audio" | "file" | "link"; mediaUrl: string; attachments?: Attachment[]; isActive: boolean; sendOnce: boolean };

type Asset = { id: string; name: string; assetType: Attachment["type"]; url: string };
type Template = { id: string; title: string; body: string; mediaType?: Attachment["type"] | "none"; mediaUrl?: string };

const typeButtons = [
  { key: "image", label: "عکس", icon: ImageIcon },
  { key: "video", label: "ویدیو", icon: Video },
  { key: "audio", label: "صدا", icon: Mic },
  { key: "file", label: "فایل", icon: FileText },
] as const;

function fromParam(name: string) { if (typeof window === "undefined") return ""; return new URLSearchParams(window.location.search).get(name) || ""; }
function clean(value: string) { return value.trim(); }

export default function NewAutomationRulePage() {
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("ارسال منو خدمات");
  const [triggerInput, setTriggerInput] = useState("");
  const [triggers, setTriggers] = useState<string[]>(["منو"]);
  const [matchType, setMatchType] = useState<"equals" | "contains">("equals");
  const [responseText, setResponseText] = useState("سلام 🌹 منوی شانشین آماده است. لطفاً برای رزرو تعداد نفرات و ساعت حضورتان را بفرمایید.");
  const [mediaType, setMediaType] = useState<Rule["mediaType"]>("none");
  const [mediaUrl, setMediaUrl] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [sendOnce, setSendOnce] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = fromParam("id");
    void fetch("/api/automation/assets", { cache: "no-store" }).then((res) => res.json()).then((json) => setAssets(json.assets || [])).catch(() => setAssets([]));
    void fetch("/api/automation/templates", { cache: "no-store" }).then((res) => res.json()).then((json) => setTemplates(json.templates || [])).catch(() => setTemplates([]));
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
        setAttachments(rule.attachments || []);
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

  function removeTrigger(value: string) { setTriggers((old) => old.filter((item) => item !== value)); }
  function addAttachment(type: Attachment["type"]) { setAttachments((old) => [...old, { type, url: "", label: type === "image" ? "عکس" : type === "video" ? "ویدیو" : type === "audio" ? "صدا" : "فایل" }].slice(0, 8)); }
  function updateAttachment(index: number, patch: Partial<Attachment>) { setAttachments((old) => old.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  function removeAttachment(index: number) { setAttachments((old) => old.filter((_, i) => i !== index)); }
  function applyAsset(id: string) { const asset = assets.find((item) => item.id === id); if (asset) setAttachments((old) => [...old, { type: asset.assetType, url: asset.url, label: asset.name }].slice(0, 8)); }
  function applyTemplate(id: string) { const item = templates.find((template) => template.id === id); if (!item) return; setName(item.title); setResponseText(item.body); if (item.mediaUrl) setAttachments((old) => [...old, { type: (item.mediaType as Attachment["type"]) || "link", url: item.mediaUrl || "", label: item.title }].slice(0, 8)); }

  async function save() {
    setMessage("");
    setLoading(true);
    try {
      const payload = { name, triggers, matchType, responseText, mediaType, mediaUrl, attachments: attachments.filter((item) => item.url.trim()), isActive, sendOnce };
      const res = await fetch(editingId ? `/api/automation/rules/${editingId}` : "/api/automation/rules", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "ذخیره قانون ناموفق بود.");
      location.assign("/dashboard/automation/rules");
    } catch (error) {
      setMessage((error as Error).message || "ذخیره قانون ناموفق بود.");
    } finally { setLoading(false); }
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur"><div className="flex items-center justify-between gap-3"><Link href="/dashboard/automation/rules" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link><h1 className="text-[22px] font-black">{editingId ? "ویرایش قانون" : "ساخت قانون جدید"}</h1><Zap className="h-5 w-5 text-[#5B2BE2]" /></div></header>

        <section className="space-y-3 rounded-[26px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <label className="block text-[12px] font-black">نام قانون *</label><input value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[13px] font-bold outline-none" />
          <div><label className="block text-[12px] font-black">فعال‌کننده‌ها</label><div className="mt-2 flex flex-wrap gap-2">{triggers.map((item) => <button key={item} onClick={() => removeTrigger(item)} className="inline-flex items-center gap-1 rounded-full bg-[#F2EEFF] px-3 py-1 text-[11px] font-black text-[#5B2BE2]"><X className="h-3 w-3" /> {item}</button>)}</div><div className="mt-2 flex gap-2"><button onClick={addTrigger} className="h-12 rounded-2xl bg-[#5B2BE2] px-4 text-[12px] font-black text-white">افزودن</button><input value={triggerInput} onChange={(e) => setTriggerInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrigger(); } }} placeholder="کلمه را وارد کنید" className="h-12 min-w-0 flex-1 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none" /></div></div>
          <div><label className="block text-[12px] font-black">نوع شرط</label><select value={matchType} onChange={(e) => setMatchType(e.target.value as "equals" | "contains")} className="mt-2 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none"><option value="equals">برابر با</option><option value="contains">شامل</option></select></div>
          <div><label className="block text-[12px] font-black">پاسخ متنی *</label><textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="mt-2 min-h-[120px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[13px] font-bold leading-7 outline-none" /><p className="mt-1 text-left text-[10px] font-bold text-[#8A8498]">{responseText.length}/1800</p></div>
        </section>

        <section className="rounded-[26px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-[13px] font-black">رسانه و پیوست‌ها</p>
          <div className="mt-3 grid grid-cols-4 gap-2">{typeButtons.map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => addAttachment(item.key)} className="flex h-12 flex-col items-center justify-center rounded-2xl bg-[#FBFAFF] text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"><Icon className="h-4 w-4" />{item.label}</button>; })}</div>
          {!!assets.length && <select onChange={(e) => { if (e.target.value) applyAsset(e.target.value); e.currentTarget.value = ""; }} className="mt-3 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none"><option value="">انتخاب از پیوست‌های ذخیره‌شده</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>}
          {!!templates.length && <select onChange={(e) => { if (e.target.value) applyTemplate(e.target.value); e.currentTarget.value = ""; }} className="mt-2 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none"><option value="">استفاده از قالب آماده</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}</select>}
          <div className="mt-3 space-y-2">{attachments.map((item, index) => <div key={index} className="rounded-2xl bg-[#FBFAFF] p-2 ring-1 ring-[#ECE8F6]"><div className="mb-2 flex items-center justify-between"><button onClick={() => removeAttachment(index)} className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-700"><X className="h-4 w-4" /></button><span className="text-[11px] font-black text-[#5B2BE2]">{item.label || item.type}</span></div><input value={item.url} onChange={(e) => updateAttachment(index, { url: e.target.value })} placeholder="https://..." dir="ltr" className="h-11 w-full rounded-xl border border-[#ECE8F6] bg-white px-2 text-left text-[11px] font-bold outline-none" /></div>)}</div>
        </section>

        <section className="rounded-[26px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <label className="flex items-center justify-between rounded-2xl bg-[#FBFAFF] p-3 text-[12px] font-black"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 accent-[#5B2BE2]" /> ارسال خودکار فعال</label>
          <label className="mt-2 flex items-center justify-between rounded-2xl bg-[#FBFAFF] p-3 text-[12px] font-black"><input type="checkbox" checked={sendOnce} onChange={(e) => setSendOnce(e.target.checked)} className="h-5 w-5 accent-[#5B2BE2]" /> پاسخ فقط یک‌بار به هر پیام</label>
        </section>

        <section className="rounded-[26px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"><p className="text-[12px] font-black text-emerald-700">پیش‌نمایش</p><div className="mt-2 rounded-2xl bg-[#FBFAFF] p-3 text-[12px] font-bold leading-7 text-[#24123F] ring-1 ring-[#ECE8F6]"><p className="text-left text-[11px] text-[#8A8498]">کاربر: {triggers[0] || "منو"}</p><p className="mt-2 whitespace-pre-line">{responseText}</p>{attachments.filter((item) => item.url).map((item, index) => <p key={index} dir="ltr" className="mt-2 truncate rounded-xl bg-white p-2 text-left text-[10px] text-[#5B2BE2] ring-1 ring-[#ECE8F6]">{item.label || item.type}: {item.url}</p>)}</div></section>

        {message && <section className="rounded-[20px] bg-amber-50 p-3 text-right text-[12px] font-bold leading-6 text-amber-900 ring-1 ring-amber-100">{message}</section>}
      </main>
      <button onClick={save} disabled={loading} className="fixed bottom-3 left-1/2 z-40 flex h-14 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[15px] font-black text-white shadow-[0_18px_34px_rgba(91,43,226,0.26)] disabled:opacity-60">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} ذخیره قانون</button>
    </div>
  );
}
