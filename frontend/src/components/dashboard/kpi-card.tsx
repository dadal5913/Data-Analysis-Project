import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  icon?: ReactNode;
  delta?: {
    value: string;
    direction: "up" | "down" | "flat";
    label?: string;
  };
  tone?: "neutral" | "accent" | "success" | "danger";
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "bg-surface-elevated text-muted-foreground border-border",
  accent: "bg-primary/10 text-primary border-primary/30",
  success: "bg-success/10 text-success border-success/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30"
};

export function KpiCard({
  label,
  value,
  icon,
  delta,
  tone = "neutral"
}: Props) {
  return (
    <Card hoverable className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <div
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border",
              toneClasses[tone]
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <p className="mt-3 font-display text-[1.75rem] font-semibold leading-tight tabular-nums text-foreground">
        {value}
      </p>

      {delta ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-2xs font-medium",
              delta.direction === "up" && "bg-success/10 text-success",
              delta.direction === "down" && "bg-destructive/10 text-destructive",
              delta.direction === "flat" &&
                "bg-surface-elevated text-muted-foreground"
            )}
          >
            {delta.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : delta.direction === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            <span className="tabular-nums">{delta.value}</span>
          </span>
          {delta.label ? (
            <span className="text-2xs text-foreground-subtle">{delta.label}</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
