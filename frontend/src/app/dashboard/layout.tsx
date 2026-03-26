import type { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="border-r border-border bg-surface p-4">
        <p className="mb-4 text-xl font-bold">QuantLab</p>
        <nav className="space-y-2 text-sm">
          <Link className="block" href="/dashboard">Dashboard</Link>
          <Link className="block" href="/dashboard/datasets">Datasets</Link>
          <Link className="block" href="/dashboard/backtests">Backtests</Link>
          <Link className="block" href="/dashboard/strategies">Strategies</Link>
          <Link className="block" href="/dashboard/ml">ML</Link>
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
