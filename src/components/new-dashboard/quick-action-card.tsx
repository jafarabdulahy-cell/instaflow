"use client";

import Link from "next/link";
import { Lightbulb, ArrowLeft } from "lucide-react";

export function QuickActionCard() {
  // Mock-safe data (بدون API call)
  const action = {
    message: "همه چیز به‌روز است! 🎉",
    href: "/dashboard",
  };

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between rounded-[22px] bg-gradient-to-l from-amber-50 to-yellow-50 p-4 shadow-sm ring-1 ring-amber-100"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-amber-100">
          <Lightbulb className="h-6 w-6 text-amber-600" />
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-amber-900">کار بعدی شما</p>
          <p className="mt-0.5 text-[11px] font-bold text-amber-700">{action.message}</p>
        </div>
      </div>
      <Link
        href={action.href}
        className="flex h-9 items-center gap-1 rounded-xl bg-white px-3 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-50"
      >
        برو
        <ArrowLeft className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
