interface Props {
  params: { id: string };
}

export default function BacktestDetailPage({ params }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Backtest #{params.id}</h1>
      <p className="mt-2 text-sm text-gray-400">Equity curve, drawdown, trades, and KPIs appear here.</p>
    </div>
  );
}
