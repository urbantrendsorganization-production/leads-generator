'use client';

import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenBadgeProps {
  balance: number;
  className?: string;
}

export function TokenBadge({ balance, className }: TokenBadgeProps) {
  return (
    <Badge
      variant={balance <= 0 ? 'destructive' : balance < 3 ? 'accent' : 'default'}
      className={cn('gap-1.5 px-3 py-1.5 text-sm', className)}
    >
      <Coins className="h-4 w-4" />
      {balance} {balance === 1 ? 'search' : 'searches'} remaining
    </Badge>
  );
}
