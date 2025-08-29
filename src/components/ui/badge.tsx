import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-elegant hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-elegant hover:bg-destructive/80",
        success:
          "border-transparent bg-success text-success-foreground shadow-elegant hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-elegant hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground shadow-elegant hover:bg-info/80",
        outline: "text-foreground border-border",
        // Status variants
        "status-new": "border-transparent bg-status-new-bg text-status-new",
        "status-contacted": "border-transparent bg-status-contacted-bg text-status-contacted",
        "status-qualified": "border-transparent bg-status-qualified-bg text-status-qualified",
        "status-converted": "border-transparent bg-status-converted-bg text-status-converted",
        "status-lost": "border-transparent bg-status-lost-bg text-status-lost",
        // Category variants
        "category-introduction": "border-transparent bg-category-introduction-bg text-category-introduction",
        "category-followup": "border-transparent bg-category-followup-bg text-category-followup",
        "category-closing": "border-transparent bg-category-closing-bg text-category-closing",
        "category-custom": "border-transparent bg-category-custom-bg text-category-custom",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
