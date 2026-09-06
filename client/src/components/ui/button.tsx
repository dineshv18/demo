import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-semibold tracking-[-0.005em]",
    "transition-[background-color,color,box-shadow,transform,border-color] duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Gold — the primary action across the platform
        default:
          "bg-primary text-primary-foreground shadow-xs hover:brightness-105 hover:shadow-sm active:brightness-95",
        // Deep navy — the confident secondary action
        navy:
          "bg-navy-800 text-white shadow-xs hover:bg-navy-700 dark:bg-white dark:text-navy-800 dark:hover:bg-white/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:brightness-110",
        outline:
          "border border-border bg-card text-foreground shadow-xs hover:border-brand/45 hover:bg-accent/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        // Tinted gold — lighter emphasis than a solid fill
        soft:
          "bg-accent text-accent-foreground hover:bg-accent/70 border border-brand/20",
        success:
          "bg-success text-white shadow-xs hover:brightness-110",
        ghost: "hover:bg-accent/60 hover:text-accent-foreground",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 rounded-lg px-3 text-[0.8125rem]",
        lg: "h-12 rounded-xl px-6 text-[0.9375rem]",
        xl: "h-14 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
