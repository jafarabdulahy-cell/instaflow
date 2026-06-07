import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-2xl bg-[#5B2BE2] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(91,43,226,0.20)] transition active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";
export { Button };
