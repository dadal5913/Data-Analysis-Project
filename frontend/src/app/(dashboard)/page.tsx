import { KpiCard } from "@/components/dashboard/kpi-card";
import { Watchlist } from "@/components/dashboard/watchlist";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Return" value="12.4%" />
        <KpiCard label="Sharpe Ratio" value="1.41" />
        <KpiCard label="Max Drawdown" value="-8.3%" />
      </div>
      <div>
        <h2 className="mb-2 text-lg font-medium">Live Watchlist</h2>
        <Watchlist />
      </div>
    </div>
  );
}
