'use client';

import { useEffect, useState } from 'react';
import { PricingCard } from '@/components/PricingCard';
import { useRouter } from 'next/navigation';
import { detectUserCurrency, formatLocalPrice, type CurrencyInfo } from '@/lib/currency';

const BASE_PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

export default function PricingPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);

  useEffect(() => {
    detectUserCurrency().then(setCurrency).catch(() => {});
  }, []);

  const pricing = BASE_PRICING.map(tier => ({
    ...tier,
    localEquiv: currency ? `≈ ${formatLocalPrice(tier.price, currency)}` : undefined,
  }));

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ background: '#0d0d0d', color: '#ffffff' }}>
      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-72 opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #FFB800 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F5C400 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>
            Pricing
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-white">Choose Your</span>{' '}
            <span style={{ color: '#FFB800' }}>Plan</span>
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#888888' }}>
            Each search gives you 5&ndash;10 high-quality leads with full contact details.
            No subscriptions &mdash; buy only what you need.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-delay-1">
          {pricing.map((tier) => (
            <PricingCard
              key={tier.id}
              {...tier}
              onSelect={() => router.push('/register')}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center animate-fade-in-delay-2">
          <div
            className="inline-flex items-center gap-3 rounded-2xl px-7 py-4"
            style={{
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.25)',
            }}
          >
            <span className="text-sm" style={{ color: '#888888' }}>
              Need unlimited searches?
            </span>
            <span
              className="text-sm font-black uppercase tracking-wide"
              style={{ color: '#FFB800' }}
            >
              Contact us for partnership promo codes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
