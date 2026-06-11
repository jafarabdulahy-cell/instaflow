"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/new-dashboard/dashboard-header";
import { ConnectionStatusBar } from "@/components/new-dashboard/connection-status-bar";
import { HeroBanner } from "@/components/new-dashboard/hero-banner";
import { MainActionCards } from "@/components/new-dashboard/main-action-cards";
import { QuickActionCard } from "@/components/new-dashboard/quick-action-card";
import { AppNav } from "@/components/app-nav";

export default function DashboardPage() {
  const [userName, setUserName] = useState("کاربر");

  useEffect(() => {
    // فقط /api/me (بدون Meta API)
    fetch("/api/me")
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = "/auth/login";
          return;
        }
        const json = await res.json();
        if (json.user?.name) setUserName(json.user.name);
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return (
    <div dir="rtl" className="h-[100dvh] overflow-hidden bg-[#F8F5FF]">
      <main className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col px-4 pb-20 pt-2.5">
        {/* Header - فشرده */}
        <div className="shrink-0">
          <DashboardHeader userName={userName} />
        </div>

        {/* Connection Status - فشرده */}
        <div className="mt-1.5 shrink-0">
          <ConnectionStatusBar />
        </div>

        {/* Hero Banner - فشرده */}
        <div className="mt-1.5 shrink-0">
          <HeroBanner />
        </div>

        {/* Main Action Cards - فشرده */}
        <div className="mt-1.5 shrink-0">
          <MainActionCards />
        </div>

        {/* فضای خالی برای بالانس */}
        <div className="flex-1" />
      </main>

      {/* Bottom Navigation */}
      <AppNav />
    </div>
  );
}
