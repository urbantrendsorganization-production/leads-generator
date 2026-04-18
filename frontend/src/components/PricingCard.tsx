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
  localEquiv?: string;
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
          ? 'scale-[1.03] shadow-[0_0_48px_rgba(255,184,0,0.18)]'
          : 'hover:-translate-y-1'
      )}
      style={
        popular
          ? {
              background: 'linear-gradient(160deg, rgba(255,184,0,0.1) 0%, rgba(245,196,0,0.06) 100%)',
              border: '1.5px solid rgba(255,184,0,0.4)',
            }
          : {
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
            }
      }
    >
      {/* Most Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-black shadow-lg"
            style={{
              background: '#FFB800',
              boxShadow: '0 0 20px rgba(255,184,0,0.5)',
            }}
          >
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center px-7 pt-9 pb-4">
        <p
          className="text-xs font-black uppercase tracking-widest mb-3"
          style={{ color: popular ? '#FFB800' : '#555555' }}
        >
          {name}
        </p>
        <div className="flex items-end justify-center gap-1">
          <span className="text-lg font-medium" style={{ color: '#555555' }}>$</span>
          <span className="text-5xl font-black text-white">{price}</span>
        </div>
        {localEquiv && (
          <p className="mt-1 text-sm" style={{ color: '#555555' }}>{localEquiv}</p>
        )}
        <p className="mt-3 text-sm leading-relaxed" style={{ color: '#777777' }}>{description}</p>
      </div>

      {/* Divider */}
      <div
        className="mx-7 mb-5"
        style={{
          height: '1px',
          background: popular
            ? 'linear-gradient(90deg, transparent, rgba(255,184,0,0.5), transparent)'
            : 'rgba(255,255,255,0.06)',
        }}
      />

      {/* Features */}
      <div className="flex-1 px-7 pb-2 space-y-3">
        <Feature text={`${tokens} lead searches`} popular={popular} />
        <Feature text={`$${pricePerSearch} per search`} popular={popular} />
        <Feature text="Verified contact info" popular={popular} />
        <Feature text="CSV export" popular={popular} />
        {tokens >= 50  && <Feature text="Priority results" popular={popular} />}
        {tokens >= 150 && <Feature text="Advanced filters" popular={popular} />}
        {tokens >= 150 && <Feature text="Search history" popular={popular} />}
      </div>

      {/* CTA Button */}
      <div className="px-7 pb-7 pt-6">
        <Button
          className={cn(
            'w-full font-black text-base border-0 transition-all duration-300',
            popular
              ? 'btn-shimmer btn-primary-hover'
              : 'hover:border-[rgba(255,184,0,0.3)] hover:bg-[rgba(255,184,0,0.07)] hover:text-[#FFB800]'
          )}
          variant={popular ? 'default' : 'outline'}
          style={
            popular
              ? {
                  background: '#FFB800',
                  color: '#0a0a0a',
                  boxShadow: '0 0 24px rgba(255,184,0,0.35)',
                  minHeight: '48px',
                }
              : {
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#888888',
                  minHeight: '48px',
                }
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
        className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
        style={{
          background: popular
            ? 'rgba(255,184,0,0.15)'
            : 'rgba(255,255,255,0.05)',
          border: popular
            ? '1px solid rgba(255,184,0,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Check className="h-3 w-3" style={{ color: popular ? '#FFB800' : '#555555' }} />
      </div>
      <span style={{ color: '#aaaaaa' }}>{text}</span>
    </div>
  );
}
