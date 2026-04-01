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

export interface BacktestResultDetail extends BacktestResult {
  params: Record<string, unknown>;
  equity_curve: Array<{ date: string; equity: number }>;
  trades: Array<{ date: string; price: number; signal: number; pnl: number }>;
}

export interface BacktestRequest {
  dataset_id: number;
  strategy_name: string;
  initial_capital: number;
  transaction_cost_bps: number;
  slippage_bps: number;
  position_size: number;
  params: Record<string, unknown>;
}

export interface StrategyConfig {
  name: string;
  params: Record<string, number>;
}

export interface MLTrainRequest {
  dataset_id: number;
  model_type: string;
  test_size: number;
}

export interface MLTrainResponse {
  metrics: Record<string, number>;
  confusion_matrix: number[][];
  feature_importance: Record<string, number> | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AppErrorField {
  field: string;
  message: string;
}

export interface AppError extends Error {
  status: number;
  messages: string[];
  fields: AppErrorField[];
  raw?: unknown;
}
