import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-[#5e6ad2] hover:bg-[#6e7be2] text-[#eef0f6] shadow-[0_2px_12px_rgba(94,106,210,0.3)] hover:shadow-[0_4px_20px_rgba(94,106,210,0.45)] active:scale-[0.98]",
      outline:
        "border border-[#272b3a] bg-transparent hover:bg-[#1f2330] hover:border-[#3a4060] text-[#eef0f6] active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-[#1f2330] text-[#8b90a8] hover:text-[#eef0f6] active:scale-[0.98]",
      destructive:
        "bg-red-600/90 text-[#eef0f6] hover:bg-red-600 shadow-[0_2px_12px_rgba(239,68,68,0.25)] active:scale-[0.98]",
    };
    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm",
      sm:      "h-9 px-3 text-sm",
      xs:      "h-8 px-3 text-xs rounded-md",
      lg:      "h-11 px-8 text-sm",
      icon:    "h-10 w-10 p-0",
    };

    const classes = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d0f14]",
      "disabled:pointer-events-none disabled:opacity-40",
      "w-full",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
