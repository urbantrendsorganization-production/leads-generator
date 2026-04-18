'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PricingCard } from '@/components/PricingCard';
import { useRouter } from 'next/navigation';
import { detectUserCurrency, formatLocalPrice, type CurrencyInfo } from '@/lib/currency';
import { CheckCircle2, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const BASE_PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

const FAQS = [
  {
    q: 'What is a token?',
    a: 'One token = one lead search. Each search returns up to 5–10 verified business contacts with full contact details.',
  },
  {
    q: 'Do tokens expire?',
    a: 'No. Tokens never expire. Use them at your own pace — no pressure, no deadlines.',
  },
  {
    q: 'Can I get a refund?',
    a: 'If you have unused tokens and are unsatisfied within 7 days of purchase, contact us for a full refund.',
  },
  {
    q: 'Do you offer team plans?',
    a: 'Yes — contact us for partnership and volume deals with custom promo codes and shared token pools.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    detectUserCurrency().then(setCurrency).catch(() => {});
  }, []);

  const pricing = BASE_PRICING.map(tier => ({
    ...tier,
    localEquiv: currency ? `≈ ${formatLocalPrice(tier.price, currency)}` : undefined,
  }));

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ background: '#0d0d0d', color: '#ffffff' }}>
      {/* Background glows */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-80 opacity-10 blur-[100px] rounded-full"
        style={{ background: '#FFB800' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 opacity-06 blur-3xl rounded-full"
        style={{ background: '#F5C400' }}
      />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">

        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6"
            style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)', color: '#FFB800' }}
          >
            <Zap className="h-3.5 w-3.5" />
            No subscriptions
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-5">
            <span className="text-white">Simple, honest</span>{' '}
            <span className="hero-gradient-text">pricing.</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#777777' }}>
            Buy exactly what you need — no recurring charges, no contracts.
            Each token gives you one targeted search with up to 10 verified leads.
          </p>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: CheckCircle2, label: 'No credit card to start' },
              { icon: Shield, label: '7-day refund guarantee' },
              { icon: Globe, label: 'Tokens never expire' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#555555' }}>
                <Icon className="h-4 w-4 shrink-0" style={{ color: '#FFB800' }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-delay-1 mb-20">
          {pricing.map((tier) => (
            <PricingCard
              key={tier.id}
              {...tier}
              onSelect={() => router.push('/register')}
            />
          ))}
        </div>

        {/* Volume note */}
        <div className="text-center mb-24">
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl px-8 py-5"
            style={{
              background: 'rgba(255,184,0,0.06)',
              border: '1px solid rgba(255,184,0,0.2)',
            }}
          >
            <div className="text-sm" style={{ color: '#888888' }}>
              Need volume or a custom plan for your agency?
            </div>
            <a
              href="mailto:contact@trendyyleads.com"
              className="text-sm font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ color: '#FFB800' }}
            >
              Contact us
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* FAQ section */}
        <div className="max-w-2xl mx-auto animate-fade-in-delay-2">
          <h2 className="text-3xl font-black text-white text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={faq.q}
                className="rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  border: openFaq === i
                    ? '1px solid rgba(255,184,0,0.3)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: openFaq === i ? 'rgba(255,184,0,0.04)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-white text-sm">{faq.q}</span>
                  <span
                    className="shrink-0 text-lg font-black transition-transform duration-200"
                    style={{
                      color: '#FFB800',
                      transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-lg font-semibold text-white mb-6">Ready to build your pipeline?</p>
          <Link href="/register">
            <button
              className="btn-shimmer btn-primary-hover inline-flex items-center gap-2 px-10 py-4 rounded-xl font-black text-base border-0 transition-all duration-300"
              style={{
                background: '#FFB800',
                color: '#0a0a0a',
                boxShadow: '0 0 32px rgba(255,184,0,0.3)',
              }}
            >
              Start Free — No Card Required
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
