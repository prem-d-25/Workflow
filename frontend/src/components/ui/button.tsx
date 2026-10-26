import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
        default: "bg-accent text-accent-foreground hover:bg-accent-hover",
        secondary: "bg-surface text-foreground border border-border hover:bg-muted",
        outline: "bg-surface text-foreground border border-border hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-surface text-danger border border-border hover:bg-danger-soft",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
