"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Copy, FileText, Home, Link2, Loader2, MessageCircle, Plus, Trash2, UsersRound, Zap } from "lucide-react";

type Template = { id: string; title: string; category: string; body: string; mediaType?: string; mediaUrl?: string };

const defaults = [
  { title: "منو", category: "رستوران", body: "سلام 🌹 منوی شانشین آماده است. لطفاً برای رزرو تعداد نفرات و ساعت حضورتان را بفرمایید." },
  { title: "آدرس", category: "اطلاعات", body: "سلام 🌹 آدرس شانشین: بوکان، سه‌راه سنگینی. برای راهنمایی بیشتر پیام بدهید." },
  { title: "ساعت کاری", category: "اطلاعات", body: "سلام 🌹 شانشین همه‌روزه از ساعت ۱۱ تا ۱۲ شب آماده پذیرایی است." },
  { title: "رزرو", category: "رزرو", body: "سلام 🌹 برای رزرو لطفاً تعداد نفرات، ساعت حضور و نامتان را ارسال کنید." },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [title, setTitle] = useState(defaults[0].title);
  const [category, setCategory] = useState(defaults[0].category);
  const [body, setBody] = useState(defaults[0].body);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("none");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/automation/templates", { cache: "no-store" });
    if (res.status === 401) location.assign("/auth/login");
    const json = await res.json().catch(() => ({}));
    setTemplates(json.templates || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function applyDefault(index: number) {
    const item = defaults[index];
    setTitle(item.title);
    setCategory(item.category);
    setBody(item.body);
  }

  async function save() {
    setMessage("");
    const res = await fetch("/api/automation/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, category, body, mediaType, mediaUrl }) });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) { setMessage(json.error || "ذخیره قالب ناموفق بود."); return; }
    setMediaUrl("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("این قالب حذف شود؟")) return;
    await fetch(`/api/automation/templates/${id}`, { method: "DELETE" });
    await load();
  }

  async function copy(text: string) {
    await navigator.clipboard?.writeText(text).catch(() => undefined);
    setMessage("متن قالب کپی شد.");
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur"><div className="flex items-center justify-between gap-3"><Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link><h1 className="text-[22px] font-black">قالب‌ها و پاسخ‌ها</h1><BookOpen className="h-5 w-5 text-[#5B2BE2]" /></div></header>

        <section className="grid grid-cols-4 gap-2">
          {defaults.map((item, index) => <button key={item.title} onClick={() => applyDefault(index)} className="rounded-2xl bg-white px-2 py-3 text-[10px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]">{item.title}</button>)}
        </section>

        <section className="rounded-[26px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-right text-[13px] font-black text-[#24123F]">افزودن قالب آماده</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان" className="h-12 rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[12px] font-bold outline-none" /><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="دسته" className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none" /></div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="متن پاسخ آماده" className="mt-2 min-h-[110px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[12px] font-bold leading-6 outline-none" />
          <div className="mt-2 grid grid-cols-2 gap-2"><select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none"><option value="none">بدون رسانه</option><option value="image">عکس</option><option value="video">ویدیو</option><option value="audio">صدا</option><option value="file">فایل</option></select><input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="لینک اختیاری" dir="ltr" className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-left text-[12px] font-bold outline-none" /></div>
          {message && <p className="mt-2 rounded-2xl bg-emerald-50 p-2 text-right text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-100">{message}</p>}
          <button onClick={save} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[13px] font-black text-white"><Plus className="h-4 w-4" /> ذخیره قالب</button>
        </section>

        {loading && <section className="rounded-[24px] bg-white p-4 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></section>}
        <section className="space-y-3">
          {templates.map((item) => (
            <article key={item.id} className="rounded-[24px] bg-white p-3 text-right shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-start justify-between gap-3"><div className="flex gap-2"><button onClick={() => copy(item.body)} className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><Copy className="h-4 w-4" /></button><button onClick={() => remove(item.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-700"><Trash2 className="h-4 w-4" /></button></div><div className="min-w-0 flex-1"><p className="text-[15px] font-black text-[#24123F]">{item.title}</p><p className="mt-1 text-[11px] font-bold text-[#8A8498]">{item.category}</p></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><FileText className="h-5 w-5" /></div></div>
              <p className="mt-3 whitespace-pre-line rounded-2xl bg-[#FBFAFF] p-3 text-[11px] font-bold leading-6 text-[#6D6780] ring-1 ring-[#ECE8F6]">{item.body || item.mediaUrl}</p>
            </article>
          ))}
        </section>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] rounded-t-[26px] bg-white/96 px-4 py-3 shadow-[0_-18px_36px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6] backdrop-blur"><div className="grid h-full grid-cols-5 gap-1 text-center text-[9px] font-black text-[#6D6780]"><Link href="/dashboard"><Home className="mx-auto h-5 w-5" /><span>خانه</span></Link><Link href="/dashboard/inbox"><MessageCircle className="mx-auto h-5 w-5" /><span>اینباکس</span></Link><Link href="/dashboard/automation/rules"><Zap className="mx-auto h-5 w-5" /><span>قوانین</span></Link><Link href="/dashboard/leads"><UsersRound className="mx-auto h-5 w-5" /><span>لیدها</span></Link><Link href="/connect"><Link2 className="mx-auto h-5 w-5" /><span>اتصال</span></Link></div></nav>
    </div>
  );
}
