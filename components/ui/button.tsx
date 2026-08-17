import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/index"

const buttonVariants = cva(
  "relative isolate z-0 inline-flex items-center justify-center gap-2 overflow-visible whitespace-nowrap rounded-full text-sm font-medium no-underline shadow-sm transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ease-out after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-full after:opacity-25 after:transition-[transform,opacity] after:duration-300 after:ease-out after:content-[''] hover:-translate-y-0.5 hover:shadow-lg hover:after:scale-x-[1.12] hover:after:scale-y-[1.22] hover:after:opacity-0 active:translate-y-[-1px] active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:after:hidden motion-reduce:transform-none motion-reduce:transition-none motion-reduce:after:hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground after:bg-primary hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground after:bg-destructive hover:bg-destructive/90",
        outline:
          "border border-input bg-background after:bg-primary hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground after:bg-secondary hover:bg-secondary/80",
        ghost: "after:bg-accent hover:bg-accent hover:text-accent-foreground",
        link: "rounded-none text-primary shadow-none underline-offset-4 after:hidden hover:translate-y-0 hover:shadow-none hover:underline active:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9 p-0 after:hidden hover:-translate-y-px active:translate-y-0",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
