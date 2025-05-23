
"use client";

import React, { useEffect } from 'react';
import { AppHeader } from "./app-header";
// import { SettingsCard } from "./settings-card"; // SettingsCard removed
import { TradesList } from "./trades-list";
import { ConfirmTradeModal } from "./confirm-trade-modal"; // Renamed from RiskAssessmentModal
import { useAppStore } from "@/hooks/use-app-store";
import type { Trade } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function MirrorTradeDashboard() {
  const { 
    friendTrades, 
    userTrades, 
    isLoading, 
    fetchFriendTrades,
    isConfirmModalOpen, // Renamed
    tradeToConfirm, // Renamed
    openConfirmModal, // Renamed
    closeConfirmModal, // Renamed
    addReplicatedTrade,
    updateFriendTradeStatus
  } = useAppStore();

  const { toast } = useToast();

  useEffect(() => {
    // Initial fetch or re-fetch logic can go here if needed via store
    // e.g., fetchFriendTrades(); 
  }, [fetchFriendTrades]);

  const handleReviewTrade = (trade: Trade) => {
    openConfirmModal(trade);
  };

  const handleConfirmDecision = (trade: Trade, action: 'accept' | 'reject') => {
    if (action === 'accept') {
      addReplicatedTrade(trade);
      updateFriendTradeStatus(trade.id, 'COMPLETED');
      toast({
        title: "Trade Accepted",
        description: `${trade.quantity} shares of ${trade.ticker} (${trade.action}) successfully replicated.`,
      });
    } else { // reject
      updateFriendTradeStatus(trade.id, 'REJECTED');
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
        {/* Adjusted grid layout to remove settings card */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold">Friend's Activity</h2>
              <Button variant="outline" size="sm" onClick={fetchFriendTrades} disabled={isLoading}>
                <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <TradesList
              title="Friend's Trades"
              trades={friendTrades}
              isFriendList={true}
              onReviewTrade={handleReviewTrade} // Renamed prop
              isLoading={isLoading}
              maxHeight="calc(50vh - 80px)" // Adjusted height
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Replicated Trades</h2>
            <TradesList
              title="My Trades"
              trades={userTrades}
              isFriendList={false}
              isLoading={false} 
              maxHeight="calc(50vh - 80px)" // Adjusted height
            />
          </div>
        </div>
      </div>

      {tradeToConfirm && (
        <ConfirmTradeModal
          isOpen={isConfirmModalOpen}
          onClose={closeConfirmModal}
          trade={tradeToConfirm}
          onConfirmDecision={handleConfirmDecision} // Renamed prop
        />
      )}
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        MirrorTrade &copy; {new Date().getFullYear()} - Your Trading Companion
      </footer>
    </div>
  );
}
