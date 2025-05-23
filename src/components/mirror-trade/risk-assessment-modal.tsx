"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bot, CheckCircle, ShieldCheck, ShieldOff, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { Trade, AssessTradeRiskInput, AssessTradeRiskOutput } from "@/lib/types";
import { assessTradeRisk } from "@/ai/flows/risk-assessment";
import { useAppStore } from '@/hooks/use-app-store';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onConfirmReplication: (trade: Trade, riskAssessment: AssessTradeRiskOutput) => void;
}

function getRiskLevelVariant(riskLevel?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (riskLevel?.toLowerCase()) {
    case 'low': return "default"; // Typically green/blue
    case 'medium': return "secondary"; // Typically yellow/orange
    case 'high': return "destructive"; // Typically red
    default: return "outline";
  }
}

function getRiskLevelIcon(riskLevel?: string) {
  switch (riskLevel?.toLowerCase()) {
    case 'low': return <ShieldCheck className="text-green-500" size={20} />;
    case 'medium': return <AlertTriangle className="text-yellow-500" size={20} />;
    case 'high': return <ShieldOff className="text-red-500" size={20} />;
    default: return <Zap size={20} />;
  }
}


export function RiskAssessmentModal({ isOpen, onClose, trade, onConfirmReplication }: RiskAssessmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessTradeRiskOutput | null>(null);
  const { toast } = useToast();
  const { accountBalance, tradeHistory, marketConditions, tradeSizeLimit } = useAppStore(state => ({
    accountBalance: state.accountBalance,
    tradeHistory: state.tradeHistory,
    marketConditions: state.marketConditions,
    tradeSizeLimit: state.tradeSizeLimit,
  }));

  useEffect(() => {
    if (isOpen && trade) {
      performRiskAssessment();
    } else {
      setAssessmentResult(null); // Reset when closed or no trade
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trade]);

  async function performRiskAssessment() {
    if (!trade) return;
    setIsLoading(true);
    setAssessmentResult(null);
    try {
      const input: AssessTradeRiskInput = {
        ticker: trade.ticker,
        quantity: trade.quantity,
        price: trade.price,
        accountBalance,
        tradeHistory,
        marketConditions,
      };
      const result = await assessTradeRisk(input);
      setAssessmentResult(result);
    } catch (error) {
      console.error("Risk assessment failed:", error);
      toast({
        title: "Error",
        description: "Failed to perform risk assessment. Please try again.",
        variant: "destructive",
      });
      onClose(); // Close modal on error
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirm = () => {
    if (trade && assessmentResult) {
      const originalTradeValue = trade.price * trade.quantity;
      let replicationQuantity = trade.quantity;

      if (originalTradeValue > tradeSizeLimit) {
        replicationQuantity = Math.floor(tradeSizeLimit / trade.price);
        toast({
          title: "Trade Size Adjusted",
          description: `Original trade value ($${originalTradeValue.toFixed(2)}) exceeded your limit ($${tradeSizeLimit.toFixed(2)}). Quantity adjusted to ${replicationQuantity}.`,
          variant: "default"
        });
      }
      
      if (replicationQuantity <= 0) {
        toast({
          title: "Replication Cancelled",
          description: `Cannot replicate trade. Adjusted quantity is zero or less due to trade size limit.`,
          variant: "destructive"
        });
        useAppStore.getState().updateFriendTradeStatus(trade.id, 'REJECTED', assessmentResult);
        onClose();
        return;
      }

      const replicatedTrade: Trade = { ...trade, quantity: replicationQuantity };
      onConfirmReplication(replicatedTrade, assessmentResult);
    }
  };
  
  const TradeIcon = trade?.action === 'BUY' ? TrendingUp : TrendingDown;
  const tradeActionColor = trade?.action === 'BUY' ? 'text-green-500' : 'text-red-500';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot size={24} className="text-primary" />
            AI Trade Risk Assessment
          </DialogTitle>
          {trade && (
            <DialogDescription>
              Evaluating risk for {trade.action} {trade.quantity} shares of {trade.ticker} at ${trade.price.toFixed(2)}.
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && (
          <div className="py-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Analyzing trade risk...</p>
            <Progress value={50} className="w-full animate-pulse" />
          </div>
        )}

        {!isLoading && assessmentResult && trade && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
              <div className="flex items-center gap-3">
                <TradeIcon size={32} className={tradeActionColor} />
                <div>
                  <p className="font-semibold text-lg">{trade.ticker} - <span className={tradeActionColor}>{trade.action}</span></p>
                  <p className="text-sm text-muted-foreground">{trade.quantity} shares @ ${trade.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">${(trade.quantity * trade.price).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>

            <Card className="bg-background/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {getRiskLevelIcon(assessmentResult.riskLevel)}
                  Risk Level: <Badge variant={getRiskLevelVariant(assessmentResult.riskLevel)}>{assessmentResult.riskLevel}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Risk Score:</strong> {assessmentResult.riskScore} / 100</p>
                <p><strong>Suggested Action:</strong> <span className="font-medium">{assessmentResult.suggestedAction}</span></p>
                <div>
                  <strong>Justification:</strong>
                  <p className="text-muted-foreground text-xs italic leading-relaxed max-h-20 overflow-y-auto p-1 border-l-2 border-accent pl-2 my-1">{assessmentResult.justification}</p>
                </div>
              </CardContent>
            </Card>
             <p className="text-xs text-muted-foreground text-center">Max investment per trade: ${tradeSizeLimit.toFixed(2)}. Trade size may be adjusted.</p>
          </div>
        )}

        {!isLoading && assessmentResult && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirm}
              disabled={assessmentResult.suggestedAction === "Reject" && assessmentResult.riskLevel === "High"}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <CheckCircle size={16} className="mr-2"/>
              Proceed with Replication
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
