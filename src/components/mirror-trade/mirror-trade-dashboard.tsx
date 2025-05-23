"use client";

import React, { useEffect } from 'react';
import { AppHeader } from "./app-header";
import { SettingsCard } from "./settings-card";
import { TradesList } from "./trades-list";
import { RiskAssessmentModal } from "./risk-assessment-modal";
import { useAppStore } from "@/hooks/use-app-store";
import type { Trade, AssessTradeRiskOutput } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function MirrorTradeDashboard() {
  const { 
    friendTrades, 
    userTrades, 
    isLoading, 
    fetchFriendTrades,
    isRiskModalOpen,
    tradeForRiskAssessment,
    openRiskModal,
    closeRiskModal,
    addReplicatedTrade,
    updateFriendTradeStatus
  } = useAppStore();

  const { toast } = useToast();

  useEffect(() => {
    // Initial fetch or re-fetch logic can go here if needed via store
    // e.g., fetchFriendTrades(); 
  }, [fetchFriendTrades]);

  const handleReplicateTrade = (trade: Trade) => {
    openRiskModal(trade);
  };

  const handleConfirmReplication = (trade: Trade, riskAssessment: AssessTradeRiskOutput) => {
    addReplicatedTrade(trade);
    updateFriendTradeStatus(trade.id, 'COMPLETED', riskAssessment); // Original friend's trade status update
    closeRiskModal();
    toast({
      title: "Trade Replicated",
      description: `${trade.quantity} shares of ${trade.ticker} (${trade.action}) successfully replicated.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Card - Spans full width on small, 1/3 on large */}
          <div className="lg:col-span-1">
            <SettingsCard />
          </div>

          {/* Trades Lists - Span full width on small, 2/3 on large, stacked vertically */}
          <div className="lg:col-span-2 space-y-6">
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
                onReplicateTrade={handleReplicateTrade}
                isLoading={isLoading}
                maxHeight="calc(50vh - 120px)" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Your Replicated Trades</h2>
              <TradesList
                title="My Trades"
                trades={userTrades}
                isFriendList={false}
                isLoading={false} // Assuming user trades are loaded differently or instantly updated
                maxHeight="calc(50vh - 120px)"
              />
            </div>
          </div>
        </div>
      </div>

      {tradeForRiskAssessment && (
        <RiskAssessmentModal
          isOpen={isRiskModalOpen}
          onClose={closeRiskModal}
          trade={tradeForRiskAssessment}
          onConfirmReplication={handleConfirmReplication}
        />
      )}
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        MirrorTrade &copy; {new Date().getFullYear()} - Your AI-Powered Trading Companion
      </footer>
    </div>
  );
}
