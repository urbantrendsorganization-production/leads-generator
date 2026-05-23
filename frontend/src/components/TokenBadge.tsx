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
              background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent)',
              color: 'var(--brand-primary)',
              boxShadow: '0 0 16px var(--brand-primary-glow)',
            }
          : {
              background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-primary) 40%, transparent)',
              color: 'var(--brand-primary)',
              boxShadow: '0 0 20px var(--brand-primary-glow)',
            }
      }
    >
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
          fill={isEmpty ? 'rgba(239,68,68,0.15)' : 'color-mix(in srgb, currentColor 15%, transparent)'}
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
