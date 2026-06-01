"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Link2,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const statusOptions = [
  ["lead", "لید جدید"],
  ["followup", "پیگیری"],
  ["customer", "مشتری شد"],
  ["vip", "VIP"],
  ["lost", "رد شد"],
];

const filters = [["all", "همه"], ...statusOptions];

type Lead = {
  id: string;
  name?: string | null;
  username?: string | null;
  phone?: string | null;
  status: string;
  leadScore: number;
  notes?: string | null;
  lastContactAt: string;
  instagramAccount?: { username?: string | null; name?: string | null };
  conversations?: Array<{ id: string; lastMessage?: string | null; unreadCount: number; updatedAt: string }>;
};

type Stats = {
  total: number;
  active: number;
  followup: number;
  customer: number;
  vip: number;
  lost: number;
};

function formatCount(value?: number) {
  return (value ?? 0).toLocaleString("fa-IR");
}

function statusLabel(value?: string) {
  return statusOptions.find(([key]) => key === value)?.[1] || "لید";
}

function leadName(lead: Lead) {
  return lead.name || lead.username || lead.phone || "لید بدون نام";
}

function statusClass(value?: string) {
  if (value === "customer") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (value === "followup") return "bg-amber-50 text-amber-700 ring-amber-100";
  if (value === "vip") return "bg-violet-50 text-violet-700 ring-violet-100";
  if (value === "lost") return "bg-rose-50 text-rose-700 ring-rose-100";
  return "bg-[#F2EEFF] text-[#5B2BE2] ring-[#E6DCF8]";
}

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", username: "", status: "lead", notes: "" });

  async function load() {
    const params = new URLSearchParams({ status: filter });
    if (q.trim()) params.set("q", q.trim());

    const res = await fetch(`/api/leads?${params}`);
    if (res.status === 401) {
      location.assign("/auth/login");
      return;
    }
    const json = await res.json();
    setItems(json.leads || []);
    setStats(json.stats || null);
  }

  useEffect(() => {
    const params = new URLSearchParams({ status: filter });
    if (q.trim()) params.set("q", q.trim());

    fetch(`/api/leads?${params}`)
      .then((res) => {
        if (res.status === 401) location.assign("/auth/login");
        return res.json();
      })
      .then((json) => {
        setItems(json.leads || []);
        setStats(json.stats || null);
      })
      .catch(() => {
        setItems([]);
        setStats(null);
      });
  }, [q, filter]);

  const activePercent = useMemo(() => {
    if (!stats?.total) return 0;
    return Math.round(((stats.customer + stats.followup + stats.vip) / stats.total) * 100);
  }, [stats]);

  async function addLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) return;
    setForm({ name: "", phone: "", username: "", status: "lead", notes: "" });
    await load();
  }

  async function updateStatus(id: string, status: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-24 pt-3">
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#24123F] via-[#5B2BE2] to-[#8E58FF] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/12 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
                <UsersRound className="h-3.5 w-3.5" /> Customers & Leads
              </p>
              <h1 className="mt-2 text-[27px] font-black leading-none">لیدها و مشتریان</h1>
              <p className="mt-2 text-[12px] font-bold leading-6 text-white/70">ثبت، پیگیری و تبدیل لیدهای اینستاگرام به مشتری</p>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <UsersRound className="mx-auto h-4 w-4" />
              <p className="mt-1 text-[21px] font-black leading-none">{formatCount(stats?.active)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">فعال</p>
            </div>
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-200" />
              <p className="mt-1 text-[21px] font-black leading-none">{formatCount(stats?.customer)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">مشتری</p>
            </div>
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <Star className="mx-auto h-4 w-4 text-[#FFD66B]" />
              <p className="mt-1 text-[21px] font-black leading-none">{formatCount(activePercent)}٪</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">کیفیت</p>
            </div>
          </div>
        </header>

        <form onSubmit={addLead} className="rounded-[30px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="mb-3 flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-right">
              <p className="text-[15px] font-black">ثبت سریع لید</p>
              <p className="text-[11px] font-bold text-[#7C748E]">بعداً از دایرکت هم خودکار اضافه می‌شود</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام مشتری" className="h-11 rounded-2xl border-[#ECE8F6] bg-[#FAF9FF] text-right text-[13px] font-bold" />
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="شماره موبایل" className="h-11 rounded-2xl border-[#ECE8F6] bg-[#FAF9FF] text-right text-[13px] font-bold" />
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="آی‌دی اینستاگرام" className="h-11 rounded-2xl border-[#ECE8F6] bg-[#FAF9FF] text-right text-[13px] font-bold" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-11 rounded-2xl border border-[#ECE8F6] bg-[#FAF9FF] px-3 text-right text-[13px] font-black outline-none">
              {statusOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="یادداشت کوتاه: از کجا آمد؟ چی می‌خواست؟"
            className="mt-2 h-16 w-full resize-none rounded-2xl border border-[#ECE8F6] bg-[#FAF9FF] px-3 py-2 text-right text-[13px] font-bold outline-none"
          />
          <Button disabled={saving} className="mt-2 h-11 w-full rounded-2xl bg-[#5B2BE2] text-[13px] font-black text-white shadow-lg shadow-violet-200 hover:bg-[#4A20C9]">
            {saving ? "در حال ثبت..." : "ثبت لید"}
          </Button>
        </form>

        <section className="rounded-[28px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="flex h-11 items-center gap-2 rounded-[20px] bg-[#FAF9FF] px-3 ring-1 ring-[#ECE8F6]">
            <Search className="h-5 w-5 text-[#8A8498]" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نام، شماره یا آی‌دی..." className="h-10 border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0" />
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {filters.map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} className={`h-9 shrink-0 rounded-2xl px-4 text-[12px] font-black ${filter === key ? "bg-[#5B2BE2] text-white shadow-lg shadow-violet-200" : "bg-[#F8F6FF] text-[#6D6780] ring-1 ring-[#ECE8F6]"}`}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          {!items.length ? (
            <div className="rounded-[30px] border border-dashed border-[#DAD1EF] bg-white p-7 text-center shadow-[0_14px_34px_rgba(42,16,90,0.06)]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-[#F2EEFF] text-[#5B2BE2]">
                <UserRound className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-[17px] font-black">هنوز لیدی ثبت نشده</h2>
              <p className="mt-2 text-[12px] font-bold leading-6 text-[#7C748E]">اولین لید را از فرم بالا ثبت کن یا بعداً از دایرکت تبدیلش کن.</p>
            </div>
          ) : (
            items.map((lead) => {
              const latest = lead.conversations?.[0];
              return (
                <article key={lead.id} className="rounded-[26px] bg-white p-3 shadow-[0_12px_30px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-[#FF2D55] via-[#8E58FF] to-[#5B2BE2] text-lg font-black text-white">
                      {leadName(lead).slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${statusClass(lead.status)}`}>{statusLabel(lead.status)}</span>
                        <p className="truncate text-[15px] font-black">{leadName(lead)}</p>
                      </div>
                      <div className="mt-1 flex flex-wrap justify-end gap-2 text-[11px] font-bold text-[#7C748E]">
                        {lead.phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="h-3.5 w-3.5" /> {lead.phone}</span>}
                        {lead.username && <span dir="ltr">@{lead.username}</span>}
                      </div>
                      {lead.notes && <p className="mt-2 line-clamp-2 text-[12px] font-bold leading-6 text-[#6D6780]">{lead.notes}</p>}
                      {latest?.id && (
                        <Link href={`/dashboard/inbox/${latest.id}`} className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F2EEFF] px-3 py-1 text-[11px] font-black text-[#5B2BE2]">
                          <MessageCircle className="h-3.5 w-3.5" /> مشاهده گفتگو
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-1">
                    {statusOptions.map(([key, label]) => (
                      <button key={key} onClick={() => updateStatus(lead.id, key)} className={`h-8 rounded-xl text-[10px] font-black ${lead.status === key ? "bg-[#5B2BE2] text-white" : "bg-[#FAF9FF] text-[#7C748E] ring-1 ring-[#ECE8F6]"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })
          )}
        </section>

        <nav className="fixed bottom-3 left-1/2 z-20 h-[66px] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 rounded-[26px] bg-white/96 p-2 shadow-[0_-10px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
          <div className="grid h-full grid-cols-4 gap-1">
            <Link href="/dashboard" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]"><Home className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">داشبورد</span></Link>
            <Link href="/dashboard/leads" className="flex flex-col items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><UsersRound className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">لیدها</span></Link>
            <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]"><MessageCircle className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">اینباکس</span></Link>
            <Link href="/connect" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]"><Link2 className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">اتصال</span></Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
