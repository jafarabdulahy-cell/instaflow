"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function BackButton({ fallback = "/dashboard" }: { fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#17112A] shadow-[0_8px_24px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] active:scale-95"
      aria-label="بازگشت"
    >
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}
