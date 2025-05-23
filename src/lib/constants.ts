
import type { Trade, UserSettings } from "./types";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  accountBalance: 50000, // Default account balance of $50,000
};

export const MOCK_FRIEND_TRADES: Trade[] = [
  { 
    id: "FT001", 
    ticker: "NIFTY_FUT_JUL", 
    action: "BUY", 
    quantity: 1, 
    price: 23500.00, 
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    status: "PENDING_USER_ACTION"
  },
  { 
    id: "FT002", 
    ticker: "BANKNIFTY_OPT_25JUL24_48000CE", 
    action: "BUY", 
    quantity: 2, 
    price: 150.50, 
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
    status: "PENDING_USER_ACTION"
  },
  { 
    id: "FT003", 
    ticker: "NIFTY_FUT_JUL", 
    action: "SELL", 
    quantity: 1, 
    price: 23550.25, 
    timestamp: Date.now() - 3600000 * 0.5, // 30 mins ago
    status: "PENDING_USER_ACTION"
  },
];

// Removed MOCK_MARKET_CONDITIONS_OPTIONS as it's no longer needed.
