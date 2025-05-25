
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components
import { TrendingDown, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import type { Trade } from "@/lib/types";

interface ConfirmTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onConfirmDecision: (trade: Trade, action: 'accept' | 'reject') => void;
}

export function ConfirmTradeModal({ isOpen, onClose, trade, onConfirmDecision }: ConfirmTradeModalProps) {

  const handleAccept = () => {
    if (trade) {
      onConfirmDecision(trade, 'accept');
    }
  };

  const handleReject = () => {
    if (trade) {
      onConfirmDecision(trade, 'reject');
    }
  };
  
  if (!trade) return null;

  const TradeIcon = trade.action === 'BUY' ? TrendingUp : TrendingDown;
  const tradeActionColor = trade.action === 'BUY' ? 'text-green-500' : 'text-red-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirm Trade Replication
          </DialogTitle>
          <DialogDescription>
            Review the details of your friend's trade before deciding to replicate or reject it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TradeIcon size={24} className={tradeActionColor} />
                    {trade.ticker} - <span className={tradeActionColor}>{trade.action}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{trade.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">${trade.price.toFixed(2)}</span>
              </div>
              <hr className="my-1 border-border"/>
              <div className="flex justify-between">
                <span className="font-semibold">Total Value:</span>
                <span className="font-semibold">${(trade.quantity * trade.price).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReject}>
            <XCircle size={16} className="mr-2"/>
            Reject Trade
          </Button>
          <Button 
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700 text-white" // Custom accept button style
          >
            <CheckCircle size={16} className="mr-2"/>
            Accept & Replicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
