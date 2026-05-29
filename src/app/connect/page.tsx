"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  { num: "۱", text: "پیج اینستاگرام باید Business یا Creator باشد" },
  { num: "۲", text: "پیج باید به یک صفحه فیسبوک متصل باشد" },
  { num: "۳", text: "روی دکمه زیر کلیک کن و وارد فیسبوک شو" },
  { num: "۴", text: "مجوزهای خواسته‌شده را تأیید کن" },
];

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);

  function handleConnect() {
    setLoading(true);
    window.location.href = "/api/auth/instagram/start";
  }

  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8">
      <div className="max-w-sm mx-auto animate-fade-in">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold">اتصال به اینستاگرام</h1>
          <p className="text-sm text-muted-foreground mt-1">بدون گرفتن پسورد — فقط OAuth رسمی متا</p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <Badge variant="success">✓ پارتنر رسمی Meta</Badge>
          <Badge variant="success">✓ بدون پسورد</Badge>
        </div>

        {/* Steps */}
        <Card className="mb-4">
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-semibold mb-3">پیش از اتصال:</p>
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {s.num}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="mb-5">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold mb-3">مجوزهای درخواستی:</p>
            <div className="space-y-1.5">
              {[
                "خواندن اطلاعات پایه پیج",
                "انتشار پست، ریلز، استوری",
                "خواندن و پاسخ کامنت‌ها",
                "خواندن و ارسال DM",
                "آمار و آنالیتیکس پست‌ها",
              ].map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-emerald-500 font-bold">✓</span>
                  {p}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleConnect}
          disabled={loading}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {loading ? "در حال انتقال..." : "اتصال از طریق فیسبوک / اینستاگرام"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          هر زمان خواستی می‌توانی اتصال را قطع کنی
        </p>
      </div>
    </main>
  );
}
