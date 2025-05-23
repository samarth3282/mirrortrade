
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@/lib/types";
import { ArrowRightLeft, CheckCircle, AlertTriangle, XCircle, Hourglass, Bot } from "lucide-react";
import { format } from "date-fns";

interface TradeCardProps {
  trade: Trade;
  isFriendTrade: boolean;
  onReplicate?: (trade: Trade) => void;
}

function getStatusVariant(status?: Trade['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'COMPLETED': return "default"; // Green in many themes, primary here
    case 'PENDING_REPLICATION':
    case 'PENDING_RISK_ASSESSMENT': return "secondary"; // Yellow/Orange
    case 'REJECTED':
    case 'FAILED': return "destructive"; // Red
    default: return "outline";
  }
}

function getStatusIcon(status?: Trade['status']) {
  switch (status) {
    case 'COMPLETED': return <CheckCircle className="text-green-500" size={16} />;
    case 'PENDING_REPLICATION':
    case 'PENDING_RISK_ASSESSMENT': return <Hourglass className="text-yellow-500" size={16} />;
    case 'REJECTED': return <XCircle className="text-red-500" size={16} />;
    case 'FAILED': return <AlertTriangle className="text-red-700" size={16} />;
    default: return null;
  }
}

function getRiskLevelVariant(riskLevel?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (riskLevel?.toLowerCase()) {
    case 'low': return "default";
    case 'medium': return "secondary";
    case 'high': return "destructive";
    default: return "outline";
  }
}

export function TradeCard({ trade, isFriendTrade, onReplicate }: TradeCardProps) {
  const tradeValue = trade.price * trade.quantity;
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Format date on client-side after hydration
    setFormattedDate(format(new Date(trade.timestamp), "MMM dd, yyyy HH:mm"));
  }, [trade.timestamp]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{trade.ticker}</CardTitle>
            <CardDescription>
              {trade.action} {trade.quantity} shares @ ${trade.price.toFixed(2)}
            </CardDescription>
          </div>
          {trade.status && (
            <Badge variant={getStatusVariant(trade.status)} className="flex items-center gap-1">
              {getStatusIcon(trade.status)}
              {trade.status.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Total Value:</span>
          <span className="font-semibold">${tradeValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Date:</span>
          {/* Display formatted date once available, or a placeholder */}
          <span>{formattedDate || "Loading date..."}</span>
        </div>
        {trade.riskAssessment && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md border border-dashed">
            <h4 className="text-xs font-semibold mb-1 flex items-center gap-1"><Bot size={14}/> AI Risk Assessment:</h4>
            <div className="flex justify-between items-center text-xs">
              <span>Level: <Badge variant={getRiskLevelVariant(trade.riskAssessment.riskLevel)} className="px-1 py-0 text-xs">{trade.riskAssessment.riskLevel}</Badge></span>
              <span>Score: {trade.riskAssessment.riskScore}/100</span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground italic">Suggests: {trade.riskAssessment.suggestedAction}</p>
            {/* <p className="text-xs mt-1 text-muted-foreground truncate hover:whitespace-normal">{trade.riskAssessment.justification}</p> */}
          </div>
        )}
      </CardContent>
      {isFriendTrade && onReplicate && trade.status === 'PENDING_RISK_ASSESSMENT' && (
        <CardFooter>
          <Button 
            onClick={() => onReplicate(trade)} 
            className="w-full"
            variant="outline"
          >
            <ArrowRightLeft size={16} className="mr-2" />
            Assess & Replicate
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
