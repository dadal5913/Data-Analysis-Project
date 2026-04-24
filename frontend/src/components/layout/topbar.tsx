"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { ChevronRight, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";

function humanize(slug: string) {
  if (/^\d+$/.test(slug)) return `#${slug}`;
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function sectionLabel(segment: string) {
  switch (segment) {
    case "dashboard":
      return "Overview";
    case "backtests":
      return "Backtests";
    case "datasets":
      return "Datasets";
    case "strategies":
      return "Strategies";
    case "ml":
      return "ML Studio";
    default:
      return humanize(segment);
  }
}

export function Topbar() {
  const pathname = usePathname() || "/dashboard";
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Array<{ label: string; href: string }> = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ label: sectionLabel(seg), href: acc });
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((c, idx) => {
          const last = idx === crumbs.length - 1;
          return (
            <div className="flex items-center gap-1.5" key={c.href}>
              {idx > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" />
              ) : null}
              {last ? (
                <span className="font-medium text-foreground">{c.label}</span>
              ) : (
                <Link
                  className="transition-colors hover:text-foreground"
                  href={c.href}
                >
                  {c.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Badge variant="success" icon={<Radio className="h-2.5 w-2.5" />}>
          Live market feed
        </Badge>
        <div className="hidden text-xs text-foreground-subtle md:block">
          v0.1.0
        </div>
      </div>
    </header>
  );
}
