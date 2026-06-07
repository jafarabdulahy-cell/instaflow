import * as React from "react";

export function ShanigramMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Shanigram">
      <rect width="96" height="96" rx="28" fill="url(#g)" />
      <path d="M62 27c-5-5-15-7-24-3-10 5-14 14-10 22 3 7 11 10 20 12 7 2 11 4 10 8-1 4-7 6-14 4-6-1-11-4-15-8l-8 10c6 7 15 11 25 11 14 0 25-7 27-18 2-11-6-17-20-21-8-2-12-4-11-8 1-4 6-6 12-4 5 1 9 3 12 6l8-11Z" fill="white"/>
      <path d="M27 23h42" stroke="white" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round"/>
      <defs><linearGradient id="g" x1="12" y1="9" x2="84" y2="88"><stop stopColor="#FF2D55"/><stop offset=".47" stopColor="#8E58FF"/><stop offset="1" stopColor="#5B2BE2"/></linearGradient></defs>
    </svg>
  );
}
