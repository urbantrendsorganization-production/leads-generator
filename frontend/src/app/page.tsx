'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { detectUserCurrency, formatLocalPrice, type CurrencyInfo } from '@/lib/currency';
import {
  Zap,
  BarChart3,
  ArrowRight,
  Users,
  Globe,
  Shield,
  CheckCircle2,
  Gift,
  Star,
  Quote,
  TrendingUp,
  Mail,
  Download,
  Filter,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const BASE_PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

// Animated counter hook
function useCounter(target: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

// Stats counter component with intersection observer
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCounter(value, 1800, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="text-4xl sm:text-5xl font-black text-white tabular-nums">
        {count.toLocaleString()}<span style={{ color: '#FFB800' }}>{suffix}</span>
      </span>
      <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#666666' }}>{label}</span>
    </div>
  );
}

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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-mesh min-h-screen flex items-center">
        {/* Decorative grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Large gold orb — top left */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: '#FFB800' }}
        />
        {/* Smaller gold orb — bottom right */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: '#F5C400' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text & CTAs */}
            <div className="text-left animate-fade-in">
              {/* Eyebrow badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black mb-8 uppercase tracking-widest"
                style={{
                  background: 'rgba(255,184,0,0.1)',
                  border: '1px solid rgba(255,184,0,0.3)',
                  color: '#FFB800',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Powered by real-time data
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight leading-[1.03] text-white">
                Find leads that<br />
                <span className="hero-gradient-text">actually convert.</span>
              </h1>

              <p className="mt-7 max-w-lg text-lg leading-relaxed" style={{ color: '#888888' }}>
                TrendyyLeads surfaces verified business contacts — emails, phone numbers,
                and LinkedIn profiles — filtered by industry, location, and company size.
                Close deals, not browser tabs.
              </p>

              {/* Trust row */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  <img className="h-8 w-8 rounded-full border-2 object-cover" style={{ borderColor: '#0d0d0d' }} src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80" alt="" />
                  <img className="h-8 w-8 rounded-full border-2 object-cover" style={{ borderColor: '#0d0d0d' }} src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80" alt="" />
                  <img className="h-8 w-8 rounded-full border-2 object-cover" style={{ borderColor: '#0d0d0d' }} src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=80&h=80&fit=crop&q=80" alt="" />
                  <div className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black" style={{ borderColor: '#0d0d0d', background: '#FFB800', color: '#0a0a0a' }}>5k+</div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: '#FFB800' }} />
                  ))}
                  <span className="ml-1 text-xs font-bold" style={{ color: '#888888' }}>Trusted by 5,000+ sales pros</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="btn-shimmer btn-primary-hover gap-2 px-8 gradient-bg font-black border-0 text-base"
                    style={{ background: '#FFB800', color: '#0a0a0a', minHeight: '52px', boxShadow: '0 0 32px rgba(255,184,0,0.35)' }}
                  >
                    Start for Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 font-semibold px-6"
                    style={{ color: '#888888', minHeight: '52px' }}
                  >
                    See how it works
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Micro-guarantees */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['No credit card required', 'Free first search', 'Cancel anytime'].map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#555555' }}>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#FFB800' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Hero visual */}
            <div className="relative hidden lg:block animate-fade-in-delay-1">
              {/* Main image */}
              <div className="relative z-10 rounded-2xl overflow-hidden border shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <img
                  src="https://images.unsplash.com/photo-1656416571198-c644ccfaf0f1?w=800&auto=format&fit=crop&q=80"
                  alt="Lead Dashboard"
                  className="w-full h-[520px] object-cover brightness-75"
                />
                {/* Gradient overlay from bottom */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.85) 0%, transparent 50%)' }} />
              </div>

              {/* Floating lead card */}
              <div
                className="absolute bottom-6 left-6 right-6 p-5 rounded-xl glass border shadow-2xl animate-float"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: '#FFB800', color: '#0a0a0a' }}>SK</div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">Shimmy Koly</p>
                    <p className="text-xs truncate" style={{ color: '#666666' }}>VP of Engineering · Series B Startup</p>
                  </div>
                  <div className="ml-auto shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                    Verified
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest mb-0.5" style={{ color: '#444444' }}>Email</p>
                    <p className="text-xs font-medium truncate" style={{ color: '#cccccc' }}>shimmy@acme.io</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest mb-0.5" style={{ color: '#444444' }}>Location</p>
                    <p className="text-xs font-medium" style={{ color: '#cccccc' }}>San Francisco</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest mb-0.5" style={{ color: '#444444' }}>Industry</p>
                    <p className="text-xs font-medium" style={{ color: '#cccccc' }}>SaaS / Tech</p>
                  </div>
                </div>
              </div>

              {/* Corner glow accent */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: '#FFB800' }} />
              <div className="absolute -bottom-4 -left-4 w-1 h-full rounded-full opacity-20" style={{ background: 'linear-gradient(to bottom, #FFB800, transparent)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section className="border-y" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <AnimatedStat value={10000} suffix="+" label="Leads Generated" />
            <AnimatedStat value={50} suffix="+" label="Countries Covered" />
            <AnimatedStat value={27} suffix="" label="Industries Indexed" />
            <AnimatedStat value={98} suffix="%" label="Data Accuracy" />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TESTIMONIALS ─────────────────────────────────────── */}
      <section className="border-b overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Stacked images */}
            <div className="relative hidden sm:block">
              <div className="relative z-10 rounded-2xl overflow-hidden border shadow-2xl rotate-1 hover:rotate-0 transition-all duration-500" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <img
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80"
                  alt="Sales team"
                  className="w-full h-[380px] object-cover brightness-75"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.6) 0%, transparent 60%)' }} />
              </div>
              <div className="absolute -bottom-10 -right-4 z-20 w-2/3 rounded-2xl overflow-hidden border shadow-2xl -rotate-2 hover:rotate-0 transition-all duration-500" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <img
                  src="https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80"
                  alt="Happy client"
                  className="w-full h-[220px] object-cover brightness-75"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.5) 0%, transparent 60%)' }} />
              </div>
              {/* Gold accent glow */}
              <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#FFB800' }} />
            </div>

            {/* Text content */}
            <div className="animate-fade-in">
              <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>
                What our users say
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Stop searching.<br />Start <span className="hero-gradient-text">closing.</span>
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#888888' }}>
                Our users spend 70% less time building pipelines and more time talking to decision-makers.
                Verified emails and LinkedIn profiles eliminate the guesswork from your outreach.
              </p>

              <div className="space-y-3 mb-10">
                {[
                  'Verified data refreshed every 24 hours',
                  'Direct dials & personal email addresses',
                  'Advanced filtering for niche markets',
                  'Instant CSV export for your CRM',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#FFB800' }} />
                    <span className="font-medium" style={{ color: '#cccccc' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial cards */}
              <div className="space-y-4">
                <blockquote
                  className="p-5 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Quote className="h-5 w-5 mb-3 opacity-40" style={{ color: '#FFB800' }} />
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: '#aaaaaa' }}>
                    "TrendyyLeads turned our cold outreach into a warm conversation machine. We landed 3 major clients in our first week."
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
                      alt="Sarah Jenkins"
                      width={36}
                      height={36}
                      className="rounded-full object-cover border-2"
                      style={{ borderColor: 'rgba(255,184,0,0.4)' }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Sarah Jenkins</div>
                      <div className="text-xs" style={{ color: '#FFB800' }}>Director of Sales, TechFlow</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" style={{ color: '#FFB800' }} />)}
                    </div>
                  </div>
                </blockquote>

                <blockquote
                  className="p-5 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <Quote className="h-5 w-5 mb-3 opacity-40" style={{ color: '#FFB800' }} />
                  <p className="text-sm leading-relaxed italic mb-4" style={{ color: '#aaaaaa' }}>
                    "Within 48 hours of signing up, my team had a full prospecting list. The data quality is unlike anything we've used before."
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
                      alt="Marcus Osei"
                      width={36}
                      height={36}
                      className="rounded-full object-cover border-2"
                      style={{ borderColor: 'rgba(255,184,0,0.4)' }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Marcus Osei</div>
                      <div className="text-xs" style={{ color: '#FFB800' }}>Founder, GrowthStack Africa</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" style={{ color: '#FFB800' }} />)}
                    </div>
                  </div>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-b relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {/* Background glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-[0.04]" style={{ background: '#FFB800' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>
              How It Works
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Three steps to your next client</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#666666' }}>
              From zero to a full pipeline in minutes — no setup fees, no sales calls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,184,0,0.3), rgba(255,184,0,0.3), transparent)' }} />

            {[
              {
                icon: Users,
                step: '01',
                title: 'Create Your Account',
                desc: 'Sign up in 30 seconds. No credit card required. You get 1 complimentary search immediately — no strings attached.',
                detail: 'Instant access',
              },
              {
                icon: Filter,
                step: '02',
                title: 'Filter & Search',
                desc: 'Drill down by industry, location, company size, job title, and keywords. Find exactly the decision-makers you need.',
                detail: '27 filter dimensions',
              },
              {
                icon: TrendingUp,
                step: '03',
                title: 'Connect & Convert',
                desc: 'Get verified emails, phone numbers, and LinkedIn profiles. Export to CSV and start closing deals today.',
                detail: 'Export ready',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="relative flex flex-col p-8 rounded-2xl card-hover-lift"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Step number watermark */}
                <span className="absolute top-5 right-6 text-6xl font-black select-none" style={{ color: 'rgba(255,184,0,0.06)' }}>
                  {step.step}
                </span>

                {/* Icon */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-6 shrink-0"
                  style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)' }}
                >
                  <step.icon className="h-7 w-7" style={{ color: '#FFB800' }} />
                </div>

                <h3 className="text-lg font-black mb-2 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#777777' }}>{step.desc}</p>

                {/* Bottom tag */}
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black self-start"
                  style={{ background: 'rgba(255,184,0,0.08)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}
                >
                  <Zap className="h-3 w-3" />
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>
              Platform Capabilities
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Built for modern sales teams</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#666666' }}>
              Everything your team needs to build a pipeline that actually converts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Globe,
                title: 'Global Coverage',
                desc: 'Access leads across 50+ countries and 27 industries. From Silicon Valley startups to African fintechs.',
                tag: '50+ countries',
              },
              {
                icon: Shield,
                title: 'Verified Data',
                desc: 'High-confidence scoring on every contact. Emails and phones validated before they reach you.',
                tag: '98% accuracy',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                desc: 'Sub-2 second response time on every query. No waiting, no buffering — your pipeline on demand.',
                tag: '<2s response',
              },
              {
                icon: Mail,
                title: 'Direct Contacts',
                desc: 'Personal email addresses, direct dials, and LinkedIn profiles — not just company switchboards.',
                tag: 'Decision makers',
              },
              {
                icon: Download,
                title: 'CSV Export',
                desc: 'One-click export to your CRM, spreadsheet, or outreach tool. Works with HubSpot, Salesforce, and more.',
                tag: 'CRM ready',
              },
              {
                icon: BarChart3,
                title: 'Search History',
                desc: 'Every search is saved. Revisit, refine, and build on previous queries without burning extra tokens.',
                tag: 'Full history',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col p-6 rounded-2xl card-hover-lift group"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)' }}
                >
                  <f.icon className="h-6 w-6" style={{ color: '#FFB800' }} />
                </div>
                <h3 className="font-black mb-2 text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: '#666666' }}>{f.desc}</p>
                <span
                  className="text-xs font-black uppercase tracking-widest self-start"
                  style={{ color: 'rgba(255,184,0,0.6)' }}
                >
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON — WHY NOT ALTERNATIVES ───────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>Why us</p>
            <h2 className="text-4xl font-black text-white">The smarter choice</h2>
          </div>

          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {/* Header row */}
            <div className="grid grid-cols-3 text-center text-xs font-black uppercase tracking-widest border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-5 text-left" style={{ color: '#555555' }}>Feature</div>
              <div className="p-5 border-x" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#FFB800', background: 'rgba(255,184,0,0.05)' }}>
                TrendyyLeads
              </div>
              <div className="p-5" style={{ color: '#555555' }}>Competitors</div>
            </div>

            {[
              { feature: 'Pay per use (no subscription)', us: true, them: false },
              { feature: 'Verified emails & direct dials', us: true, them: true },
              { feature: 'No setup fees or contracts', us: true, them: false },
              { feature: 'Global coverage (50+ countries)', us: true, them: false },
              { feature: 'Instant delivery (<2 seconds)', us: true, them: false },
              { feature: 'Free first search included', us: true, them: false },
            ].map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 text-center border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
              >
                <div className="p-4 text-left text-sm font-medium" style={{ color: '#aaaaaa' }}>{row.feature}</div>
                <div className="p-4 border-x flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,184,0,0.03)' }}>
                  {row.us
                    ? <CheckCircle2 className="h-5 w-5" style={{ color: '#FFB800' }} />
                    : <span className="h-5 w-5 rounded-full inline-block" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }} />
                  }
                </div>
                <div className="p-4 flex items-center justify-center">
                  {row.them
                    ? <CheckCircle2 className="h-5 w-5" style={{ color: '#444444' }} />
                    : <span className="h-1 w-5 rounded-full inline-block" style={{ background: '#333333' }} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section className="border-b relative overflow-hidden" id="pricing" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-72 opacity-10 blur-3xl rounded-full" style={{ background: '#FFB800' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#FFB800' }}>Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">Simple, honest pricing</h2>
          <p className="text-lg mb-16 max-w-xl mx-auto" style={{ color: '#666666' }}>
            Buy only what you need. No monthly lock-ins, no hidden fees. Each token = one targeted lead search.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {PRICING.map((tier) => (
              <PricingCard key={tier.id} {...tier} buttonText="Get Started" onSelect={() => { window.location.href = '/register'; }} />
            ))}
          </div>
          <p className="mt-8 text-sm" style={{ color: '#555555' }}>
            All prices in USD. Local currency shown at checkout. &nbsp;
            <Link href="/pricing" className="font-bold hover:underline" style={{ color: '#FFB800' }}>View full pricing details →</Link>
          </p>
        </div>
      </section>

      {/* ── PROMO CODE ───────────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6"
            style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)', color: '#FFB800' }}
          >
            <Gift className="h-4 w-4" />
            Promo Code
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Have a code?</h2>
          <p className="text-sm mb-8" style={{ color: '#666666' }}>Enter your promo code to redeem free tokens instantly.</p>
          <form onSubmit={handlePromo} className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="ENTER PROMO CODE"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 uppercase text-center font-black tracking-widest text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,184,0,0.3)', color: '#ffffff', minHeight: '48px' }}
            />
            <Button
              type="submit"
              disabled={promoLoading || !promoCode.trim()}
              className="font-black btn-primary-hover"
              style={{ background: '#FFB800', color: '#0a0a0a', minHeight: '48px' }}
            >
              {promoLoading ? 'Redeeming...' : 'Redeem'}
            </Button>
          </form>
          {promoMsg && <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#10b981' }}><CheckCircle2 className="h-4 w-4" />{promoMsg}</div>}
          {promoErr && <div className="mt-4 text-sm font-semibold" style={{ color: '#ef4444' }}>{promoErr}</div>}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="relative overflow-hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div
            className="relative rounded-3xl px-8 py-16 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,184,0,0.12) 0%, rgba(245,196,0,0.06) 50%, rgba(255,184,0,0.08) 100%)',
              border: '1px solid rgba(255,184,0,0.2)',
            }}
          >
            {/* Inner glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-40 blur-3xl opacity-30" style={{ background: '#FFB800' }} />

            <div className="relative">
              <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,184,0,0.7)' }}>Ready to grow?</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
                Your next client is<br />
                <span className="hero-gradient-text">one search away.</span>
              </h2>
              <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: '#888888' }}>
                Join 5,000+ sales professionals already using TrendyyLeads to fill their pipelines.
                Start free, no card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="btn-shimmer btn-primary-hover gap-2 px-10 font-black border-0 text-base"
                    style={{ background: '#FFB800', color: '#0a0a0a', minHeight: '56px', boxShadow: '0 0 40px rgba(255,184,0,0.4)' }}
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="font-semibold gap-2"
                    style={{ color: '#888888', minHeight: '56px', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    View pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg shadow-lg transition-transform group-hover:scale-105"
                  style={{ background: '#FFB800' }}
                >
                  <img
                    src="https://res.cloudinary.com/dvifkm1ex/image/upload/v1774512463/t_x4jvlv.png"
                    alt="TrendyyLeads"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <span className="font-black text-white tracking-tight text-xl">
                  TRENDYY <span style={{ color: '#FFB800' }}>LEADS</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#555555' }}>
                The fastest way to find verified business leads across 50+ countries.
                Built for modern sales teams that move fast.
              </p>
              {/* Micro-stats */}
              <div className="mt-6 flex gap-8">
                <div>
                  <div className="text-xl font-black text-white">10k+</div>
                  <div className="text-xs font-medium" style={{ color: '#444444' }}>Leads generated</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">50+</div>
                  <div className="text-xs font-medium" style={{ color: '#444444' }}>Countries</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">98%</div>
                  <div className="text-xs font-medium" style={{ color: '#444444' }}>Accuracy</div>
                </div>
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: '#444444' }}>Product</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'How it works', href: '#how-it-works' },
                ].map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium transition-colors hover:text-white"
                      style={{ color: '#555555' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account links */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: '#444444' }}>Account</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Sign Up Free', href: '/register' },
                  { label: 'Log In', href: '/login' },
                ].map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium transition-colors hover:text-white"
                      style={{ color: '#555555' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-xs font-medium" style={{ color: '#333333' }}>
              &copy; {new Date().getFullYear()} TrendyyLeads. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
