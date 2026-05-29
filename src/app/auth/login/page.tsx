"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(json.error || "ورود ناموفق بود.");
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6d5dfc] to-[#ec4899] flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-black">IF</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950">ورود به InstaFlow</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت حرفه‌ای دایرکت و مشتریان اینستاگرام</p>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-bold">ایمیل</label>
                <Input type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold">رمز عبور</label>
                <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required dir="ltr" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "در حال ورود..." : "ورود"}</Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-4">حساب نداری؟ <Link href="/auth/register" className="text-[#6d5dfc] font-bold hover:underline">ثبت‌نام کن</Link></p>
      </div>
    </main>
  );
}
