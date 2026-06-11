"use client";

import Link from "next/link";
import { MessageCircle, UsersRound, Sparkles, Settings, ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActionCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  bgColor: string;
  iconColor: string;
}

export function MainActionCards() {
  // ترتیب کارت‌ها برای RTL: راست به چپ، بالا به پایین
  const cards: ActionCard[] = [
    {
      title: "دایرکت هوشمند",
      description: "پاسخ خودکار، قوانین و مدیریت پیام‌ها",
      icon: MessageCircle,
      href: "/dashboard/direct",
      badge: 0, // mock-safe
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "لیدها",
      description: "مخاطبین، مشتریان و فرصت‌های فروش",
      icon: UsersRound,
      href: "/dashboard/leads",
      badge: 0, // mock-safe
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "تولید محتوا",
      description: "ایده، کپشن و برنامه‌ریزی محتوا",
      icon: Sparkles,
      href: "/dashboard/content",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "تنظیمات",
      description: "اتصال پیج، حساب کاربری و مدیریت",
      icon: Settings,
      href: "/dashboard/settings",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-2.5">
      {cards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="relative flex flex-col justify-between rounded-[20px] bg-white p-3.5 text-right shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
        >
          {/* آیکون */}
          <div className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] ${card.bgColor} ${card.iconColor}`}>
            <card.icon className="h-5.5 w-5.5" />
          </div>

          {/* Badge */}
          {card.badge !== undefined && card.badge > 0 && (
            <span className="absolute left-2.5 top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[9px] font-black text-white">
              {card.badge}
            </span>
          )}

          {/* محتوا */}
          <div className="mt-2.5">
            <h3 className="text-[15px] font-black text-[#17112A]">{card.title}</h3>
            <p className="mt-1 text-[11px] font-bold leading-relaxed text-gray-500">{card.description}</p>
          </div>

          {/* فلش */}
          <div className="mt-2.5 flex justify-end">
            <ArrowLeft className="h-3.5 w-3.5 text-gray-400" />
          </div>
        </Link>
      ))}
    </div>
  );
}
