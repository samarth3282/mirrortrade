
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSettings, Trade } from '@/lib/types';
import { DEFAULT_USER_SETTINGS, MOCK_FRIEND_TRADES } from '@/lib/constants';

interface AppState extends UserSettings {
  friendTrades: Trade[];
  userTrades: Trade[];
  isLoading: boolean;
  isConfirmModalOpen: boolean;
  tradeToConfirm: Trade | null;

  // Actions
  fetchFriendTrades: () => Promise<void>;
  addReplicatedTrade: (trade: Trade) => void;
  updateFriendTradeStatus: (tradeId: string, status: Trade['status']) => void;

  openConfirmModal: (trade: Trade) => void;
  closeConfirmModal: () => void;
  
  // Action to update balance, potentially for external updates if needed later
  setAccountBalance: (balance: number) => void; 
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER_SETTINGS,
      friendTrades: MOCK_FRIEND_TRADES.map(t => ({...t, status: t.status || 'PENDING_USER_ACTION' })),
      userTrades: [],
      isLoading: false,
      isConfirmModalOpen: false,
      tradeToConfirm: null,
      
      setAccountBalance: (balance) => set({ accountBalance: balance }),

      fetchFriendTrades: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        // Initialize or refresh friend trades with PENDING_USER_ACTION status
        const initialTrades = MOCK_FRIEND_TRADES.map(trade => ({
            ...trade,
            // Ensure existing trades in store maintain their status if already processed,
            // otherwise default to PENDING_USER_ACTION. This logic might need refinement
            // if we were fetching live data and comparing with existing state.
            // For now, new "fetches" will reset to mock data with PENDING_USER_ACTION.
            status: 'PENDING_USER_ACTION'
        }));
        set({ friendTrades: initialTrades, isLoading: false });
      },

      addReplicatedTrade: (trade) => {
        const newTrade: Trade = {
          ...trade,
          id: `UT-${Date.now()}`, // User Trade ID
          timestamp: Date.now(),
          status: 'COMPLETED', 
        };
        set((state) => ({ userTrades: [newTrade, ...state.userTrades] }));
        
        const tradeValue = newTrade.price * newTrade.quantity;
        if (newTrade.action === 'BUY') {
          set((state) => ({ accountBalance: state.accountBalance - tradeValue }));
        } else { // SELL
          set((state) => ({ accountBalance: state.accountBalance + tradeValue }));
        }
      },
      
      updateFriendTradeStatus: (tradeId, status) => {
        set((state) => ({
          friendTrades: state.friendTrades.map((t) =>
            t.id === tradeId ? { ...t, status } : t
          ),
        }));
      },

      openConfirmModal: (trade) => set({ isConfirmModalOpen: true, tradeToConfirm: trade }),
      closeConfirmModal: () => set({ isConfirmModalOpen: false, tradeToConfirm: null }),
    }),
    {
      name: 'mirror-trade-simple-settings', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        accountBalance: state.accountBalance,
        userTrades: state.userTrades,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useAppStore.getState().fetchFriendTrades();
}
