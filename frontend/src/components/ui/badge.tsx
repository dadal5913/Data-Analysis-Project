import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-surface-elevated text-muted-foreground border-border",
        // Legacy alias — neutral chip.
        neutral:
          "bg-surface-elevated text-muted-foreground border-border",
        accent:
          "bg-primary/10 text-primary border-primary/30",
        success:
          "bg-success/10 text-success border-success/30",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30",
        danger:
          "bg-destructive/10 text-destructive border-destructive/30",
        warning:
          "bg-warning/10 text-warning border-warning/30",
        outline:
          "text-foreground border-border"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Convenience prop retained for legacy call-sites. */
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant,
  asChild = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
