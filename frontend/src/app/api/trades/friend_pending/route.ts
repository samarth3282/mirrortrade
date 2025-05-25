// src/app/api/trades/friend_pending/route.ts
import { NextResponse } from 'next/server';
import type { Trade } from '@/lib/types';
import { MOCK_FRIEND_TRADES } from '@/lib/constants';

// TODO: Replace this with actual Sharekhan API integration
// This function would fetch pending trades for the friend from Sharekhan.
// It needs access to the friend's API key (securely managed on the backend).

export async function GET(request: Request) {
  console.log('API Route: /api/trades/friend_pending called');
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real application, you would:
    // 1. Authenticate the request if necessary (e.g., ensure it's from your app).
    // 2. Get the friend's API key (from a secure backend store).
    // 3. Call the Sharekhan API to get their recent trades that are actionable.
    // 4. Format the trades into the `Trade` type.

    const trades: Trade[] = MOCK_FRIEND_TRADES.map(t => ({
      ...t,
      status: t.status || 'PENDING_USER_ACTION',
      // Simulate some trades being older if the mock data timestamp isn't dynamic enough
      timestamp: t.timestamp || Date.now() - Math.random() * 1000 * 60 * 60 * 5 
    })).sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

    console.log('API Route: Returning mock friend trades:', trades.length);
    return NextResponse.json(trades);

  } catch (error) {
    console.error('API Route: Error fetching friend trades:', error);
    return NextResponse.json({ message: 'Error fetching friend trades', error: (error as Error).message }, { status: 500 });
  }
}