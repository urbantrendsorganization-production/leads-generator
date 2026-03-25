'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import {
  Search,
  Zap,
  BarChart3,
  ArrowRight,
  Users,
  Globe,
  Shield,
  CheckCircle2,
  XCircle,
  Gift,
} from 'lucide-react';

const PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

export default function LandingPage() {
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [promoErr, setPromoErr] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  async function handlePromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (!isAuthenticated()) {
      setPromoErr('Please register or log in first to redeem a promo code.');
      return;
    }
    setPromoLoading(true);
    setPromoMsg('');
    setPromoErr('');
    try {
      const result = await api.promos.redeem(promoCode.trim());
      setPromoMsg(`${result.tokensAdded} tokens added to your account!`);
      setPromoCode('');
    } catch (err: any) {
      setPromoErr(err.message || 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-4 w-4" />
              Powered by intelligent lead matching
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Find Your Next Client.{' '}
              <span className="text-primary">Instantly.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              UrbanLeads helps you discover high-quality business leads with detailed
              contact information. Search by industry, location, and more &mdash; get results in seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8">
                  Get Your Free Search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 1 free search on signup.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to your next client</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: '1. Create Your Account',
                desc: 'Sign up for free and get 1 complimentary lead search. No strings attached.',
              },
              {
                icon: Search,
                title: '2. Search for Leads',
                desc: 'Filter by industry, location, company size, and keywords to find your ideal clients.',
              },
              {
                icon: BarChart3,
                title: '3. Connect & Convert',
                desc: 'Get detailed contact info including emails, phone numbers, and websites. Start reaching out.',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-5">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '10,000+', label: 'Leads Generated' },
              { icon: Globe, value: '50+', label: 'Industries Covered' },
              { icon: Shield, value: '99.9%', label: 'Uptime' },
              { icon: Zap, value: '<2s', label: 'Average Response' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-card/50" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Pay only for the searches you need. No subscriptions, no hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {PRICING.map((tier) => (
              <PricingCard
                key={tier.id}
                {...tier}
                buttonText="Get Started"
                onSelect={() => {
                  window.location.href = '/register';
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Code */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold">Have a Promo Code?</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Enter your code below to unlock bonus searches.
          </p>
          <form onSubmit={handlePromo} className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 uppercase text-center"
            />
            <Button type="submit" disabled={promoLoading || !promoCode.trim()}>
              {promoLoading ? 'Redeeming...' : 'Redeem'}
            </Button>
          </form>
          {promoMsg && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              {promoMsg}
            </div>
          )}
          {promoErr && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              {promoErr}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Search className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">UrbanLeads</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} UrbanLeads. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
