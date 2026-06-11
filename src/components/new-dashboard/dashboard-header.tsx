"use client";

import { Bell } from "lucide-react";

export function DashboardHeader({ userName = "کاربر" }: { userName?: string }) {
  // Badge از عدد mock-safe (بدون API call)
  const notificationCount = 0;

  return (
    <header
      dir="rtl"
      className="flex h-[54px] items-center justify-between rounded-[20px] bg-white px-3.5 shadow-sm ring-1 ring-gray-100"
    >
      {/* لوگو و عنوان */}
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#5B2BE2] to-[#B000B8] text-[16px] font-black text-white">
          IF
        </div>
        <div className="text-right">
          <h1 className="text-[15px] font-black text-[#17112A]">InstaFlow</h1>
          <p className="text-[9px] font-bold text-gray-500">دستیار هوشمند اینستاگرام</p>
        </div>
      </div>

      {/* نوتیفیکیشن و آواتار */}
      <div className="flex items-center gap-2">
        <button
          className="relative grid h-9 w-9 place-items-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100"
          aria-label="اعلان‌ها"
        >
          <Bell className="h-4.5 w-4.5" />
          {notificationCount > 0 && (
            <span className="absolute -left-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">
              {notificationCount}
            </span>
          )}
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-[13px] font-black text-white">
          {userName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
