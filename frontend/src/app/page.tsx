'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { detectUserCurrency, formatLocalPrice, type CurrencyInfo } from '@/lib/currency';
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
  Star,
  Quote,
} from 'lucide-react';

const BASE_PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

export default function LandingPage() {
  const [promoCode, setPromoCode] = useState('');
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [promoErr, setPromoErr] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    detectUserCurrency().then(setCurrency).catch(() => {});
  }, []);

  const PRICING = BASE_PRICING.map(tier => ({
    ...tier,
    localEquiv: currency ? `≈ ${formatLocalPrice(tier.price, currency)}` : undefined,
  }));

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
    <div className="flex flex-col" style={{ background: '#0d0d0d', color: '#ffffff' }}>

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-mesh min-h-[95vh] flex items-center bg-[#0d0d0d]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Text & CTAs */}
            <div className="text-left animate-fade-in">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-8 uppercase tracking-widest"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
              >
                <Star className="h-4 w-4" style={{ color: '#FFB800' }} />
                Quality Leads
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white">
                <span>Find leads that</span>
                <br />
                <span className="text-white">convert.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg sm:text-xl leading-relaxed" style={{ color: '#888888' }}>
                TrendyyLeads helps you discover high-quality business leads with full
                contact details. Filter by industry, location, and company size in seconds.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="btn-shimmer gap-2 px-9 gradient-bg font-black border-0 shadow-lg hover:opacity-95 transition-all duration-300 text-base"
                    style={{ background: '#FFB800', color: '#0a0a0a' }}
                  >
                    Start for Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex -space-x-3">
                    <img className="h-9 w-9 rounded-full border-2 border-[#0d0d0d] object-cover" src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=100&h=100&fit=crop" alt="" />
                    <img className="h-9 w-9 rounded-full border-2 border-[#0d0d0d] object-cover" src="https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=100&h=100&fit=crop" alt="" />
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Trusted by 5k+ pros</p>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Image with Subtle Floating Lead Card */}
            <div className="relative hidden lg:block animate-fade-in-delay-1">
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
                <img 
                  src="https://images.unsplash.com/photo-1656416571198-c644ccfaf0f1?w=800&auto=format&fit=crop&q=80" 
                  alt="Client Dashboard" 
                  className="w-full h-[550px] object-cover brightness-90"
                />
                
                {/* Floating Glass Lead Card */}
                <div 
                  className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl backdrop-blur-lg border border-white/10 shadow-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#FFB800] flex items-center justify-center font-bold text-black text-xl">
                      SK
                    </div>
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-tight">shimmy koly</h3>
                      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Verified Tech Lead</p>
                    </div>
                    <div className="ml-auto bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Active
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold">Email</p>
                      <p className="text-sm text-zinc-300">shimmykolym@gmail.com</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold">Location</p>
                      <p className="text-sm text-zinc-300">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-full h-full border-2 border-white/5 rounded-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="border-t overflow-hidden bg-zinc-950/50" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80" 
                  alt="Team collaboration" 
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-6 z-20 w-2/3 rounded-2xl overflow-hidden border border-white/10 shadow-2xl -rotate-3 hover:rotate-0 transition-transform duration-500 hidden sm:block">
                <img 
                  src="https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80" 
                  alt="Happy client" 
                  className="w-full h-[250px] object-cover"
                />
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FFB800]/10 blur-3xl rounded-full" />
            </div>

            <div className="animate-fade-in">
              <Quote className="h-10 w-10 text-[#FFB800] mb-6 opacity-50" />
              <h2 className="text-4xl font-bold text-white mb-6">Stop searching, start <span className="text-[#FFB800]">closing.</span></h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Our users spend 70% less time building pipelines and more time talking to decision-makers. By providing verified emails and LinkedIn profiles, we eliminate the guesswork from your outreach.
              </p>
              
              <div className="space-y-4">
                {[
                  'Verified data updated every 24 hours',
                  'Direct dials & personal email addresses',
                  'Advanced filtering for niche markets'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#FFB800]" />
                    <span className="text-zinc-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10 italic text-zinc-400">
                "TrendyyLeads turned our cold outreach into a warm conversation machine. We landed 3 major clients in our first week."
                <div className="mt-4 flex items-center gap-3 not-italic">
                   <div className="font-bold text-white">Sarah Jenkins</div>
                   <div className="text-sm text-[#FFB800]">Director of Sales, TechFlow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>
              How It Works
            </p>
            <h2 className="text-4xl font-bold text-white">Three steps to your next client</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, step: '01', title: 'Create Your Account', desc: 'Sign up for free and get 1 complimentary lead search. No strings attached.' },
              { icon: Search, step: '02', title: 'Search for Leads', desc: 'Filter by industry, location, company size, and keywords to find ideal clients.' },
              { icon: BarChart3, step: '03', title: 'Connect & Convert', desc: 'Get emails, phone numbers, and websites. Start reaching out and closing deals.' },
            ].map((step, idx) => (
              <div
                key={step.title}
                className="relative flex flex-col items-start p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ borderLeft: '3px solid #FFB800', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="absolute top-5 right-6 text-5xl font-black opacity-[0.06] select-none" style={{ color: '#FFB800' }}>
                  {step.step}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0" style={{ background: 'rgba(255,184,0,0.14)', border: '1px solid rgba(255,184,0,0.35)' }}>
                  <step.icon className="h-6 w-6" style={{ color: '#FFB800' }} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}> Why TrendyyLeads </p>
            <h2 className="text-4xl font-bold text-white">Built for modern sales teams</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Globe, title: 'Global Coverage', desc: 'Leads across 50+ industries and 30+ countries worldwide.' },
              { icon: Shield, title: 'Data Quality', desc: 'Verified contacts with high-confidence scoring on every result.' },
              { icon: Zap, title: 'Instant Results', desc: 'Sub-2 second response time so you never wait on your pipeline.' },
              { icon: Users, title: 'Team Friendly', desc: 'CSV exports, history tracking, and flexible token bundles.' },
            ].map((f) => (
              <div key={f.title} className="flex flex-col p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-4 shrink-0" style={{ background: 'rgba(255,184,0,0.14)', border: '1px solid rgba(255,184,0,0.3)' }}>
                  <f.icon className="h-5 w-5" style={{ color: '#FFB800' }} />
                </div>
                <h3 className="font-bold mb-1.5 text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t relative overflow-hidden" id="pricing" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>Pricing</p>
          <h2 className="text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-14">
            {PRICING.map((tier) => (
              <PricingCard key={tier.id} {...tier} buttonText="Get Started" onSelect={() => { window.location.href = '/register'; }} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Code */}
      <section className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-6 w-6" style={{ color: '#FFB800' }} />
            <h2 className="text-2xl font-bold text-white">Have a Promo Code?</h2>
          </div>
          <form onSubmit={handlePromo} className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 uppercase text-center"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,184,0,0.35)', color: '#ffffff' }}
            />
            <Button type="submit" disabled={promoLoading || !promoCode.trim()} className="font-black" style={{ background: '#FFB800', color: '#0a0a0a' }}>
              {promoLoading ? 'Redeeming...' : 'Redeem'}
            </Button>
          </form>
          {promoMsg && <div className="mt-3 text-emerald-400 text-sm">{promoMsg}</div>}
          {promoErr && <div className="mt-3 text-destructive text-sm">{promoErr}</div>}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111111' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-lg transition-transform group-hover:scale-105" style={{ background: '#FFB800' }}>
                <img src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774512463/t_x4jvlv.png" alt="TrendyyLeads" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-black text-white tracking-tight text-xl">
                TRENDYY <span style={{ color: '#FFB800' }}>LEADS</span>
              </span>
            </div>

            <p className="text-sm font-medium order-3 md:order-2" style={{ color: '#555555' }}>
              &copy; {new Date().getFullYear()} TrendyyLeads. All rights reserved.
            </p>

            <div className="flex items-center gap-5 order-2 md:order-3">
              <Link href="#" className="transition-colors hover:text-white" style={{ color: '#555555' }}>
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="transition-colors hover:text-white" style={{ color: '#555555' }}>
                <span className="sr-only">X (Twitter)</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}