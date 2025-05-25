
"use client";

import type { Trade } from "@/lib/types";
import { TradeCard } from "./trade-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserSquare } from "lucide-react";
import Image from "next/image";

interface TradesListProps {
  title: string;
  trades: Trade[];
  isFriendList: boolean;
  onReviewTrade?: (trade: Trade) => void; // Renamed from onReplicateTrade
  isLoading?: boolean;
  maxHeight?: string;
}

export function TradesList({ title, trades = [], isFriendList, onReviewTrade, isLoading, maxHeight = "400px" }: TradesListProps) {

  const Icon = isFriendList ? Users : UserSquare;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon size={24} /> {title}</CardTitle>
        <CardDescription>
          {isFriendList ? "Trades from your friend pending your action." : "Trades replicated in your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Image src="https://placehold.co/120x120.png" alt="No trades" width={80} height={80} data-ai-hint="empty box" className="mb-4 opacity-50 rounded-lg" />
            <p className="text-muted-foreground">No trades to display at the moment.</p>
            {isFriendList && <p className="text-xs text-muted-foreground mt-1">Refresh to check for new trades from your friend.</p>}
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }} className="pr-3">
            <div className="space-y-4">
              {trades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  isFriendTrade={isFriendList}
                  onReviewTrade={isFriendList ? onReviewTrade : undefined} // Renamed prop
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
