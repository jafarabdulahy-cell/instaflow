import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-[#E6DCF8] bg-white px-4 py-2 text-sm font-bold text-[#17112A] shadow-sm outline-none transition placeholder:text-[#9A93AA] focus:border-[#8E58FF] focus:ring-4 focus:ring-[#8E58FF]/12 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
export { Input };
