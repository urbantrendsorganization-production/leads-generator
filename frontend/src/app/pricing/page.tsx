'use client';

import { PricingCard } from '@/components/PricingCard';
import { useRouter } from 'next/navigation';

const PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14 animate-fade-in">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Each search gives you 5-10 high-quality leads with full contact details.
          No subscriptions &mdash; buy only what you need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-delay-1">
        {PRICING.map((tier) => (
          <PricingCard
            key={tier.id}
            {...tier}
            onSelect={() => router.push('/register')}
          />
        ))}
      </div>

      <div className="mt-16 text-center animate-fade-in-delay-2">
        <div className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-6 py-4">
          <span className="text-sm text-muted-foreground">
            Need unlimited searches?
          </span>
          <span className="text-sm font-medium text-primary">
            Contact us for partnership promo codes.
          </span>
        </div>
      </div>
    </div>
  );
}
