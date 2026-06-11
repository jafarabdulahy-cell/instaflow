"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";

type ConnectionStatus = {
  connected: boolean;
  username?: string;
  hasMessageAccess?: boolean;
  source?: "database" | "server_env" | null;
};

export default function ConnectionPage() {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/instagram/settings");
      if (res.status === 401) {
        location.assign("/auth/login");
        return;
      }
      const json = await res.json();
      setStatus({
        connected: json.configured || false,
        username: json.account?.username || null,
        hasMessageAccess: json.configured || false,
        source: json.source || null,
      });
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();

    // بررسی پیام‌های success/error از URL
    const searchParams = new URLSearchParams(window.location.search);
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successParam) {
      setMessage("پیج شما با موفقیت متصل شد!");
      setMessageType("success");
      // پاک کردن URL parameters
      window.history.replaceState({}, "", "/dashboard/settings/connection");
    } else if (errorParam) {
      setMessage(decodeURIComponent(errorParam));
      setMessageType("error");
      // پاک کردن URL parameters
      window.history.replaceState({}, "", "/dashboard/settings/connection");
    }
  }, []);

  async function handleConnect() {
    setConnecting(true);

    try {
      const res = await fetch("/api/auth/instagram/start");
      const json = await res.json();

      if (!json.ok) {
        alert(json.error || "خطا در شروع اتصال");
        setConnecting(false);
        return;
      }

      // Redirect به Meta OAuth
      window.location.href = json.authUrl;
    } catch (error) {
      alert("خطا در اتصال به سرور");
      setConnecting(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F8F5FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-4 px-4 pb-28 pt-4">
        {/* Header */}
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] p-5 text-white shadow-[0_22px_60px_rgba(225,48,108,0.3)]">
          <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <Link
              href="/dashboard/settings"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex-1 text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1">
                <MessageCircle className="h-4 w-4" />
                <span className="text-[11px] font-black">Instagram</span>
              </div>
              <h1 className="mt-2 text-[25px] font-black leading-tight">
                اتصال پیج اینستاگرام
              </h1>
              <p className="mt-2 text-[12px] font-bold leading-6 text-white/80">
                پیج خود را با یک کلیک وصل کنید
              </p>
            </div>
          </div>
        </header>

        {/* پیام موفقیت یا خطا */}
        {message && messageType === "success" && (
          <section className="rounded-[26px] bg-emerald-50 p-4 text-right text-[13px] font-bold leading-6 text-emerald-900 ring-1 ring-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {message}
            </div>
          </section>
        )}

        {message && messageType === "error" && (
          <section className="rounded-[26px] bg-red-50 p-4 text-right text-[13px] font-bold leading-6 text-red-900 ring-1 ring-red-100">
            {message}
          </section>
        )}

        {/* وضعیت اتصال */}
        {loading ? (
          <section className="rounded-[28px] bg-white p-6 text-center shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#5B2BE2]" />
            <p className="mt-3 text-[13px] font-bold text-[#6D6780]">
              در حال بررسی وضعیت اتصال...
            </p>
          </section>
        ) : status.connected ? (
          <section className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] text-white">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[17px] font-black text-[#24123F]">
                  پیج شما متصل است
                </p>
                {status.username && (
                  <p className="mt-1 text-[15px] font-bold text-[#E1306C]">
                    @{status.username}
                  </p>
                )}
                <p className="mt-2 text-[12px] font-bold leading-6 text-emerald-700">
                  ✓ دسترسی پیام‌ها فعال است
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/inbox"
                className="rounded-2xl bg-[#F2EEFF] py-3 text-center text-[12px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8]"
              >
                مشاهده اینباکس
              </Link>
              <Link
                href="/dashboard/direct"
                className="rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] py-3 text-center text-[12px] font-black text-white"
              >
                دایرکت هوشمند
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-amber-50 text-amber-600">
                  <XCircle className="h-7 w-7" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[17px] font-black text-[#24123F]">
                    پیج متصل نیست
                  </p>
                  <p className="mt-2 text-[12px] font-bold leading-6 text-[#6D6780]">
                    برای استفاده از دایرکت هوشمند، ابتدا پیج اینستاگرام خود را وصل کنید.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] text-[14px] font-black text-white shadow-lg hover:opacity-90"
              >
                {connecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="ml-2 h-5 w-5" />
                    اتصال به اینستاگرام
                  </>
                )}
              </Button>
            </section>

            {/* پیام وضعیت */}
            {connecting && (
              <section className="rounded-[26px] bg-blue-50 p-4 text-center text-[13px] font-bold leading-7 text-blue-900 ring-1 ring-blue-100">
                <ShieldCheck className="mx-auto h-6 w-6 text-blue-600" />
                <p className="mt-2 font-black">در حال آماده‌سازی اتصال...</p>
                <p className="mt-1 text-[12px]">
                  اتصال یک‌کلیکه اینستاگرام در مرحله نهایی آماده‌سازی است.
                </p>
              </section>
            )}
          </>
        )}

        {/* راهنمای اتصال */}
        <section className="rounded-[26px] bg-gradient-to-br from-[#F2EEFF] to-white p-4 text-right text-[12px] font-bold leading-7 text-[#5B2BE2] ring-1 ring-[#E6DCF8]">
          <p className="font-black">چگونه کار می‌کند؟</p>
          <ul className="mt-2 space-y-1 text-[#6D6780]">
            <li>۱. دکمه «اتصال به اینستاگرام» را بزنید</li>
            <li>۲. با حساب فیسبوک خود وارد شوید</li>
            <li>۳. پیج اینستاگرام خود را انتخاب کنید</li>
            <li>۴. دسترسی‌ها را تأیید کنید</li>
            <li>۵. تمام! دایرکت هوشمند شما آماده است</li>
          </ul>
        </section>

        {/* امنیت */}
        <section className="rounded-[26px] bg-emerald-50 p-4 text-right text-[12px] font-bold leading-7 text-emerald-900 ring-1 ring-emerald-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="font-black">اتصال امن و رسمی</p>
          </div>
          <p className="mt-2">
            InstaFlow از طریق پروتکل رسمی Meta به پیج شما متصل می‌شود. اطلاعات شما
            کاملاً امن است و فقط برای مدیریت دایرکت‌های شما استفاده می‌شود.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <AppNav />
    </div>
  );
}
