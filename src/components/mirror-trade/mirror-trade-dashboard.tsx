
"use client";

import React, { useEffect } from 'react';
import { AppHeader } from "./app-header";
import { TradesList } from "./trades-list";
import { ConfirmTradeModal } from "./confirm-trade-modal"; 
import { useAppStore } from "@/hooks/use-app-store";
import type { Trade } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function MirrorTradeDashboard() {
  const { 
    friendTrades, 
    userTrades, 
    isLoading, 
    fetchFriendTrades,
    isConfirmModalOpen, 
    tradeToConfirm, 
    openConfirmModal, 
    closeConfirmModal,
    executeTrade,
    initializeRealtimeConnection,
    fetchAccountBalance,
    isRealtimeConnected // Get connection status
  } = useAppStore();

  const { toast } = useToast();

  useEffect(() => {
    // Initialize real-time connection for friend's trades
    const cleanupRealtimeConnection = initializeRealtimeConnection();
    
    // Fetch initial data as well, in case real-time takes time or misses some.
    fetchFriendTrades();
    fetchAccountBalance();

    return () => {
      if (cleanupRealtimeConnection) {
        cleanupRealtimeConnection();
      }
    };
  }, [initializeRealtimeConnection, fetchFriendTrades, fetchAccountBalance]);

  const handleReviewTrade = (trade: Trade) => {
    openConfirmModal(trade);
  };

  const handleConfirmDecision = async (trade: Trade, action: 'accept' | 'reject') => {
    if (action === 'accept') {
      const success = await executeTrade(trade);
      if (success) {
        toast({
          title: "Trade Accepted & Replicated",
          description: `Successfully replicated ${trade.action} of ${trade.quantity} ${trade.ticker}.`,
        });
      } else {
        toast({
          title: "Trade Execution Failed",
          description: `Could not replicate ${trade.action} of ${trade.quantity} ${trade.ticker}. Check balance or try again.`,
          variant: "destructive",
        });
      }
    } else { // reject
      useAppStore.getState().updateFriendTradeStatus(trade.id, 'REJECTED');
      toast({
        title: "Trade Rejected",
        description: `${trade.quantity} shares of ${trade.ticker} (${trade.action}) was not replicated.`,
        variant: "default", 
      });
    }
    closeConfirmModal();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">Friend's Activity</h2>
                {isRealtimeConnected ? (
                  <Wifi size={20} className="text-green-500" title="Real-time connected" />
                ) : (
                  <WifiOff size={20} className="text-red-500" title="Real-time disconnected" />
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => { fetchFriendTrades(); fetchAccountBalance(); }} disabled={isLoading}>
                <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isRealtimeConnected 
                ? "New trades from your friend will appear automatically." 
                : "Real-time updates are currently disconnected. Try refreshing."}
            </p>
            <TradesList
              title="Friend's Trades"
              trades={friendTrades}
              isFriendList={true}
              onReviewTrade={handleReviewTrade} 
              isLoading={isLoading && friendTrades.length === 0}
              maxHeight="calc(50vh - 100px)" 
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Replicated Trades</h2>
            <TradesList
              title="My Trades"
              trades={userTrades}
              isFriendList={false}
              isLoading={isLoading && userTrades.length === 0 && friendTrades.length > 0} 
              maxHeight="calc(50vh - 80px)" 
            />
          </div>
        </div>
      </div>

      {tradeToConfirm && (
        <ConfirmTradeModal
          isOpen={isConfirmModalOpen}
          onClose={closeConfirmModal}
          trade={tradeToConfirm}
          onConfirmDecision={handleConfirmDecision} 
        />
      )}
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        MirrorTrade &copy; {new Date().getFullYear()} - Your Trading Companion
      </footer>
    </div>
  );
}
