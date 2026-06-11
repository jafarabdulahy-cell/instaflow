"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

export function ConnectionStatusBar() {
  // Mock-safe data (بدون API call)
  const isConnected = false;
  const pageName = "shanshin.rest";
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between rounded-[18px] bg-white px-3 py-2.5 shadow-sm ring-1 ring-gray-100"
    >
      <div className="flex items-center gap-2.5">
        {isConnected ? (
          <>
            <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
            <div className="text-right">
              <p className="text-[13px] font-black text-[#17112A]">پیج شما متصل است</p>
              <p className="text-[11px] font-bold text-gray-500">{pageName}</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
            <div className="text-right">
              <p className="text-[13px] font-black text-[#17112A]">پیج متصل نیست</p>
              <p className="text-[11px] font-bold text-gray-500">برای شروع، پیج خود را متصل کنید</p>
            </div>
          </>
        )}
      </div>

      {/* Badge حالت تست - فقط اگر Mock Mode فعال */}
      {isMockMode && (
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-black text-amber-700">
          حالت تست
        </span>
      )}
    </div>
  );
}
