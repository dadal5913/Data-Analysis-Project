import { Card } from "@/components/ui/card";

export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
