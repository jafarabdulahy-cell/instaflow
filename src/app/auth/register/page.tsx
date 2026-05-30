"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ShanigramLogo, ShanigramMark } from "@/components/brand-shanigram";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(json.error || "ثبت‌نام ناموفق بود.");
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#efe9ff_0,#ffffff_70%)] px-4 py-8 text-[#17112A]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[430px] flex-col justify-center animate-fade-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-[26px] bg-white shadow-[0_18px_45px_rgba(42,16,90,0.12)] ring-1 ring-[#ECE8F6]">
            <ShanigramMark className="h-16 w-16" />
          </div>
          <ShanigramLogo className="justify-center" markClassName="hidden" compact />
          <p className="mt-2 text-xs font-bold text-[#6D6780]">ساخت پنل اختصاصی برای مدیریت پیج</p>
        </div>

        <Card className="rounded-[28px] border-0 bg-white shadow-[0_22px_55px_rgba(42,16,90,0.10)] ring-1 ring-[#ECE8F6]">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-black">نام</label>
                <Input className="h-12 rounded-2xl" placeholder="نام شما" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black">ایمیل</label>
                <Input className="h-12 rounded-2xl" type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-black">رمز عبور</label>
                <Input className="h-12 rounded-2xl" type="password" placeholder="حداقل ۸ کاراکتر" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required dir="ltr" />
              </div>
              <Button type="submit" className="h-[52px] w-full rounded-2xl bg-[#5B2BE2] text-white shadow-[0_14px_32px_rgba(91,43,226,0.22)] hover:bg-[#4A20C9]" disabled={loading}>
                {loading ? "در حال ساخت حساب..." : "ساخت حساب شانیگرام"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-sm font-medium text-[#6D6780]">
          حساب داری؟ <Link href="/auth/login" className="font-black text-[#5B2BE2] hover:underline">وارد شو</Link>
        </p>
      </div>
    </main>
  );
}
