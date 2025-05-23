"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSettings, Trade, AssessTradeRiskOutput } from '@/lib/types';
import { DEFAULT_USER_SETTINGS, MOCK_FRIEND_TRADES } from '@/lib/constants';

interface AppState extends UserSettings {
  friendTrades: Trade[];
  userTrades: Trade[];
  isLoading: boolean;
  isRiskModalOpen: boolean;
  tradeForRiskAssessment: Trade | null;

  // Actions
  setApiKeys: (keys: { userApiKey: string; friendApiKey: string }) => void;
  setTradeSizeLimit: (limit: number) => void;
  setAccountBalance: (balance: number) => void;
  setTradeHistory: (history: string) => void;
  setMarketConditions: (conditions: string) => void;
  
  fetchFriendTrades: () => Promise<void>; // Mocked for now
  addReplicatedTrade: (trade: Trade) => void;
  updateFriendTradeStatus: (tradeId: string, status: Trade['status'], riskAssessment?: AssessTradeRiskOutput) => void;

  openRiskModal: (trade: Trade) => void;
  closeRiskModal: () => void;
  
  // A utility to update multiple settings at once
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER_SETTINGS,
      friendTrades: MOCK_FRIEND_TRADES, // Initialize with mock data
      userTrades: [],
      isLoading: false,
      isRiskModalOpen: false,
      tradeForRiskAssessment: null,

      setApiKeys: (keys) => set({ userApiKey: keys.userApiKey, friendApiKey: keys.friendApiKey }),
      setTradeSizeLimit: (limit) => set({ tradeSizeLimit: limit }),
      setAccountBalance: (balance) => set({ accountBalance: balance }),
      setTradeHistory: (history) => set({ tradeHistory: history }),
      setMarketConditions: (conditions) => set({ marketConditions: conditions }),
      
      updateUserSettings: (settings) => set((state) => ({ ...state, ...settings })),

      fetchFriendTrades: async () => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In a real app, fetch from Sharekhan API using friendApiKey
        // For now, we just ensure the mock trades are loaded or potentially refresh them.
        // This is more of a placeholder.
        set({ friendTrades: MOCK_FRIEND_TRADES.map(t => ({...t, status: t.status || 'PENDING_RISK_ASSESSMENT' })), isLoading: false });
      },

      addReplicatedTrade: (trade) => {
        const newTrade: Trade = {
          ...trade,
          id: `UT-${Date.now()}`, // User Trade ID
          timestamp: Date.now(),
          status: 'COMPLETED', // Or PENDING_EXECUTION then COMPLETED
        };
        set((state) => ({ userTrades: [newTrade, ...state.userTrades] }));
        // Potentially update account balance after trade
        const tradeValue = newTrade.price * newTrade.quantity;
        if (newTrade.action === 'BUY') {
          set((state) => ({ accountBalance: state.accountBalance - tradeValue }));
        } else {
          set((state) => ({ accountBalance: state.accountBalance + tradeValue }));
        }
      },
      
      updateFriendTradeStatus: (tradeId, status, riskAssessment) => {
        set((state) => ({
          friendTrades: state.friendTrades.map((t) =>
            t.id === tradeId ? { ...t, status, riskAssessment: riskAssessment || t.riskAssessment } : t
          ),
        }));
      },

      openRiskModal: (trade) => set({ isRiskModalOpen: true, tradeForRiskAssessment: trade }),
      closeRiskModal: () => set({ isRiskModalOpen: false, tradeForRiskAssessment: null }),
    }),
    {
      name: 'mirror-trade-settings', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ // Choose which parts of the state to persist
        userApiKey: state.userApiKey,
        friendApiKey: state.friendApiKey,
        tradeSizeLimit: state.tradeSizeLimit,
        accountBalance: state.accountBalance,
        tradeHistory: state.tradeHistory,
        marketConditions: state.marketConditions,
        userTrades: state.userTrades, // Persist user trades
      }),
    }
  )
);

// Call fetchFriendTrades on initial load (client-side)
if (typeof window !== 'undefined') {
  useAppStore.getState().fetchFriendTrades();
}
