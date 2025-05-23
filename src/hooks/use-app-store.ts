
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
  isRealtimeConnected: boolean; // To track connection status

  // Actions
  initializeRealtimeConnection: () => void; // For WebSocket or SSE
  fetchFriendTrades: () => Promise<void>;
  fetchAccountBalance: () => Promise<void>;
  executeTrade: (trade: Trade) => Promise<boolean>;
  addReplicatedTrade: (trade: Trade) => void;
  updateFriendTradeStatus: (tradeId: string, status: Trade['status']) => void;
  addNewFriendTrade: (trade: Trade) => void; // For real-time updates

  openConfirmModal: (trade: Trade) => void;
  closeConfirmModal: () => void;
  
  setAccountBalance: (balance: number) => void; 
}

// Helper function to simulate API calls - replace with actual fetch calls to your backend
async function apiCall<T>(endpoint: string, options?: RequestInit, mockData?: T, delay = 1000): Promise<T> {
  console.log(`Simulating API call to /api/${endpoint}`, options); // Prefix with /api/ to simulate a backend route
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
      friendTrades: [], 
      userTrades: [],
      isLoading: false,
      isConfirmModalOpen: false,
      tradeToConfirm: null,
      isRealtimeConnected: false,
      
      setAccountBalance: (balance) => set({ accountBalance: balance }),

      initializeRealtimeConnection: () => {
        console.log("Attempting to initialize real-time connection...");
        set({ isRealtimeConnected: false }); // Reset on new attempt

        // REAL IMPLEMENTATION:
        // const socket = new WebSocket('wss://your-backend-websocket-url.com/trades');
        //
        // socket.onopen = () => {
        //   console.log('Real-time connection established.');
        //   set({ isRealtimeConnected: true });
        //   // Optionally, request initial data or confirm subscription
        //   // socket.send(JSON.stringify({ action: 'subscribeToFriendTrades', friendApiKey: get().friendApiKey }));
        // };
        //
        // socket.onmessage = (event) => {
        //   try {
        //     const newTrade = JSON.parse(event.data as string);
        //     if (newTrade && newTrade.id && newTrade.ticker) { // Basic validation
        //       console.log('New trade received via real-time:', newTrade);
        //       get().addNewFriendTrade(newTrade);
        //     }
        //   } catch (error) {
        //     console.error('Error processing real-time message:', error);
        //   }
        // };
        //
        // socket.onerror = (error) => {
        //   console.error('Real-time connection error:', error);
        //   set({ isRealtimeConnected: false });
        // };
        //
        // socket.onclose = () => {
        //   console.log('Real-time connection closed.');
        //   set({ isRealtimeConnected: false });
        //   // Implement reconnection logic if needed
        // };
        //
        // return () => {
        //   socket.close();
        // };

        // MOCK IMPLEMENTATION (Simulate receiving trades periodically)
        // This is just for demonstration. Remove in a real app.
        set({ isRealtimeConnected: true }); // Assume connection for mock
        console.log("Mock Real-time connection 'established'. Simulating trade reception.");
        const mockInterval = setInterval(() => {
          if (Math.random() < 0.3) { // Simulate a new trade arriving
            const mockTrade: Trade = {
              id: `RT-${Date.now()}`,
              ticker: Math.random() > 0.5 ? "NIFTY_FUT_SEP" : "BANKNIFTY_OPT_30JUL24_49000PE",
              action: Math.random() > 0.5 ? "BUY" : "SELL",
              quantity: Math.floor(Math.random() * 5) + 1,
              price: Math.floor(Math.random() * 1000) + 23000,
              timestamp: Date.now(),
              status: 'PENDING_USER_ACTION'
            };
            console.log('Simulated new trade received:', mockTrade);
            get().addNewFriendTrade(mockTrade);
          }
        }, 15000); // Simulate a potential new trade every 15 seconds

        // Cleanup function for the mock interval
        return () => {
          clearInterval(mockInterval);
          set({ isRealtimeConnected: false});
          console.log("Mock Real-time connection 'closed'.");
        };
      },

      addNewFriendTrade: (trade) => {
        set((state) => {
          const existingTrade = state.friendTrades.find(t => t.id === trade.id);
          if (!existingTrade) {
            // Ensure new trades also get a PENDING_USER_ACTION status if not provided
            return { friendTrades: [{ ...trade, status: trade.status || 'PENDING_USER_ACTION' }, ...state.friendTrades] };
          }
          return {}; // Trade already exists, no change
        });
      },

      fetchAccountBalance: async () => {
        set({ isLoading: true });
        try {
          // REAL IMPLEMENTATION: Call your backend
          // const balanceData = await apiCall<{ balance: number }>('user/balance', { headers: { 'Authorization': `Bearer ${get().userApiKey}` } });
          // set({ accountBalance: balanceData.balance });
          
          // MOCK IMPLEMENTATION
          console.log("Placeholder: Fetching account balance from API. Using current store value.");
          await new Promise(resolve => setTimeout(resolve, 500)); 
          // For mock, we assume the balance is managed by trades or set initially.
          // If you need to simulate fetching a new balance:
          // const mockBalance = await apiCall<{balance: number}>('user/balance', {}, { balance: get().accountBalance + (Math.random() * 1000 - 500) });
          // set({ accountBalance: mockBalance.balance });

        } catch (error) {
          console.error("Failed to fetch account balance:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFriendTrades: async () => {
        set({ isLoading: true });
        try {
          // REAL IMPLEMENTATION: Call your backend for initial/missed trades
          // const tradesFromApi = await apiCall<Trade[]>('trades/friend_pending', { headers: { 'Authorization': `Bearer ${get().userApiKey}` }}); // Pass necessary auth/identifiers
          
          // MOCK IMPLEMENTATION (for initial load if real-time isn't immediate or as fallback)
          const tradesFromApi = await apiCall<Trade[]>('trades/friend_pending', {}, MOCK_FRIEND_TRADES.map(t => ({...t, status: t.status || 'PENDING_USER_ACTION' })));
          
          set((state) => {
            const currentTradeIds = new Set(state.friendTrades.map(t => t.id));
            const newTrades = tradesFromApi.filter(apiTrade => !currentTradeIds.has(apiTrade.id));
            return {
              friendTrades: [...newTrades.map(t => ({ ...t, status: t.status || 'PENDING_USER_ACTION' })), ...state.friendTrades],
            };
          });
        } catch (error) {
          console.error("Failed to fetch friend trades:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      executeTrade: async (trade: Trade): Promise<boolean> => {
        set({ isLoading: true });
        const originalBalance = get().accountBalance;
        try {
          // REAL IMPLEMENTATION: Call your backend
          // const tradeExecutionData = { ...trade, userApiKey: get().userApiKey };
          // const result = await apiCall<{ success: boolean; message?: string; newBalance?: number }>(
          //   'trades/execute', 
          //   { method: 'POST', body: JSON.stringify(tradeExecutionData), headers: {'Content-Type': 'application/json'} }
          // );
          // if (result.success) {
          //   get().addReplicatedTrade(trade); // This is for UI update
          //   get().updateFriendTradeStatus(trade.id, 'COMPLETED');
          //   if (result.newBalance !== undefined) {
          //      set({ accountBalance: result.newBalance });
          //   } else {
          //      get().fetchAccountBalance(); // Fallback to fetch if backend doesn't return new balance
          //   }
          //   return true;
          // } else {
          //   get().updateFriendTradeStatus(trade.id, 'FAILED');
          //   console.error("Failed to execute trade on backend:", result.message);
          //   return false;
          // }

          // MOCK IMPLEMENTATION
          console.log("Placeholder: Executing trade via API", trade);
          await new Promise(resolve => setTimeout(resolve, 1000)); 
          
          const tradeCost = trade.price * trade.quantity;
          if (trade.action === 'BUY' && originalBalance < tradeCost) {
            console.error("Mock trade execution failed: Insufficient balance.");
            get().updateFriendTradeStatus(trade.id, 'FAILED');
            return false;
          }

          get().addReplicatedTrade(trade); // Updates balance locally for mock
          get().updateFriendTradeStatus(trade.id, 'COMPLETED');
          return true;

        } catch (error) {
          console.error("Error executing trade:", error);
          get().updateFriendTradeStatus(trade.id, 'FAILED');
          set({ accountBalance: originalBalance }); // Revert balance on error
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      addReplicatedTrade: (trade) => { 
        const newTrade: Trade = {
          ...trade,
          id: `UT-${Date.now()}`, 
          timestamp: Date.now(),
          status: 'COMPLETED', 
        };
        set((state) => ({ userTrades: [newTrade, ...state.userTrades] }));
        
        // This part should ideally be driven by the backend's response about the new balance.
        // For mock, we'll update it directly.
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
      name: 'mirror-trade-settings-v2', // Changed name to avoid conflicts if old state exists
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        // Persist user specific settings if any, userTrades.
        // Avoid persisting friendTrades as they should come from real-time/API.
        // Avoid persisting isLoading, isConfirmModalOpen, tradeToConfirm, isRealtimeConnected.
        accountBalance: state.accountBalance, 
        userTrades: state.userTrades,
      }),
    }
  )
);

// Initialize on client-side load
if (typeof window !== 'undefined') {
  // Fetch initial data. Real-time connection will be set up by the component.
  useAppStore.getState().fetchFriendTrades();
  useAppStore.getState().fetchAccountBalance();
}
