"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  EyeOff,
  Home,
  Link2,
  Loader2,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ApiTest = {
  key: string;
  title: string;
  endpoint: string;
  ok: boolean;
  status?: number;
  count?: number;
  hasNext?: boolean;
  message?: string;
};

type Diagnostics = {
  ok: boolean;
  profile?: { id?: string; username?: string; name?: string; profile_picture_url?: string } | null;
  conversations?: Array<{ id: string; updated_time?: string }>;
  tests?: ApiTest[];
  emptyReason?: string;
  source?: "saved" | "body" | "server_env";
  error?: string;
};

type SettingsResponse = {
  configured: boolean;
  source?: "database" | "server_env" | null;
  account?: {
    instagramId: string;
    username?: string | null;
    name?: string | null;
    tokenPreview?: string;
    webhookStatus?: string;
    connectedAt?: string;
    tokenStorage?: "database" | "server_env";
  } | null;
};

function okText(ok?: boolean) {
  return ok ? "موفق" : "نیاز به بررسی";
}

function statusClass(ok?: boolean) {
  return ok ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100";
}

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("fa-IR");
}

export default function ConnectPage() {
  const [instagramId, setInstagramId] = useState("17841453193519327");
  const [accessToken, setAccessToken] = useState("");
  const [tokenTouched, setTokenTouched] = useState(false);
  const [showTokenEditor, setShowTokenEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [syncResult, setSyncResult] = useState<Record<string, unknown> | null>(null);

  const hasSavedToken = Boolean(settings?.account?.tokenPreview);
  const serverTokenActive = settings?.source === "server_env" || settings?.account?.tokenStorage === "server_env";
  const shouldShowTokenEditor = !hasSavedToken || showTokenEditor;
  const canTest = Boolean(instagramId.trim() && (accessToken.trim() || hasSavedToken));

  const headline = useMemo(() => {
    if (diagnostics?.ok && diagnostics.conversations?.length) return "دایرکت‌ها از API دریافت شدند";
    if (diagnostics?.ok) return "اتصال برقرار است؛ فعلاً data خالی است";
    if (serverTokenActive) return "توکن مخفی سرور فعال است";
    if (settings?.configured) return "اتصال ذخیره شده؛ آماده تست";
    return "اتصال Instagram API";
  }, [diagnostics, settings, serverTokenActive]);

  async function loadSettings() {
    const res = await fetch("/api/instagram/settings");
    if (res.status === 401) {
      location.assign("/auth/login");
      return;
    }
    const json = await res.json();
    setSettings(json);
    if (json?.account?.instagramId) setInstagramId(json.account.instagramId);
  }

  useEffect(() => {
    loadSettings().catch(() => setSettings(null));
  }, []);

  async function saveAndTest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setDiagnostics(null);
    setSyncResult(null);

    if (!instagramId.trim()) {
      setMessage("Instagram ID را وارد کنید.");
      return;
    }

    if (!accessToken.trim() && !hasSavedToken) {
      setMessage("Access Token را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      if (accessToken.trim()) {
        const saveRes = await fetch("/api/instagram/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instagramId: instagramId.trim(), accessToken: accessToken.trim() }),
        });
        const saveJson = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveJson.error || "ذخیره اتصال ناموفق بود.");
        setSettings({ configured: true, account: saveJson.account });
        setAccessToken("");
        setTokenTouched(false);
        setShowTokenEditor(false);
      }

      await runDiagnostics(true);
    } catch (error) {
      setMessage((error as Error).message || "خطا در اتصال.");
    } finally {
      setLoading(false);
    }
  }

  async function runDiagnostics(useSaved = false) {
    setTesting(true);
    setMessage("");
    setSyncResult(null);
    try {
      const body = useSaved || !accessToken.trim()
        ? {}
        : { instagramId: instagramId.trim(), accessToken: accessToken.trim() };
      const res = await fetch("/api/instagram/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "تست اتصال ناموفق بود.");
      setDiagnostics(json);
    } catch (error) {
      setMessage((error as Error).message || "تست اتصال ناموفق بود.");
    } finally {
      setTesting(false);
    }
  }

  async function syncDirects() {
    setSyncing(true);
    setMessage("");
    setSyncResult(null);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "همگام‌سازی ناموفق بود.");
      setSyncResult(json);
      await loadSettings();
    } catch (error) {
      setMessage((error as Error).message || "همگام‌سازی ناموفق بود.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col gap-3 px-4 pb-24 pt-3">
        <header className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#17112A] via-[#5B2BE2] to-[#FF2D80] p-4 text-white shadow-[0_22px_60px_rgba(42,16,90,0.24)]">
          <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/14 ring-1 ring-white/18 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="text-right">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-black text-white/82">
                <ShieldCheck className="h-3.5 w-3.5" /> Instagram API
              </p>
              <h1 className="mt-2 text-[25px] font-black leading-tight">{headline}</h1>
              <p className="mt-2 text-[12px] font-bold leading-6 text-white/70">اتصال رسمی شانشین به Meta، تست توکن و آماده‌سازی دریافت دایرکت</p>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-200" />
              <p className="mt-1 text-[18px] font-black leading-none">{diagnostics?.profile?.username || settings?.account?.username || "—"}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">اکانت</p>
            </div>
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <MessageCircle className="mx-auto h-4 w-4 text-[#FFD66B]" />
              <p className="mt-1 text-[21px] font-black leading-none">{formatNumber(diagnostics?.conversations?.length)}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">گفتگو API</p>
            </div>
            <div className="rounded-[20px] bg-white/10 p-2 text-center ring-1 ring-white/12">
              <Bot className="mx-auto h-4 w-4" />
              <p className="mt-1 text-[18px] font-black leading-none">{settings?.configured ? "ذخیره" : "جدید"}</p>
              <p className="mt-1 text-[10px] font-bold text-white/58">وضعیت</p>
            </div>
          </div>
        </header>

        <form onSubmit={saveAndTest} className="rounded-[30px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="mb-3 flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="text-right">
              <p className="text-[15px] font-black">تنظیم اتصال رسمی</p>
              <p className="text-[11px] font-bold text-[#7C748E]">توکن مخفی می‌ماند و لازم نیست هر بار وارد شود</p>
            </div>
          </div>

          <label className="mb-1 block text-right text-[11px] font-black text-[#6D6780]">Instagram ID</label>
          <Input dir="ltr" value={instagramId} onChange={(e) => setInstagramId(e.target.value)} className="h-11 rounded-2xl border-[#ECE8F6] bg-[#FAF9FF] text-left text-[13px] font-bold" />

          <div className="mt-3 flex items-center justify-between">
            {hasSavedToken && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">{serverTokenActive ? "مخفی روی سرور" : "ذخیره شده"}: {settings?.account?.tokenPreview}</span>}
            <label className="block text-right text-[11px] font-black text-[#6D6780]">Access Token</label>
          </div>

          {hasSavedToken && !shouldShowTokenEditor ? (
            <div className="mt-1 rounded-[22px] bg-emerald-50 p-3 text-right ring-1 ring-emerald-100">
              <p className="text-[12px] font-black text-emerald-800">توکن فعال است و در فرم نمایش داده نمی‌شود.</p>
              <p className="mt-1 text-[11px] font-bold leading-5 text-emerald-700">{serverTokenActive ? "توکن از Environment Variables سرور خوانده می‌شود؛ لازم نیست هر بار وارد کنی." : "توکن قبلاً ذخیره شده؛ فقط اگر منقضی شد یا عوضش کردی، توکن جدید را وارد کن."}</p>
              <button type="button" onClick={() => setShowTokenEditor(true)} className="mt-2 rounded-2xl bg-white px-3 py-2 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">تعویض توکن</button>
            </div>
          ) : (
            <>
              <textarea
                dir="ltr"
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value);
                  setTokenTouched(true);
                }}
                placeholder={hasSavedToken ? "برای تعویض توکن، توکن جدید را اینجا بگذار" : "توکن اینستاگرام را اینجا وارد کن"}
                className="mt-1 h-24 w-full resize-none rounded-2xl border border-[#ECE8F6] bg-[#FAF9FF] px-3 py-2 text-left text-[12px] font-bold outline-none focus:ring-2 focus:ring-[#D8CCFF]"
              />
              {tokenTouched && accessToken && <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-bold text-[#7C748E]"><EyeOff className="h-3.5 w-3.5" /> قبل از ارسال عکس، توکن را مخفی کن.</p>}
            </>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button disabled={loading || !canTest} className="h-11 rounded-2xl bg-[#5B2BE2] text-[12px] font-black text-white shadow-lg shadow-violet-200 hover:bg-[#4A20C9]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره و تست"}
            </Button>
            <button type="button" disabled={testing || !canTest} onClick={() => runDiagnostics(false)} className="h-11 rounded-2xl bg-[#F2EEFF] text-[12px] font-black text-[#5B2BE2] ring-1 ring-[#E6DCF8] disabled:opacity-50">
              {testing ? "در حال تست..." : "تست عمیق"}
            </button>
          </div>
        </form>

        {message && (
          <div className="rounded-[24px] bg-amber-50 p-3 text-right text-[12px] font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
            <AlertTriangle className="ml-1 inline h-4 w-4" /> {message}
          </div>
        )}

        {diagnostics && (
          <section className="rounded-[30px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${statusClass(diagnostics.ok)}`}>{okText(diagnostics.ok)}</span>
              <div className="text-right">
                <p className="text-[15px] font-black">نتیجه تست اتصال</p>
                <p className="text-[11px] font-bold text-[#7C748E]">مشکل data خالی هم بررسی می‌شود</p>
              </div>
            </div>

            {diagnostics.profile && (
              <div className="mb-3 rounded-[22px] bg-[#FAF9FF] p-3 text-right ring-1 ring-[#ECE8F6]">
                <p className="text-[13px] font-black">@{diagnostics.profile.username || "instagram"}</p>
                <p className="mt-1 text-[11px] font-bold text-[#7C748E]" dir="ltr">ID: {diagnostics.profile.id || instagramId}</p>
              </div>
            )}

            {diagnostics.emptyReason && (
              <div className="mb-3 rounded-[22px] bg-blue-50 p-3 text-right text-[12px] font-bold leading-6 text-blue-800 ring-1 ring-blue-100">
                {diagnostics.emptyReason}
              </div>
            )}

            <div className="space-y-2">
              {(diagnostics.tests || []).map((test) => (
                <div key={`${test.key}-${test.endpoint}`} className="rounded-[22px] bg-[#FAF9FF] p-3 ring-1 ring-[#ECE8F6]">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${statusClass(test.ok)}`}>{okText(test.ok)}</span>
                    <p className="text-right text-[12px] font-black">{test.title}</p>
                  </div>
                  <p className="mt-1 text-right text-[11px] font-bold leading-5 text-[#6D6780]">{test.message || "—"}</p>
                  {typeof test.count === "number" && <p className="mt-1 text-right text-[10px] font-black text-[#8A8498]">تعداد: {formatNumber(test.count)} {test.hasNext ? " / صفحه بعدی دارد" : ""}</p>}
                </div>
              ))}
            </div>

            <Button onClick={syncDirects} disabled={syncing || !settings?.configured} className="mt-3 h-11 w-full rounded-2xl bg-[#17112A] text-[12px] font-black text-white hover:bg-[#2A2140]">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} همگام‌سازی دایرکت‌ها با لیدها
            </Button>
          </section>
        )}

        {syncResult && (
          <section className="rounded-[26px] bg-white p-3 text-right shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
            <p className="text-[15px] font-black">نتیجه همگام‌سازی</p>
            <p className="mt-2 text-[12px] font-bold leading-6 text-[#6D6780]">{String(syncResult.message || "انجام شد")}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-[#FAF9FF] p-2 ring-1 ring-[#ECE8F6]"><p className="text-[18px] font-black">{formatNumber(Number(syncResult.checkedConversations || 0))}</p><p className="text-[10px] font-bold text-[#7C748E]">گفتگو</p></div>
              <div className="rounded-2xl bg-[#FAF9FF] p-2 ring-1 ring-[#ECE8F6]"><p className="text-[18px] font-black">{formatNumber(Number(syncResult.checkedMessages || 0))}</p><p className="text-[10px] font-bold text-[#7C748E]">پیام</p></div>
              <div className="rounded-2xl bg-[#FAF9FF] p-2 ring-1 ring-[#ECE8F6]"><p className="text-[18px] font-black">{formatNumber(Number(syncResult.imported || 0))}</p><p className="text-[10px] font-bold text-[#7C748E]">لید جدید</p></div>
            </div>
          </section>
        )}

        <section className="rounded-[26px] bg-white p-3 text-right text-[12px] font-bold leading-6 text-[#6D6780] shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <p className="font-black text-[#24123F]">توضیح مشکل دوم</p>
          <p className="mt-1">اگر تست‌ها موفق باشند ولی data خالی بماند، برنامه خطا نمی‌دهد؛ یعنی اتصال برقرار است اما Meta به‌خاطر حالت تست/Development یا نبود گفتگوی مجاز، هنوز پیام واقعی برنمی‌گرداند. این صفحه چند endpoint و paging.next را همزمان تست می‌کند تا عیب‌یابی دقیق‌تر شود.</p>
        </section>

        <nav className="fixed bottom-3 left-1/2 z-20 h-[66px] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 rounded-[26px] bg-white/96 p-2 shadow-[0_-10px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
          <div className="grid h-full grid-cols-4 gap-1">
            <Link href="/dashboard" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]"><Home className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">داشبورد</span></Link>
            <Link href="/dashboard/leads" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]"><UsersRound className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">لیدها</span></Link>
            <Link href="/dashboard/inbox" className="flex flex-col items-center justify-center rounded-2xl text-[#6D6780]"><MessageCircle className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">اینباکس</span></Link>
            <Link href="/connect" className="flex flex-col items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2]"><Link2 className="h-5 w-5" /><span className="mt-1 text-[10px] font-black">اتصال</span></Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
