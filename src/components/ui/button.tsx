import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * LIT button system. Variants: primary (default), secondary (outline), tertiary,
 * ghost, text (link), icon, destructive. States: hover, focus-visible, active,
 * disabled, loading (via `loading` prop). Dimensions never change between states.
 */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45D9D2] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 shrink-0 data-[loading=true]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[#45D9D2] text-[#0D1B3E] font-bold hover:bg-[#6DE6E0] hover:shadow-[0_6px_20px_-8px_rgba(69,217,210,0.6)]",
        primary: "bg-[#45D9D2] text-[#0D1B3E] font-bold hover:bg-[#6DE6E0] hover:shadow-[0_6px_20px_-8px_rgba(69,217,210,0.6)]",
        destructive: "bg-[#B42339] text-white hover:bg-[#CC2D45]",
        outline: "border border-white/20 bg-white/[0.04] text-white hover:bg-white/10",
        secondary: "border border-white/20 bg-white/[0.04] text-white hover:bg-white/10",
        tertiary: "border border-[#45D9D2]/35 text-[#45D9D2] hover:bg-[#45D9D2]/10",
        ghost: "text-zinc-200 hover:bg-white/[0.08] hover:text-white",
        link: "text-[#45D9D2] underline-offset-4 hover:underline",
        text: "text-[#45D9D2] underline-offset-4 hover:underline",
        pill: "border border-white/15 bg-white/[0.04] text-zinc-100 hover:bg-white/10",
        accent: "bg-[#0894DE] text-white hover:bg-[#2AA6EA]",
      },
      size: {
        default: "h-11 min-h-[44px] min-w-[44px] px-5 rounded-[10px] text-sm",
        sm: "h-10 min-h-[40px] rounded-[10px] px-4 text-[13px]",
        lg: "h-[52px] rounded-[10px] px-7 text-[15px]",
        icon: "h-11 w-11 min-h-[44px] rounded-full",
        pill: "h-9 min-h-9 min-w-[4.5rem] sm:min-w-[6.75rem] px-3 sm:px-5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        disabled={asChild ? undefined : disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
            {loading && (
              <span
                aria-hidden
                className="absolute h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            )}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
