"use client";

import { TrendingUp } from 'lucide-react';

export function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 text-primary">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      >
        <path d="M8 20L4 16L8 12" />
        <path d="M4 16H14.5C16.9853 16 19 13.9853 19 11.5C19 9.01472 16.9853 7 14.5 7H4" />
        <path d="M16 4L20 8L16 12" />
        <path d="M20 8H9.5C7.01472 8 5 10.0147 5 12.5C5 14.9853 7.01472 17 9.5 17H20" />

      </svg>
      <span className="text-xl font-bold text-primary group-hover:text-primary/90">
        MirrorTrade
      </span>
    </div>
  );
}
