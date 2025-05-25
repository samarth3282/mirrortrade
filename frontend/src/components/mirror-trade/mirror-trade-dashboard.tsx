
"use client";

import React, { useState, useEffect } from 'react';
// import { useAppStore } from "@/hooks/use-app-store";
import { AppHeader } from "./app-header";
import { TradesList } from "./trades-list";
import { ConfirmTradeModal } from "./confirm-trade-modal";
import { useAppStore } from "@/hooks/use-app-store";
import type { Trade } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function MirrorTradeDashboard() {
  const { addNewFriendTrade, accountBalance, setAccountBalance, myTrades, friendTrades } = useAppStore(state => ({
    addNewFriendTrade: state.addNewFriendTrade,
    accountBalance: state.accountBalance,
    setAccountBalance: state.setAccountBalance,
    myTrades: state.myTrades,
    friendTrades: state.friendTrades,
  }));

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // --- Real-time WebSocket + Balance Fetch ---
  useEffect(() => {
    // Fetch account balance from backend
    fetch("http://localhost:4000/api/trades/balance")
      .then(res => res.json())
      .then(data => {
        if (data?.available_balance) {
          setAccountBalance(data.available_balance);
        }
      })
      .catch(err => console.error("Balance fetch error:", err));

    // Connect to WebSocket for real-time friend trades
    const socket = new WebSocket("ws://localhost:4000");

    socket.onopen = () => console.log("WebSocket connected");
    socket.onmessage = (event) => {
      const trade = JSON.parse(event.data);
      addNewFriendTrade(trade);
    };
    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.log("WebSocket disconnected");

    return () => socket.close();
  }, []);

  // --- Called when user accepts or rejects a friend trade ---
  const handleDecision = async (trade: Trade, action: "accept" | "reject") => {
    if (action === "accept") {
      try {
        const res = await fetch("http://localhost:4000/api/trades/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: trade.ticker,
            quantity: trade.quantity,
            price: trade.price,
            action: trade.action,
            orderType: "MARKET"
          }),
        });

        const result = await res.json();
        console.log("Trade placed:", result);
        // Optionally update UI if needed
      } catch (err) {
        console.error("Trade execution error:", err);
      }
    }

    // Close modal
    setModalOpen(false);
    setSelectedTrade(null);
  };

  return (
    <>
      <AppHeader />
      <div className="p-4 space-y-6">
        <TradesList
          title="Friend's Trades"
          trades={friendTrades}
          isFriendList={true}
          onReviewTrade={(trade) => {
            setSelectedTrade(trade);
            setModalOpen(true);
          }}
        />
        <TradesList
          title="Your Trades"
          trades={myTrades}
          isFriendList={false}
        />
      </div>
      <ConfirmTradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trade={selectedTrade}
        onConfirmDecision={handleDecision}
      />
    </>
  );
}