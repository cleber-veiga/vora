import * as React from "react"
import { cn } from "../../lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg",
          "bg-[#1f2330] border border-[#272b3a]",
          "px-3 py-2 text-sm text-[#eef0f6]",
          "placeholder:text-[#555b72]",
          "transition-all duration-150",
          "focus:outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e6ad2]/20",
          "hover:border-[#3a4060]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
