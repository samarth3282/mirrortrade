import type { AssessTradeRiskOutput } from "@/ai/flows/risk-assessment";

export interface ApiKeyConfig {
  userApiKey: string;
  friendApiKey: string;
}

export interface Trade {
  id: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: number; // Unix timestamp
  status?: 'PENDING_RISK_ASSESSMENT' | 'PENDING_REPLICATION' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  riskAssessment?: AssessTradeRiskOutput;
}

export interface UserSettings extends ApiKeyConfig {
  tradeSizeLimit: number;
  accountBalance: number;
  tradeHistory: string; // A summary string
  marketConditions: string; // A descriptive string like "Stable", "Volatile"
}

// Re-export AI types for easier access
export type { AssessTradeRiskInput, AssessTradeRiskOutput } from "@/ai/flows/risk-assessment";
