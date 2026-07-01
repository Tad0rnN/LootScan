"use client";

import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium text-white transition-all duration-200 backdrop-blur-xl disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.06] border border-white/[0.12] shadow-lg shadow-black/20 hover:bg-white/[0.1] hover:border-white/20",
        brand:
          "border border-brand-400/25 shadow-lg shadow-brand-500/10 hover:border-brand-400/40 hover:shadow-brand-500/20",
      },
      size: {
        default: "h-9 px-4 text-sm rounded-xl",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-11 px-6 text-base rounded-2xl",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type GlassButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof glassButtonVariants> & {
    asChild?: boolean;
  };

function GlassButton({
  className,
  variant,
  size,
  asChild = false,
  style,
  ...props
}: GlassButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const brandStyle =
    variant === "brand"
      ? {
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.05))",
          ...style,
        }
      : style;

  return (
    <Comp
      data-slot="glass-button"
      className={cn(glassButtonVariants({ variant, size, className }))}
      style={brandStyle}
      {...props}
    />
  );
}

export { GlassButton, glassButtonVariants };
