"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  ExternalLink,
  LayoutDashboard,
  LineChart,
  LogOut,
  Sparkles,
  User,
  Workflow
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { authStore } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  description?: string;
};

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/datasets", label: "Datasets", icon: Database },
  { href: "/dashboard/backtests", label: "Backtests", icon: LineChart },
  { href: "/dashboard/strategies", label: "Strategies", icon: Workflow },
  { href: "/dashboard/ml", label: "ML Studio", icon: Sparkles }
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    authStore.clear();
    router.replace("/login");
  };

  return (
    <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-border bg-card/60">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-2xs font-medium uppercase tracking-[0.14em] text-foreground-subtle">
          Workspace
        </p>
        <nav className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active
                      ? "text-primary"
                      : "text-foreground-subtle group-hover:text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
                {active ? (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <p className="mb-2 mt-6 px-2 text-2xs font-medium uppercase tracking-[0.14em] text-foreground-subtle">
          Resources
        </p>
        <nav className="space-y-0.5">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4 text-foreground-subtle group-hover:text-muted-foreground" />
            <span>API Docs</span>
          </a>
        </nav>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md bg-surface/60 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">Demo Account</p>
            <p className="truncate text-2xs text-foreground-subtle">
              demo@quantlab.dev
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
