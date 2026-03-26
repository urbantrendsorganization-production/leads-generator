'use client';

import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenBadgeProps {
  balance: number;
  className?: string;
}

export function TokenBadge({ balance, className }: TokenBadgeProps) {
  const isEmpty = balance <= 0;
  const isLow = balance > 0 && balance < 3;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all',
        className
      )}
      style={
        isEmpty
          ? {
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
              boxShadow: '0 0 12px rgba(239,68,68,0.2)',
            }
          : isLow
          ? {
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#fbbf24',
              boxShadow: '0 0 12px rgba(245,158,11,0.2)',
            }
          : {
              background: 'linear-gradient(135deg,rgba(124,58,237,0.22),rgba(6,182,212,0.18))',
              border: '1px solid rgba(139,92,246,0.45)',
              color: '#c4b5fd',
              boxShadow: '0 0 14px rgba(124,58,237,0.25)',
            }
      }
    >
      <Coins className="h-3.5 w-3.5" />
      {balance} {balance === 1 ? 'search' : 'searches'} remaining
    </div>
  );
}
