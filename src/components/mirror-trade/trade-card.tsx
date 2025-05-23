
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@/lib/types";
import { ArrowRightLeft, CheckCircle, AlertTriangle, XCircle, Hourglass } from "lucide-react";
import { format } from "date-fns";

interface TradeCardProps {
  trade: Trade;
  isFriendTrade: boolean;
  onReviewTrade?: (trade: Trade) => void; // Renamed from onReplicate
}

function getStatusVariant(status?: Trade['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'COMPLETED': return "default"; 
    case 'PENDING_USER_ACTION': return "secondary"; 
    case 'REJECTED':
    case 'FAILED': return "destructive"; 
    default: return "outline";
  }
}

function getStatusIcon(status?: Trade['status']) {
  switch (status) {
    case 'COMPLETED': return <CheckCircle className="text-green-500" size={16} />;
    case 'PENDING_USER_ACTION': return <Hourglass className="text-yellow-500" size={16} />;
    case 'REJECTED': return <XCircle className="text-red-500" size={16} />;
    case 'FAILED': return <AlertTriangle className="text-red-700" size={16} />;
    default: return null;
  }
}


export function TradeCard({ trade, isFriendTrade, onReviewTrade }: TradeCardProps) {
  const tradeValue = trade.price * trade.quantity;
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
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
          <span>{formattedDate || "Loading date..."}</span>
        </div>
        {/* Removed AI Risk Assessment details */}
      </CardContent>
      {isFriendTrade && onReviewTrade && trade.status === 'PENDING_USER_ACTION' && (
        <CardFooter>
          <Button 
            onClick={() => onReviewTrade(trade)} 
            className="w-full"
            variant="outline"
          >
            <ArrowRightLeft size={16} className="mr-2" />
            Review & Decide
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
