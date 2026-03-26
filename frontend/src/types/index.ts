export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Dataset {
  id: number;
  name: string;
  symbol: string;
  timeframe: string;
  row_count: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface BacktestResult {
  id: number;
  dataset_id: number;
  strategy_name: string;
  metrics: Record<string, number>;
  created_at: string;
}
