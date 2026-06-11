"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Image as ImageIcon, Loader2, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AppNav } from "@/components/app-nav";

type ButtonItem = { label: string; url: string };
type DirectCard = { id: string; name: string; title: string; description: string; imageUrl: string; price: string; buttons: ButtonItem[]; isActive: boolean };

function clean(value: string) { return value.trim(); }

function emptyButton(): ButtonItem { return { label: "مشاهده", url: "" }; }

export default function DirectCardsPage() {
  const [cards, setCards] = useState<DirectCard[]>([]);
  const [name, setName] = useState("کارت منوی اصلی");
  const [title, setTitle] = useState("منوی شانشین");
  const [description, setDescription] = useState("برای مشاهده منوی کامل و رزرو از دکمه‌های زیر استفاده کنید.");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [buttons, setButtons] = useState<ButtonItem[]>([{ label: "مشاهده منو", url: "" }, { label: "رزرو میز", url: "" }]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/automation/cards", { cache: "no-store" });
    if (res.status === 401) location.assign("/auth/login");
    const json = await res.json().catch(() => ({}));
    setCards(json.cards || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function updateButton(index: number, patch: Partial<ButtonItem>) {
    setButtons((old) => old.map((button, i) => i === index ? { ...button, ...patch } : button));
  }

  function removeButton(index: number) {
    setButtons((old) => old.filter((_, i) => i !== index));
  }

  async function save() {
    setMessage("");
    const cleanButtons = buttons.filter((button) => clean(button.label) && clean(button.url));
    const res = await fetch("/api/automation/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, title, description, imageUrl, price, buttons: cleanButtons, isActive }),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) { setMessage(json.error || "ذخیره کارت ناموفق بود."); return; }
    setImageUrl("");
    setPrice("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("این کارت حذف شود؟")) return;
    await fetch(`/api/automation/cards/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link>
            <h1 className="text-[22px] font-black">کارت‌ها و ویترین</h1>
            <ShoppingBag className="h-5 w-5 text-[#5B2BE2]" />
          </div>
        </header>

        <section className="rounded-[24px] bg-[#F4EBFF] p-3 text-right text-[12px] font-bold leading-6 text-[#5B2BE2] ring-1 ring-[#E6D6FF]">
          کارت‌ها برای دایرکت مارکتینگ استفاده می‌شوند: عکس، عنوان، توضیح و دکمه‌های لینک‌دار. اگر ارسال native کارت محدود بود، برنامه متن مرتب + لینک دکمه‌ها را ارسال می‌کند.
        </section>

        <section className="rounded-[26px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-right text-[13px] font-black text-[#24123F]">ساخت کارت جدید</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام داخلی کارت" className="mt-3 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[12px] font-bold outline-none" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان کارت" className="mt-2 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات کارت" className="mt-2 min-h-[80px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[12px] font-bold outline-none" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="قیمت اختیاری" className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-bold outline-none" />
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="لینک عکس" dir="ltr" className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-left text-[12px] font-bold outline-none" />
          </div>
          <label className="mt-2 flex items-center justify-between rounded-2xl bg-[#FBFAFF] p-3 text-[12px] font-black text-[#24123F] ring-1 ring-[#ECE8F6]"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 accent-[#5B2BE2]" /> کارت فعال</label>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between"><button onClick={() => setButtons((old) => [...old, emptyButton()].slice(0, 6))} className="flex h-10 items-center gap-1 rounded-2xl bg-[#F2EEFF] px-3 text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"><Plus className="h-4 w-4" /> افزودن دکمه</button><p className="text-[12px] font-black">دکمه‌های کارت</p></div>
            {buttons.map((button, index) => (
              <div key={index} className="rounded-2xl bg-[#FBFAFF] p-2 ring-1 ring-[#ECE8F6]">
                <div className="mb-2 flex items-center justify-between"><button onClick={() => removeButton(index)} className="grid h-8 w-8 place-items-center rounded-xl bg-red-50 text-red-700"><X className="h-4 w-4" /></button><span className="text-[11px] font-black text-[#5B2BE2]">دکمه {index + 1}</span></div>
                <input value={button.label} onChange={(e) => updateButton(index, { label: e.target.value })} placeholder="عنوان دکمه" className="h-10 w-full rounded-xl border border-[#ECE8F6] bg-white px-2 text-right text-[11px] font-bold outline-none" />
                <input value={button.url} onChange={(e) => updateButton(index, { url: e.target.value })} placeholder="https://..." dir="ltr" className="mt-2 h-10 w-full rounded-xl border border-[#ECE8F6] bg-white px-2 text-left text-[11px] font-bold outline-none" />
              </div>
            ))}
          </div>
          {message && <p className="mt-2 rounded-2xl bg-amber-50 p-2 text-right text-[11px] font-bold text-amber-800 ring-1 ring-amber-100">{message}</p>}
          <button onClick={save} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[13px] font-black text-white"><Plus className="h-4 w-4" /> ذخیره کارت</button>
        </section>

        <section className="rounded-[26px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-[13px] font-black text-emerald-700">پیش‌نمایش کارت</p>
          <div className="mt-3 overflow-hidden rounded-[22px] bg-[#FBFAFF] ring-1 ring-[#ECE8F6]">
            {imageUrl ? <img src={imageUrl} alt="preview" className="h-36 w-full object-cover" /> : <div className="grid h-32 w-full place-items-center bg-[#F2EEFF] text-[#5B2BE2]"><ImageIcon className="h-10 w-10" /></div>}
            <div className="p-3"><p className="text-[16px] font-black text-[#24123F]">{title || "عنوان کارت"}</p><p className="mt-1 text-[12px] font-bold leading-6 text-[#6D6780]">{description || "توضیحات کارت"}</p>{price && <p className="mt-2 text-[12px] font-black text-emerald-700">{price}</p>}<div className="mt-3 space-y-2">{buttons.filter((b) => b.label).map((button, index) => <div key={index} className="flex h-10 items-center justify-between rounded-2xl bg-white px-3 text-[11px] font-black text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><ExternalLink className="h-4 w-4" /><span>{button.label}</span></div>)}</div></div>
          </div>
        </section>

        {loading && <section className="rounded-[24px] bg-white p-4 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></section>}
        <section className="grid grid-cols-2 gap-3 [&>*:last-child:nth-child(odd)]:col-span-2">
          {cards.map((card) => (
            <article key={card.id} className="overflow-hidden rounded-[24px] bg-white shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              {card.imageUrl ? <img src={card.imageUrl} alt={card.title} className="h-32 w-full object-cover" /> : null}
              <div className="p-3 text-right"><div className="flex items-start justify-between gap-3"><button onClick={() => remove(card.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-700"><Trash2 className="h-4 w-4" /></button><div className="min-w-0 flex-1"><p className="text-[15px] font-black text-[#24123F]">{card.title}</p><p className="mt-1 text-[11px] font-bold text-[#8A8498]">{card.name}</p></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><ShoppingBag className="h-5 w-5" /></div></div><p className="mt-3 line-clamp-2 rounded-2xl bg-[#FBFAFF] p-3 text-[11px] font-bold leading-6 text-[#6D6780] ring-1 ring-[#ECE8F6]">{card.description || "بدون توضیح"}</p><div className="mt-2 flex flex-wrap gap-2">{card.buttons.map((button, index) => <span key={index} className="rounded-full bg-[#F2EEFF] px-3 py-1 text-[10px] font-black text-[#5B2BE2]">{button.label}</span>)}</div></div>
            </article>
          ))}
        </section>
      </main>
      <AppNav />
    </div>
  );
}
