import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/**
 * Compact form field wrapper: label → input slot → hint/error.
 *
 * Uses the shadcn Radix `Label` primitive for accessibility. When `htmlFor`
 * is provided the label is explicitly associated; otherwise the wrapper is a
 * `<label>` that implicitly targets its first focusable child.
 */
export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor
}: FieldProps) {
  const Wrapper = htmlFor ? "div" : "label";
  return (
    <Wrapper className={cn("flex flex-col gap-1.5", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-xs text-foreground-subtle">{hint}</span>
      ) : null}
    </Wrapper>
  );
}
