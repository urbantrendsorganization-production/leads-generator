'use client';

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
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all',
        className
      )}
      style={
        isEmpty
          ? {
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#f87171',
              boxShadow: '0 0 16px rgba(239,68,68,0.15)',
            }
          : isLow
          ? {
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#fbbf24',
              boxShadow: '0 0 16px rgba(245,158,11,0.2)',
            }
          : {
              background: 'linear-gradient(135deg,rgba(255,184,0,0.18),rgba(245,196,0,0.1))',
              border: '1px solid rgba(255,184,0,0.45)',
              color: '#FFB800',
              boxShadow: '0 0 20px rgba(255,184,0,0.2)',
            }
      }
    >
      {/* Gold coin SVG icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={isEmpty ? 'rgba(239,68,68,0.15)' : isLow ? 'rgba(245,158,11,0.15)' : 'rgba(255,184,0,0.2)'}
        />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="currentColor"
          fontFamily="system-ui"
        >
          ₮
        </text>
      </svg>
      <span className="font-black text-base leading-none">{balance}</span>
      <span className="text-xs font-semibold opacity-80 leading-none">
        {balance === 1 ? 'search' : 'searches'}
      </span>
    </div>
  );
}
