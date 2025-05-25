
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSettings, Trade } from '@/lib/types';
import { DEFAULT_USER_SETTINGS } from '@/lib/constants'; // MOCK_FRIEND_TRADES removed, will be fetched from API

interface AppState extends UserSettings {
  friendTrades: Trade[];
  userTrades: Trade[];
  isLoading: boolean;
  isConfirmModalOpen: boolean;
  tradeToConfirm: Trade | null;
  isRealtimeConnected: boolean; // To track connection status

  // Actions
  initializeRealtimeConnection: () => (() => void); // Returns a cleanup function
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

// Helper to make actual API calls to Next.js API routes
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log(`Calling API: ${endpoint}`, options);
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error (${response.status}) for ${endpoint}: ${errorBody}`);
    throw new Error(`Network response was not ok for ${endpoint}. Status: ${response.status}. Body: ${errorBody}`);
  }
  return response.json();
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
        // This is where you would establish a WebSocket connection to your backend.
        // const socket = new WebSocket('wss://your-backend-websocket-url.com/trades_stream');
        //
        // socket.onopen = () => {
        //   console.log('Real-time connection established with backend.');
        //   set({ isRealtimeConnected: true });
        //   // You might send an authentication message or subscribe to specific topics here
        //   // For example: socket.send(JSON.stringify({ action: 'subscribeToFriendTrades', friendApiKey: 'FRIENDS_IDENTIFIER_TOKEN' }));
        // };
        //
        // socket.onmessage = (event) => {
        //   try {
        //     const newTrade = JSON.parse(event.data as string) as Trade;
        //     if (newTrade && newTrade.id && newTrade.ticker) { // Basic validation
        //       console.log('New trade received via real-time from backend:', newTrade);
        //       // Ensure new trades from real-time also get PENDING_USER_ACTION status
        //       get().addNewFriendTrade({ ...newTrade, status: newTrade.status || 'PENDING_USER_ACTION' });
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
        //   // Implement reconnection logic if needed, e.g., with exponential backoff.
        // };
        //
        // // Return a cleanup function to close the socket when the component/app unmounts
        // return () => {
        //   if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        //     socket.close();
        //   }
        // };

        // MOCK IMPLEMENTATION (Simulate receiving trades periodically)
        // This should be replaced by the actual WebSocket logic above.
        set({ isRealtimeConnected: true }); // Assume connection for mock
        console.log("Mock Real-time connection 'established'. Simulating trade reception.");
        const mockInterval = setInterval(() => {
          if (Math.random() < 0.3) { // Simulate a new trade arriving
            const mockTrade: Trade = {
              id: `RT-${Date.now()}`,
              ticker: Math.random() > 0.5 ? "NIFTY_FUT_AUG" : "BANKNIFTY_OPT_15AUG24_50000CE",
              action: Math.random() > 0.5 ? "BUY" : "SELL",
              quantity: Math.floor(Math.random() * 5) + 1,
              price: Math.floor(Math.random() * 1000) + 24000,
              timestamp: Date.now(),
              status: 'PENDING_USER_ACTION'
            };
            console.log('Simulated new trade received (mock):', mockTrade);
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
            return { friendTrades: [{ ...trade, status: trade.status || 'PENDING_USER_ACTION' }, ...state.friendTrades].sort((a,b) => b.timestamp - a.timestamp) };
          }
          return {}; // Trade already exists, no change
        });
      },

      fetchAccountBalance: async () => {
        set({ isLoading: true });
        try {
          const data = await fetchApi<{ balance: number }>('/api/user/balance');
          set({ accountBalance: data.balance });
        } catch (error) {
          console.error("Failed to fetch account balance from API:", error);
          // Potentially set an error state or show a toast to the user
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFriendTrades: async () => {
        set({ isLoading: true });
        try {
          const tradesFromApi = await fetchApi<Trade[]>('/api/trades/friend_pending');
          
          set((state) => {
            const currentTradeIds = new Set(state.friendTrades.map(t => t.id));
            const newTrades = tradesFromApi.filter(apiTrade => !currentTradeIds.has(apiTrade.id));
            // Ensure all fetched trades have a default status if not provided
            const allTrades = [...newTrades.map(t => ({ ...t, status: t.status || 'PENDING_USER_ACTION' })), ...state.friendTrades]
                              .sort((a,b) => b.timestamp - a.timestamp);
            return {
              friendTrades: allTrades,
            };
          });
        } catch (error) {
          console.error("Failed to fetch friend trades from API:", error);
          // Potentially set an error state or show a toast to the user
        } finally {
          set({ isLoading: false });
        }
      },

      executeTrade: async (trade: Trade): Promise<boolean> => {
        set({ isLoading: true });
        const originalBalance = get().accountBalance;
        try {
          const result = await fetchApi<{ success: boolean; message?: string; newBalance?: number }>(
            '/api/trades/execute', 
            { 
              method: 'POST', 
              body: JSON.stringify(trade), 
              headers: {'Content-Type': 'application/json'} 
            }
          );

          if (result.success) {
            get().addReplicatedTrade(trade); // This updates balance locally for mock based on trade action
            get().updateFriendTradeStatus(trade.id, 'COMPLETED');
            // If the backend provides the new balance, use it. Otherwise, refetch.
            if (result.newBalance !== undefined) {
               set({ accountBalance: result.newBalance });
            } else {
               // A real backend should provide the accurate new balance.
               // For now, the addReplicatedTrade mock-updates it.
               // If your backend doesn't return newBalance, you might need to call:
               // get().fetchAccountBalance(); 
            }
            return true;
          } else {
            get().updateFriendTradeStatus(trade.id, 'FAILED');
            console.error("Failed to execute trade on backend (API response):", result.message);
            return false;
          }

        } catch (error) {
          console.error("Error executing trade via API:", error);
          get().updateFriendTradeStatus(trade.id, 'FAILED');
          // Consider if reverting balance here is always correct, depends on backend atomicity
          // set({ accountBalance: originalBalance }); 
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
        set((state) => ({ userTrades: [newTrade, ...state.userTrades].sort((a,b) => b.timestamp - a.timestamp) }));
        
        // MOCK balance update. A real backend should be the source of truth for balance.
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
      name: 'mirror-trade-settings-v3-api', // Updated version name
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        accountBalance: state.accountBalance, 
        userTrades: state.userTrades,
        // friendTrades not persisted, fetched from API / real-time
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
