import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        pill: "border border-[color:var(--ai-border,rgba(255,255,255,0.12))] bg-[color:var(--ai-panel,rgba(255,255,255,0.04))] text-[color:var(--ai-ink,#F3EDE4)] hover:bg-white/10",
        accent: "bg-[#E8651C] text-white border border-[#E8651C] hover:brightness-110",
      },
      size: {
        default: "h-11 min-h-[44px] min-w-[44px] px-4 py-2 rounded-md text-sm",
        sm: "h-11 min-h-[44px] rounded-md px-3 text-sm",
        lg: "h-12 md:h-11 min-h-[44px] rounded-md px-8 text-sm",
        icon: "h-11 w-11 md:h-10 md:w-10 min-h-[40px] rounded-full",
        pill: "h-9 min-h-9 min-w-[6.75rem] px-5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
