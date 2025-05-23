
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
  initializeRealtimeConnection: () => void; // For WebSocket or SSE
  fetchFriendTrades: () => Promise<void>;
  fetchAccountBalance: () => Promise<void>;
  executeTrade: (trade: Trade) => Promise<boolean>; // Renamed for clarity
  addReplicatedTrade: (trade: Trade) => void; // Kept for local state update post-execution
  updateFriendTradeStatus: (tradeId: string, status: Trade['status']) => void;

  openConfirmModal: (trade: Trade) => void;
  closeConfirmModal: () => void;
  
  setAccountBalance: (balance: number) => void; 
}

// Helper function to simulate API calls - replace with actual fetch calls to your backend
async function apiCall<T>(endpoint: string, options?: RequestInit, mockData?: T, delay = 1000): Promise<T> {
  console.log(`Simulating API call to ${endpoint}`, options);
  await new Promise(resolve => setTimeout(resolve, delay));
  // In a real app, you would fetch from your backend:
  // const response = await fetch(`/api/${endpoint}`, options);
  // if (!response.ok) throw new Error('Network response was not ok');
  // return response.json();
  if (mockData !== undefined) return mockData;
  throw new Error('Mock data not provided for API call simulation');
}


export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER_SETTINGS,
      friendTrades: [], // Start with empty, fetch on load or via real-time
      userTrades: [],
      isLoading: false,
      isConfirmModalOpen: false,
      tradeToConfirm: null,
      
      setAccountBalance: (balance) => set({ accountBalance: balance }),

      initializeRealtimeConnection: () => {
        // TODO: Implement real-time connection (e.g., WebSocket or Server-Sent Events)
        // This service would push new friend's trades to the client.
        // Example:
        // const eventSource = new EventSource('/api/trades/stream'); // Your backend endpoint
        // eventSource.onmessage = (event) => {
        //   const newTrade = JSON.parse(event.data);
        //   // Add new trade to friendTrades, ensuring no duplicates and maintaining order
        //   set((state) => {
        //     const existingTrade = state.friendTrades.find(t => t.id === newTrade.id);
        //     if (!existingTrade) {
        //       return { friendTrades: [{ ...newTrade, status: 'PENDING_USER_ACTION' }, ...state.friendTrades] };
        //     }
        //     return {}; 
        //   });
        // };
        // eventSource.onerror = (error) => {
        //   console.error('EventSource failed:', error);
        //   eventSource.close();
        // };
        // return () => {
        //   eventSource.close();
        // };
        console.log("Real-time connection placeholder: Initialize WebSocket or SSE for friend's trades.");
        // For now, let's still use the mock fetch as a fallback or initial load
        get().fetchFriendTrades();
      },

      fetchAccountBalance: async () => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call to your backend to get Sharekhan account balance
          // const balanceData = await apiCall<{ balance: number }>('account/balance', {}, { balance: get().accountBalance });
          // set({ accountBalance: balanceData.balance, isLoading: false });
          console.log("Placeholder: Fetching account balance from API.");
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
          // Using existing mock balance for now
        } catch (error) {
          console.error("Failed to fetch account balance:", error);
          // Handle error appropriately
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFriendTrades: async () => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call to your backend to get pending friend's trades
          // This would be for initial load or manual refresh if not using real-time,
          // or if real-time connection drops.
          const tradesFromApi = await apiCall<Trade[]>('trades/friend', {}, MOCK_FRIEND_TRADES.map(t => ({...t, status: t.status || 'PENDING_USER_ACTION' })));
          set({ 
            friendTrades: tradesFromApi.map(trade => ({
              ...trade,
              status: get().friendTrades.find(ft => ft.id === trade.id)?.status || 'PENDING_USER_ACTION'
            })), 
            isLoading: false 
          });
        } catch (error) {
          console.error("Failed to fetch friend trades:", error);
          set({ isLoading: false });
          // Potentially set an error state here
        }
      },

      executeTrade: async (trade: Trade): Promise<boolean> => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call to your backend to execute the trade on Sharekhan
          // The backend would handle the Sharekhan API interaction securely.
          // const result = await apiCall<{ success: boolean; message?: string }>(
          //   'trades/execute', 
          //   { method: 'POST', body: JSON.stringify(trade), headers: {'Content-Type': 'application/json'} },
          //   { success: true } 
          // );
          // if (result.success) {
          //   get().addReplicatedTrade(trade); // Update local state on successful execution
          //   get().updateFriendTradeStatus(trade.id, 'COMPLETED');
          //   get().fetchAccountBalance(); // Refresh balance after trade
          //   return true;
          // } else {
          //   get().updateFriendTradeStatus(trade.id, 'FAILED');
          //   console.error("Failed to execute trade:", result.message);
          //   return false;
          // }
          console.log("Placeholder: Executing trade via API", trade);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
          
          // Simulate successful execution for now:
          get().addReplicatedTrade(trade); // This updates balance locally based on trade
          get().updateFriendTradeStatus(trade.id, 'COMPLETED');
          // No need to call fetchAccountBalance if addReplicatedTrade updates it correctly
          return true;

        } catch (error) {
          console.error("Error executing trade:", error);
          get().updateFriendTradeStatus(trade.id, 'FAILED');
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      addReplicatedTrade: (trade) => { // This function now primarily updates local state AFTER successful API execution
        const newTrade: Trade = {
          ...trade,
          id: `UT-${Date.now()}`, 
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
      name: 'mirror-trade-real-settings', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        accountBalance: state.accountBalance, // Persist balance
        userTrades: state.userTrades, // Persist user's replicated trades
        // friendTrades should probably be fetched fresh, not persisted long-term if they expire or are dynamic
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  // Initialize real-time connection or fetch initial data
  // useAppStore.getState().initializeRealtimeConnection(); 
  // For now, let's use the explicit fetch for friend trades and balance
  useAppStore.getState().fetchFriendTrades();
  useAppStore.getState().fetchAccountBalance();
}

