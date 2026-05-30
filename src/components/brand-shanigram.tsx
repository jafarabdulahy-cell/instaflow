import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  showText?: boolean;
  compact?: boolean;
};

export function ShanigramMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Shanigram"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="shanigram-mark-gradient" x1="20" y1="15" x2="103" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E58FF" />
          <stop offset="0.45" stopColor="#5B2BE2" />
          <stop offset="1" stopColor="#2A105A" />
        </linearGradient>
        <linearGradient id="shanigram-silver" x1="13" y1="15" x2="95" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C8C9D8" />
          <stop offset="0.55" stopColor="#F3F4FF" />
          <stop offset="1" stopColor="#8B8DA7" />
        </linearGradient>
      </defs>
      <path
        d="M21 82C11 64 17 38 37 25c19-13 48-12 66 8"
        fill="none"
        stroke="url(#shanigram-silver)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M101 40c10 22 2 48-19 61-18 11-42 9-58-5"
        fill="none"
        stroke="url(#shanigram-silver)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M42 31h36l-5 21H47l-5-21Z"
        fill="url(#shanigram-mark-gradient)"
      />
      <path
        d="M44 31 51 18l9 15 9-15 8 13"
        fill="none"
        stroke="url(#shanigram-mark-gradient)"
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M60 14 66 24 60 31 54 24l6-10Z"
        fill="#8E58FF"
      />
      <path
        d="M79 65c0 15-13 25-31 25-11 0-21-4-28-10l10-13c6 5 12 8 20 8 6 0 9-2 9-5 0-4-4-5-14-8-12-4-21-8-21-21 0-14 12-23 30-23 10 0 18 3 25 8L70 40c-6-4-11-6-17-6-6 0-9 2-9 5s4 5 14 8c13 4 21 8 21 18Z"
        fill="url(#shanigram-mark-gradient)"
      />
      <path
        d="M20 88c8 1 17 1 25-1 10-2 18-6 25-12"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M26 101 28 82c7 7 16 10 27 10 1 0 2 0 3-.1L26 101Z"
        fill="#5B2BE2"
      />
      <circle cx="45" cy="67" r="3.8" fill="#D7C8FF" />
      <circle cx="58" cy="67" r="3.8" fill="#D7C8FF" />
      <circle cx="71" cy="67" r="3.8" fill="#D7C8FF" />
    </svg>
  );
}

export function ShanigramLogo({ className, markClassName, showText = true, compact = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ShanigramMark className={cn(compact ? "h-10 w-10" : "h-14 w-14", markClassName)} />
      {showText && (
        <div className="min-w-0">
          <div className={cn("font-black tracking-tight text-[#2A105A]", compact ? "text-xl" : "text-3xl")}>Shanigram</div>
          <div className={cn("font-bold uppercase tracking-[0.22em] text-[#8B8DA7]", compact ? "text-[8px]" : "text-[10px]")}>Automate • Connect • Grow</div>
        </div>
      )}
    </div>
  );
}
