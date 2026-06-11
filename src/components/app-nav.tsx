"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Link2, MessageCircle, Sparkles, UsersRound } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "خانه", icon: Home, exact: true },
  { href: "/dashboard/direct", label: "دایرکت", icon: MessageCircle, exact: false },
  { href: "/dashboard/content", label: "محتوا", icon: Sparkles, exact: false },
  { href: "/dashboard/leads", label: "لیدها", icon: UsersRound, exact: false },
  { href: "/dashboard/settings", label: "تنظیمات", icon: Link2, exact: false },
] as const;

export function AppNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
  }

  return (
    <nav className="fixed bottom-3 left-1/2 z-30 h-[66px] w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 rounded-[26px] bg-white/96 p-2 shadow-[0_-10px_30px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] backdrop-blur-xl">
      <div className="grid h-full grid-cols-5 gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center rounded-2xl transition-colors ${
                active ? "bg-[#F2EEFF] text-[#5B2BE2]" : "text-[#6D6780]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1 text-[9px] font-black">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
