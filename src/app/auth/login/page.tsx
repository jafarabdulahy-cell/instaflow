"use client";

import { useState } from "react";
import { ShanigramMark } from "@/components/brand-shanigram";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@instaflow.local");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !json.ok) {
      setError(json.error || "ورود ناموفق بود.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#F4F0FF] p-4">
      <form onSubmit={login} className="w-full max-w-[420px] rounded-[34px] bg-white p-5 shadow-[0_20px_55px_rgba(42,16,90,0.12)] ring-1 ring-[#ECE8F6]">
        <div className="flex items-center justify-between gap-3 text-right">
          <div>
            <p className="text-[24px] font-black text-[#17112A]">ورود به InstaFlow</p>
            <p className="mt-1 text-[12px] font-bold text-[#7C748E]">مدیریت دایرکت، قوانین، کارت و کامنت</p>
          </div>
          <ShanigramMark className="h-16 w-16" />
        </div>
        <label className="mt-6 block text-right text-[12px] font-black text-[#5B2BE2]">ایمیل</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-[#E6DCF8] px-4 text-left font-bold outline-none focus:ring-4 focus:ring-[#8E58FF]/10" dir="ltr" />
        <label className="mt-4 block text-right text-[12px] font-black text-[#5B2BE2]">رمز عبور</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 h-12 w-full rounded-2xl border border-[#E6DCF8] px-4 text-left font-bold outline-none focus:ring-4 focus:ring-[#8E58FF]/10" dir="ltr" />
        {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-right text-[12px] font-black text-red-700">{error}</p>}
        <button disabled={loading} className="mt-5 h-12 w-full rounded-2xl bg-[#5B2BE2] text-[14px] font-black text-white shadow-[0_14px_32px_rgba(91,43,226,.22)] disabled:opacity-60">
          {loading ? "در حال ورود..." : "ورود"}
        </button>
        <p className="mt-4 text-center text-[11px] font-bold leading-6 text-[#7C748E]">اگر دیتابیس خالی باشد، اولین ورود یک کاربر اولیه می‌سازد. برای تولید، رمز را بعداً تغییر بده.</p>
      </form>
    </main>
  );
}
