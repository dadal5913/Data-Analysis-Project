import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional adornment rendered inside the input, left of the text. */
  leftIcon?: React.ReactNode;
  /** When `true`, render with the destructive border/focus ring. */
  invalid?: boolean;
}

const baseClasses =
  "flex h-9 w-full rounded-md border border-input bg-surface/60 text-sm text-foreground shadow-xs transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-foreground-subtle hover:border-border-strong focus:border-primary focus:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", leftIcon, invalid, ...props }, ref) => {
    if (leftIcon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </span>
          <input
            type={type}
            className={cn(
              baseClasses,
              "pl-9 pr-3",
              invalid && "border-destructive focus:border-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          "px-3",
          invalid && "border-destructive focus:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
