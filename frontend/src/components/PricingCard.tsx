'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number;
  tokens: number;
  description: string;
  popular?: boolean;
  localEquiv?: string;   // e.g. "≈ ₦16,983" — shown below USD price
  onSelect?: () => void;
  buttonText?: string;
  disabled?: boolean;
}

export function PricingCard({
  name,
  price,
  tokens,
  description,
  popular,
  localEquiv,
  onSelect,
  buttonText = 'Get Started',
  disabled,
}: PricingCardProps) {
  const pricePerSearch = (price / tokens).toFixed(2);

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl transition-all duration-300',
        popular
          ? 'gradient-border scale-[1.03] shadow-[0_0_40px_rgba(124,58,237,0.25)]'
          : 'hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)]'
      )}
      style={
        popular
          ? {
              background: 'linear-gradient(160deg, rgba(124,58,237,0.14) 0%, rgba(6,182,212,0.1) 100%)',
              border: 'none',
            }
          : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }
      }
    >
      {/* Most Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span
            className="inline-flex items-center rounded-full px-4 py-1 text-xs font-bold text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 0 16px rgba(124,58,237,0.5)',
            }}
          >
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center px-7 pt-9 pb-4">
        <p
          className="text-sm font-semibold uppercase tracking-widest mb-3"
          style={{ color: popular ? '#c4b5fd' : '#8b9cc0' }}
        >
          {name}
        </p>
        <div className="flex items-end justify-center gap-1">
          <span className="text-lg font-medium text-slate-400">$</span>
          <span className="text-5xl font-extrabold text-white">{price}</span>
        </div>
        {localEquiv && (
          <p className="mt-1 text-sm text-slate-500">{localEquiv}</p>
        )}
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Divider */}
      <div
        className="mx-7 mb-5"
        style={{
          height: '1px',
          background: popular
            ? 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)'
            : 'rgba(255,255,255,0.07)',
        }}
      />

      {/* Features */}
      <div className="flex-1 px-7 pb-2 space-y-2.5">
        <Feature text={`${tokens} lead searches`} popular={popular} />
        <Feature text={`$${pricePerSearch} per search`} popular={popular} />
        <Feature text="Detailed contact info" popular={popular} />
        <Feature text="Export to CSV" popular={popular} />
        {tokens >= 50  && <Feature text="Priority results" popular={popular} />}
        {tokens >= 150 && <Feature text="Advanced filters" popular={popular} />}
      </div>

      {/* CTA Button */}
      <div className="px-7 pb-7 pt-5">
        <Button
          className={cn(
            'w-full font-semibold text-base border-0 transition-all duration-300',
            popular
              ? 'btn-shimmer gradient-bg text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_32px_rgba(124,58,237,0.6)] hover:opacity-95'
              : 'text-slate-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10'
          )}
          variant={popular ? 'default' : 'outline'}
          style={
            !popular
              ? { borderColor: 'rgba(139,92,246,0.25)' }
              : undefined
          }
          size="lg"
          onClick={onSelect}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

function Feature({ text, popular }: { text: string; popular?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div
        className="flex h-4.5 w-4.5 items-center justify-center rounded-full shrink-0"
        style={{
          background: popular
            ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
            : 'rgba(139,92,246,0.2)',
        }}
      >
        <Check className="h-2.5 w-2.5 text-white" />
      </div>
      <span className="text-slate-300">{text}</span>
    </div>
  );
}
