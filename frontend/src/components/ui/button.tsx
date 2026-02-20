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
      default: "bg-[#5e6ad2] hover:bg-[#6e7be2] text-[#f7f8f8]",
      outline: "border border-[#222326] bg-transparent hover:bg-[#15181c] text-[#f7f8f8]",
      ghost: "bg-transparent hover:bg-[#15181c] text-[#f7f8f8]",
      destructive: "bg-red-600 text-[#f7f8f8] hover:bg-red-700"
    };
    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      xs: "h-8 px-3 text-xs rounded-md",
      lg: "h-11 px-8",
      icon: "h-10 w-10 p-0",
    };
    const classes = cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] disabled:pointer-events-none disabled:opacity-50 w-full",
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
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
