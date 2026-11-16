import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-blue text-white shadow-active hover:bg-blue-700 active:scale-[0.98]",
        dark: "bg-[#0A1120] text-white hover:bg-[#162238] shadow-card active:scale-[0.98]",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
        outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
        orange: "bg-orange text-white hover:bg-orange-600"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5 text-base",
        icon: "h-10 w-10 p-0 rounded-full",
        pill: "h-10 px-5 rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(variants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
