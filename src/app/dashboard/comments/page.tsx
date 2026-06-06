"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Home, Link2, Loader2, MessageCircle, MessageSquare, Plus, Send, ShoppingBag, Trash2, UsersRound, Zap } from "lucide-react";

type Rule = { id: string; name: string; triggers: string[]; matchType: "equals" | "contains"; publicReply: string; dmReply: string; isActive: boolean; sendDm: boolean; cardId?: string };
type DirectCard = { id: string; name: string; title: string; description: string };

export default function CommentsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [name, setName] = useState("ارسال منو از کامنت");
  const [triggers, setTriggers] = useState("منو, menu");
  const [matchType, setMatchType] = useState<"equals" | "contains">("contains");
  const [publicReply, setPublicReply] = useState("منو براتون دایرکت شد 🌹");
  const [dmReply, setDmReply] = useState("سلام 🌹 منوی شانشین آماده است. لطفاً برای رزرو تعداد نفرات و ساعت حضورتان را بفرمایید.");
  const [sendDm, setSendDm] = useState(true);
  const [cardId, setCardId] = useState("");
  const [cards, setCards] = useState<DirectCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/automation/comment-rules", { cache: "no-store" });
    if (res.status === 401) location.assign("/auth/login");
    const json = await res.json().catch(() => ({}));
    setRules(json.rules || []);
    fetch("/api/automation/cards", { cache: "no-store" }).then((r) => r.json()).then((cardsJson) => setCards(cardsJson.cards || [])).catch(() => setCards([]));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setMessage("");
    const res = await fetch("/api/automation/comment-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, triggers, matchType, publicReply, dmReply, sendDm, cardId, isActive: true }) });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) { setMessage(json.error || "ذخیره قانون کامنت ناموفق بود."); return; }
    await load();
  }

  async function remove(id: string) {
    if (!confirm("این قانون کامنت حذف شود؟")) return;
    await fetch(`/api/automation/comment-rules/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur"><div className="flex items-center justify-between gap-3"><Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link><h1 className="text-[22px] font-black">کامنت هوشمند</h1><MessageSquare className="h-5 w-5 text-[#5B2BE2]" /></div></header>

        <section className="rounded-[24px] bg-amber-50 p-3 text-right text-[11px] font-bold leading-6 text-amber-900 ring-1 ring-amber-100">فعلاً تا قبل از App Review، این بخش برای آماده‌سازی و تست قانون‌هاست. بعد از فعال شدن Webhook کامنت، همین قوانین کامنت → دایرکت را اجرا می‌کنند.</section>

        <section className="rounded-[26px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-right text-[13px] font-black text-[#24123F]">ساخت قانون کامنت</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام قانون" className="mt-3 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[12px] font-bold outline-none" />
          <div className="mt-2 grid grid-cols-2 gap-2"><input value={triggers} onChange={(e) => setTriggers(e.target.value)} placeholder="منو, قیمت" className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none" /><select value={matchType} onChange={(e) => setMatchType(e.target.value as "equals" | "contains")} className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none"><option value="contains">شامل</option><option value="equals">برابر</option></select></div>
          <textarea value={publicReply} onChange={(e) => setPublicReply(e.target.value)} placeholder="پاسخ زیر کامنت" className="mt-2 min-h-[70px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[12px] font-bold outline-none" />
          <textarea value={dmReply} onChange={(e) => setDmReply(e.target.value)} placeholder="پیام دایرکت خصوصی" className="mt-2 min-h-[90px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[12px] font-bold outline-none" />
          <label className="mt-2 flex items-center justify-between rounded-2xl bg-[#FBFAFF] p-3 text-[12px] font-black text-[#24123F] ring-1 ring-[#ECE8F6]"><input type="checkbox" checked={sendDm} onChange={(e) => setSendDm(e.target.checked)} className="h-5 w-5 accent-[#5B2BE2]" /> ارسال دایرکت خصوصی</label>
          {!!cards.length && <select value={cardId} onChange={(e) => setCardId(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none"><option value="">بدون کارت دایرکت</option>{cards.map((card) => <option key={card.id} value={card.id}>{card.title || card.name}</option>)}</select>}
          <Link href="/dashboard/cards" className="mt-2 flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#F2EEFF] text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"><ShoppingBag className="h-4 w-4" /> ساخت کارت برای دایرکت کامنت</Link>
          {message && <p className="mt-2 rounded-2xl bg-amber-50 p-2 text-right text-[11px] font-bold text-amber-800 ring-1 ring-amber-100">{message}</p>}
          <button onClick={save} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[13px] font-black text-white"><Plus className="h-4 w-4" /> ذخیره قانون کامنت</button>
        </section>

        {loading && <section className="rounded-[24px] bg-white p-4 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></section>}
        <section className="space-y-3">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-[24px] bg-white p-3 text-right shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-start justify-between gap-3"><button onClick={() => remove(rule.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-700"><Trash2 className="h-4 w-4" /></button><div className="min-w-0 flex-1"><p className="text-[15px] font-black text-[#24123F]">{rule.name}</p><p className="mt-1 text-[11px] font-bold text-[#8A8498]">کلمات: {rule.triggers.join("، ")}</p></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><Send className="h-5 w-5" /></div></div>
              <p className="mt-3 rounded-2xl bg-[#FBFAFF] p-3 text-[11px] font-bold leading-6 text-[#6D6780] ring-1 ring-[#ECE8F6]">کامنت: {rule.publicReply}<br />دایرکت: {rule.dmReply || "—"}{rule.cardId ? <><br />کارت: {cards.find((card) => card.id === rule.cardId)?.title || "کارت متصل"}</> : null}</p>
            </article>
          ))}
        </section>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] rounded-t-[26px] bg-white/96 px-4 py-3 shadow-[0_-18px_36px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6] backdrop-blur"><div className="grid h-full grid-cols-5 gap-1 text-center text-[9px] font-black text-[#6D6780]"><Link href="/dashboard"><Home className="mx-auto h-5 w-5" /><span>خانه</span></Link><Link href="/dashboard/inbox"><MessageCircle className="mx-auto h-5 w-5" /><span>اینباکس</span></Link><Link href="/dashboard/automation/rules"><Zap className="mx-auto h-5 w-5" /><span>قوانین</span></Link><Link href="/dashboard/leads"><UsersRound className="mx-auto h-5 w-5" /><span>لیدها</span></Link><Link href="/connect"><Link2 className="mx-auto h-5 w-5" /><span>اتصال</span></Link></div></nav>
    </div>
  );
}
