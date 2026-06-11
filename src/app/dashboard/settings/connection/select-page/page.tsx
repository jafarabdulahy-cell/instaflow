"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";

type PageData = {
  id: string;
  name: string;
  instagram: { id: string } | null;
};

export default function SelectPagePage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/instagram/pages");

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        throw new Error("دریافت لیست صفحات ناموفق بود");
      }

      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error || "خطا در دریافت صفحات");
      }

      setPages(json.pages || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function selectPage(pageId: string) {
    setConnecting(pageId);
    setError("");

    try {
      const res = await fetch("/api/auth/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });

      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error || "اتصال ناموفق بود");
      }

      // موفقیت - redirect به صفحه اتصال
      window.location.href = "/dashboard/settings/connection?success=true";
    } catch (err) {
      setError((err as Error).message);
      setConnecting(null);
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
              href="/dashboard/settings/connection"
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
                انتخاب پیج
              </h1>
              <p className="mt-2 text-[12px] font-bold leading-6 text-white/80">
                پیج اینستاگرام خود را انتخاب کنید
              </p>
            </div>
          </div>
        </header>

        {/* خطا */}
        {error && (
          <section className="rounded-[26px] bg-red-50 p-4 text-right text-[13px] font-bold leading-6 text-red-900 ring-1 ring-red-100">
            {error}
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="rounded-[28px] bg-white p-6 text-center shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#5B2BE2]" />
            <p className="mt-3 text-[13px] font-bold text-[#6D6780]">
              در حال دریافت لیست صفحات...
            </p>
          </section>
        )}

        {/* لیست صفحات */}
        {!loading && pages.length > 0 && (
          <section className="space-y-3">
            {pages.map((page) => (
              <div
                key={page.id}
                className="rounded-[28px] bg-white p-4 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] text-white">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[17px] font-black text-[#24123F]">
                      {page.name}
                    </p>
                    {page.instagram && (
                      <p className="mt-1 flex items-center gap-2 text-[12px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        متصل به Instagram Business
                      </p>
                    )}
                    {!page.instagram && (
                      <p className="mt-1 text-[12px] font-bold text-amber-700">
                        به Instagram Business متصل نیست
                      </p>
                    )}
                  </div>
                </div>

                {page.instagram && (
                  <Button
                    onClick={() => selectPage(page.id)}
                    disabled={connecting === page.id}
                    className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] text-[14px] font-black text-white shadow-lg hover:opacity-90"
                  >
                    {connecting === page.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "انتخاب این پیج"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </section>
        )}

        {/* اگر صفحه‌ای نیست */}
        {!loading && pages.length === 0 && (
          <section className="rounded-[28px] bg-white p-6 text-center shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <p className="text-[15px] font-bold text-[#6D6780]">
              هیچ صفحه‌ای با Instagram Business متصل پیدا نشد
            </p>
            <Link
              href="/dashboard/settings/connection"
              className="mt-4 inline-block rounded-2xl bg-[#5B2BE2] px-6 py-3 text-[13px] font-black text-white"
            >
              بازگشت
            </Link>
          </section>
        )}
      </main>

      <AppNav />
    </div>
  );
}
