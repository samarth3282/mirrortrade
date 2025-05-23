import type { Trade, UserSettings } from "./types";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userApiKey: "",
  friendApiKey: "",
  tradeSizeLimit: 1000, // Default limit of $1000 per trade
  accountBalance: 50000, // Default account balance of $50,000
  tradeHistory: "Initial account setup. No prior trades.",
  marketConditions: "Market conditions are currently stable with low volatility.",
};

export const MOCK_FRIEND_TRADES: Trade[] = [
  { 
    id: "FT001", 
    ticker: "AAPL", 
    action: "BUY", 
    quantity: 10, 
    price: 170.00, 
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    status: "PENDING_RISK_ASSESSMENT"
  },
  { 
    id: "FT002", 
    ticker: "MSFT", 
    action: "BUY", 
    quantity: 5, 
    price: 420.50, 
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
    status: "PENDING_RISK_ASSESSMENT"
  },
  { 
    id: "FT003", 
    ticker: "GOOGL", 
    action: "SELL", 
    quantity: 7, 
    price: 155.25, 
    timestamp: Date.now() - 3600000 * 0.5, // 30 mins ago
    status: "PENDING_RISK_ASSESSMENT"
  },
];

export const MOCK_MARKET_CONDITIONS_OPTIONS = [
  "Market conditions are currently stable with low volatility.",
  "Market is experiencing moderate volatility with mixed signals.",
  "High volatility expected due to upcoming economic announcements.",
  "Bearish sentiment dominates the market.",
  "Bullish sentiment is strong across major indices."
];
