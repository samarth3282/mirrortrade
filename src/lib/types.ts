
export interface Trade {
  id: string;
  ticker: string; // Will represent index trades, e.g., "NIFTY_FUT", "BANKNIFTY_OPT_CE_21000"
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: number; // Unix timestamp
  status?: 'PENDING_USER_ACTION' | 'COMPLETED' | 'REJECTED' | 'FAILED';
}

export interface UserSettings {
  accountBalance: number;
}
