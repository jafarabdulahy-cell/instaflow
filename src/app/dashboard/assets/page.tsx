"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Home, Image as ImageIcon, Link2, Loader2, MessageCircle, Mic, Paperclip, Plus, Trash2, UsersRound, Video, Zap } from "lucide-react";

type Asset = { id: string; name: string; assetType: "image" | "video" | "audio" | "file" | "link"; url: string; description?: string };

const typeOptions = [
  { key: "image", label: "عکس", icon: ImageIcon },
  { key: "video", label: "ویدیو", icon: Video },
  { key: "audio", label: "صدا", icon: Mic },
  { key: "file", label: "فایل/PDF", icon: FileText },
  { key: "link", label: "لینک", icon: Link2 },
] as const;

function typeLabel(type: Asset["assetType"]) {
  return typeOptions.find((item) => item.key === type)?.label || "لینک";
}

function TypeIcon({ type }: { type: Asset["assetType"] }) {
  const Icon = typeOptions.find((item) => item.key === type)?.icon || Link2;
  return <Icon className="h-5 w-5" />;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [name, setName] = useState("منوی شانشین");
  const [assetType, setAssetType] = useState<Asset["assetType"]>("file");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("لینک عمومی فایل یا عکس منو");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/automation/assets", { cache: "no-store" });
    if (res.status === 401) location.assign("/auth/login");
    const json = await res.json().catch(() => ({}));
    setAssets(json.assets || []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setMessage("");
    const res = await fetch("/api/automation/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, assetType, url, description }) });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) { setMessage(json.error || "ذخیره پیوست ناموفق بود."); return; }
    setUrl("");
    setDescription("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("این پیوست حذف شود؟")) return;
    await fetch(`/api/automation/assets/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-28 pt-3">
        <header className="sticky top-0 z-20 -mx-4 bg-[#F8F5FF]/92 px-4 pb-2 pt-2 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#24123F] shadow-sm ring-1 ring-[#ECE8F6]"><ArrowRight className="h-5 w-5" /></Link>
            <h1 className="text-[22px] font-black">پیوست‌ها و رسانه‌ها</h1>
            <Paperclip className="h-5 w-5 text-[#5B2BE2]" />
          </div>
        </header>

        <section className="rounded-[26px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="text-right text-[13px] font-black text-[#24123F]">افزودن لینک رسانه</p>
          <p className="mt-1 text-right text-[11px] font-bold leading-6 text-[#6D6780]">فعلاً فایل‌ها به‌صورت لینک عمومی ذخیره می‌شوند و در قوانین پاسخ استفاده می‌شوند.</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام پیوست" className="mt-3 h-12 w-full rounded-2xl border border-[#ECE8F6] bg-[#FBFAFF] px-3 text-right text-[13px] font-bold outline-none" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select value={assetType} onChange={(e) => setAssetType(e.target.value as Asset["assetType"])} className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-right text-[12px] font-black outline-none">
              {typeOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." dir="ltr" className="h-12 rounded-2xl border border-[#ECE8F6] bg-white px-3 text-left text-[12px] font-bold outline-none" />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیح کوتاه" className="mt-2 min-h-[70px] w-full rounded-2xl border border-[#ECE8F6] bg-white p-3 text-right text-[12px] font-bold outline-none" />
          {message && <p className="mt-2 rounded-2xl bg-amber-50 p-2 text-right text-[11px] font-bold text-amber-800 ring-1 ring-amber-100">{message}</p>}
          <button onClick={save} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-[#5B2BE2] to-[#B000B8] text-[13px] font-black text-white"><Plus className="h-4 w-4" /> ذخیره پیوست</button>
        </section>

        {loading && <section className="rounded-[24px] bg-white p-4 text-center text-[#5B2BE2] ring-1 ring-[#ECE8F6]"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></section>}
        <section className="space-y-3">
          {assets.map((asset) => (
            <article key={asset.id} className="rounded-[24px] bg-white p-3 shadow-[0_12px_28px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-start justify-between gap-3">
                <button onClick={() => remove(asset.id)} className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-100"><Trash2 className="h-4 w-4" /></button>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[15px] font-black text-[#24123F]">{asset.name}</p>
                  <p className="mt-1 text-[11px] font-bold text-[#8A8498]">{asset.description || "بدون توضیح"}</p>
                  <p dir="ltr" className="mt-2 truncate rounded-2xl bg-[#FBFAFF] p-2 text-left text-[10px] font-bold text-[#5B2BE2] ring-1 ring-[#ECE8F6]">{asset.url}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><TypeIcon type={asset.assetType} /></div>
              </div>
              <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">{typeLabel(asset.assetType)}</span>
            </article>
          ))}
        </section>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] rounded-t-[26px] bg-white/96 px-4 py-3 shadow-[0_-18px_36px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6] backdrop-blur"><div className="grid h-full grid-cols-5 gap-1 text-center text-[9px] font-black text-[#6D6780]"><Link href="/dashboard"><Home className="mx-auto h-5 w-5" /><span>خانه</span></Link><Link href="/dashboard/inbox"><MessageCircle className="mx-auto h-5 w-5" /><span>اینباکس</span></Link><Link href="/dashboard/automation/rules"><Zap className="mx-auto h-5 w-5" /><span>قوانین</span></Link><Link href="/dashboard/leads"><UsersRound className="mx-auto h-5 w-5" /><span>لیدها</span></Link><Link href="/connect"><Link2 className="mx-auto h-5 w-5" /><span>اتصال</span></Link></div></nav>
    </div>
  );
}
