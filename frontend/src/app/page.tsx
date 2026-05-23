'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import {
  Zap, BarChart3, ArrowRight, Users, Globe, Shield,
  CheckCircle2, Star, Mail, Download, Filter,
  ChevronRight, Sparkles, ChevronDown, TrendingUp,
  Activity, Clock, Target, RefreshCw,
} from 'lucide-react';

// ─── Pricing types ─────────────────────────────────────────────────────
// ─── Animated counter ──────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

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
    <div ref={ref} className="flex flex-col items-center gap-2">
      <span className="text-5xl sm:text-6xl font-black tabular-nums text-white leading-none" style={{ letterSpacing: '-0.02em' }}>
        {count.toLocaleString()}<span style={{ color: '#0D9488' }}>{suffix}</span>
      </span>
      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#444' }}>{label}</span>
    </div>
  );
}

// ─── Rotating headline word ────────────────────────────────────────────
const ROTATING_WORDS = ['convert', 'close', 'scale', 'deliver'];

function RotatingWord() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % ROTATING_WORDS.length); setVisible(true); }, 300);
    }, 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #7C3AED 0%, #0D9488 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        minWidth: '180px',
      }}
    >
      {ROTATING_WORDS[idx]}
    </span>
  );
}

// ─── Merge field highlight for email demo ─────────────────────────────
function renderMergeHighlight(text: string) {
  const parts = text.split(/(\{first_name\}|\{company\})/gi);
  return parts.map((part, i) => {
    if (part === '{first_name}' || part === '{company}') {
      return (
        <mark key={i} style={{
          background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
          color: 'var(--brand-primary)',
          borderRadius: '3px', padding: '0 4px',
          fontWeight: 600, fontStyle: 'normal',
        }}>
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── FAQ data ──────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How accurate is the contact data?', a: 'Our data engine verifies contacts in real-time, achieving 98%+ accuracy across emails and phone numbers. Data is enriched via Clearbit and Hunter.io for verified company leads.' },
  { q: 'Can I send cold emails directly from TrendyyLeads?', a: 'Yes! TrendyyLeads includes a cold email composer with templates, personalization merge fields ({first_name}, {company}), and open tracking — all built into the leads dashboard.' },
  { q: 'How do email sequences work?', a: 'After finding leads, use the Email button on any lead card to open the composer. Choose from Cold Intro, Meeting Request, or Follow-up templates — customize and send in seconds.' },
  { q: 'What happens when I run out of tokens?', a: 'Each lead search costs 1 token. Purchase more via the dashboard — no subscriptions required. Emails sent via the cold email feature do not cost tokens.' },
  { q: 'Can I export my leads?', a: 'Yes — CSV export is available on all plans. Download your full search results including contact details, industry, location, and company size.' },
  { q: 'Is this GDPR compliant for cold outreach?', a: 'B2B cold email is permitted under CAN-SPAM, CASL, and GDPR Article 6(1)(f) for legitimate interest. Our contacts are business professionals at business email addresses.' },
];

// ─── Email demo templates ──────────────────────────────────────────────
const EMAIL_DEMO_TABS = ['Cold Intro', 'Meeting Request', 'Follow-up'];

const EMAIL_DEMO_SUBJECTS = [
  'Quick question for {first_name} at {company}',
  'Meeting request — {first_name} / {company}',
  'Following up — {first_name}',
];
const EMAIL_DEMO_BODIES = [
  `Hi {first_name},

I came across {company} and was impressed by your growth trajectory.

We help sales teams like yours find verified decision-makers 3x faster — saving 10+ hours/week on prospecting.

Would you be open to a 15-min call this week?

Best regards,`,
  `Hi {first_name},

I'd love to schedule a brief call to explore how we might help {company} fill pipeline faster.

Are you available for 20 minutes this week?

Here's my calendar: [link]

Looking forward to connecting!`,
  `Hi {first_name},

Just circling back on my last note. I know {company} keeps you busy.

Quick stat: our users book 2x more meetings in month one.

Worth a 10-minute look?`,
];

// ─── Brand logo ────────────────────────────────────────────────────────
function TrendyyLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: 'var(--brand-primary)' }}>
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
          <path d="M3 14L8 7.5L12 11L17 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="4" r="2" fill="white" opacity="0.9" />
        </svg>
      </div>
      <span className="text-lg font-black tracking-tight text-white">
        TRENDYY <span style={{ color: 'var(--brand-primary)' }}>LEADS</span>
      </span>
    </div>
  );
}

// ─── Static data ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Shield, accent: false,
    title: 'Verified Contact Data',
    desc: 'Real-time verified emails, direct dials, and LinkedIn profiles from Clearbit + Hunter.io.',
    iconBg: 'rgba(13,148,136,0.15)', iconColor: '#0D9488', topGrad: 'rgba(13,148,136,0.5)',
  },
  {
    icon: Filter, accent: false,
    title: 'Advanced Filtering',
    desc: 'Filter by industry, location, company size, and 20+ dimensions. Find exactly who you need.',
    iconBg: 'rgba(37,99,235,0.15)', iconColor: '#2563EB', topGrad: 'rgba(37,99,235,0.5)',
  },
  {
    icon: Mail, accent: true,
    title: 'Cold Email Builder',
    desc: 'Personalized cold emails with merge fields, 3 templates, and open tracking — built in.',
    iconBg: 'rgba(124,58,237,0.15)', iconColor: '#7C3AED', topGrad: 'rgba(124,58,237,0.5)',
  },
  {
    icon: Zap, accent: true,
    title: 'Automated Sequences',
    desc: 'Set up multi-step follow-ups with automated timing. Never let a lead go cold.',
    iconBg: 'rgba(249,115,22,0.15)', iconColor: '#F97316', topGrad: 'rgba(249,115,22,0.5)',
  },
  {
    icon: Activity, accent: false,
    title: 'Open & Click Tracking',
    desc: 'See who opens your emails and clicks your links — in real time.',
    iconBg: 'rgba(16,185,129,0.15)', iconColor: '#10b981', topGrad: 'rgba(16,185,129,0.5)',
  },
];

const EMAIL_PERKS = [
  '3 templates included',
  '{first_name} & {company} merge fields',
  'Open tracking built in',
  'Gmail & Outlook compatible',
  'Automated follow-up sequences',
  'A/B test subject lines',
];

const EMAIL_STATS = [
  { value: '72%', label: 'Open Rate' },
  { value: '34%', label: 'Click Rate' },
  { value: '12%', label: 'Reply Rate' },
];

const EMAIL_SEQUENCE = [
  { when: 'Day 1', title: 'Cold Intro', icon: Mail },
  { when: '+3 days', title: 'Follow-up', icon: RefreshCw },
  { when: '+4 days', title: 'Final Touch', icon: Clock },
];

const HOW_IT_WORKS = [
  {
    step: '01', icon: Filter, title: 'Search',
    desc: 'Enter industry, location, and company size — get instant results from our verified data engine.',
  },
  {
    step: '02', icon: Target, title: 'Qualify',
    desc: 'Filter and refine leads by title, revenue range, and exclude competitors to focus on real buyers.',
  },
  {
    step: '03', icon: Mail, title: 'Email & Convert',
    desc: 'Send personalized cold emails with templates and automated follow-up sequences.',
  },
];

const TESTIMONIALS = [
  {
    initials: 'SC', name: 'Sarah Chen', role: 'VP Sales', avatarColor: '#0D9488',
    quote: 'TrendyyLeads cut our prospecting time by 60%. My team spends their day talking to buyers, not hunting for emails.',
    stars: 5,
  },
  {
    initials: 'MJ', name: 'Marcus Johnson', role: 'SDR Manager', avatarColor: '#7C3AED',
    quote: '98% of emails we pulled actually hit inboxes. Our bounce rate dropped off a cliff the week we switched.',
    stars: 5,
  },
  {
    initials: 'PS', name: 'Priya Sharma', role: 'Head of Sales', avatarColor: '#2563EB',
    quote: 'Booked 7 demos in my first 2 weeks with the email feature. The merge fields make every send feel personal.',
    stars: 5,
  },
  {
    initials: 'TR', name: 'Tom Rivera', role: 'AE, Series B Startup', avatarColor: '#F97316',
    quote: 'I was skeptical but the data quality is genuinely impressive. First week I closed a deal sourced entirely from TrendyyLeads.',
    stars: 5,
  },
  {
    initials: 'AL', name: 'Aisha Lawal', role: 'Growth Lead', avatarColor: '#dc2626',
    quote: 'The local search feature is a hidden gem. Found 40+ untapped businesses in our city that had no web presence at all.',
    stars: 5,
  },
];

const INTEGRATIONS = ['Salesforce', 'HubSpot', 'Pipedrive', 'Outreach', 'Salesloft', 'Apollo'];

const PRODUCT_PREVIEW_NAV = ['Search', 'History', 'Cold Email', 'Billing'];

const PRODUCT_PREVIEW_LEADS = [
  { name: 'Daniel Reyes', email: 'd.reyes@northwind.io', company: 'Northwind Labs', score: 'High' },
  { name: 'Amara Okafor', email: 'amara@brightpath.co', company: 'BrightPath', score: 'High' },
  { name: 'Tom Becker', email: 't.becker@vectorhq.com', company: 'Vector HQ', score: 'Medium' },
  { name: 'Lina Costa', email: 'lina@meridian.app', company: 'Meridian', score: 'Medium' },
  { name: 'Raj Malhotra', email: 'raj@quanta.dev', company: 'Quanta', score: 'High' },
];

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Cold Email', href: '#cold-email' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/privacy#gdpr' },
    ],
  },
];

export default function LandingPage() {
  // ── Interactive UI state ─────────────────────────────────────────────
  const [emailDemoTab, setEmailDemoTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col" style={{ background: '#0d0d0d', color: '#ffffff' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-screen flex items-center" style={{ background: '#0d0d0d' }}>
        {/* Teal radial glow — left and right orbs */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 50% at 18% 5%, rgba(13,148,136,0.22) 0%, transparent 65%), radial-gradient(ellipse 55% 45% at 88% 95%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 75% 15%, rgba(13,148,136,0.06) 0%, transparent 60%)',
          }}
        />
        {/* Dot-grid overlay */}
        <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text & CTAs */}
            <div className="text-left animate-fade-in">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black mb-8 uppercase tracking-widest"
                style={{
                  background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 32%, transparent)',
                  color: 'var(--brand-primary)',
                }}
              >
                <span style={{ fontSize: '13px', lineHeight: 1 }}>✦</span>
                Trusted by 5,000+ sales pros
              </div>

              <h1 className="font-black tracking-tight leading-[1.04] text-white" style={{ fontSize: 'clamp(2.6rem, 5.6vw, 4rem)' }}>
                Find leads that<br />
                actually <RotatingWord />.
              </h1>

              <p className="mt-7 max-w-lg leading-relaxed" style={{ fontSize: '17px', color: '#666' }}>
                TrendyyLeads surfaces verified business contacts — emails, direct dials,
                and LinkedIn profiles — then turns them into booked meetings with a built-in
                cold email engine.
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="btn-shimmer btn-primary-hover gap-2 px-8 font-black border-0 text-base"
                    style={{
                      background: 'var(--brand-primary)',
                      color: '#ffffff',
                      minHeight: '52px',
                      boxShadow: '0 0 32px var(--brand-primary-glow)',
                    }}
                  >
                    Start for Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-white"
                  style={{ color: '#888', minHeight: '52px' }}
                >
                  See how it works
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Micro-guarantees */}
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                {['No credit card required', 'Free first search', 'Cancel anytime'].map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#666' }}>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#0D9488' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 3D dashboard mockup */}
            <div className="relative hidden lg:block animate-fade-in-delay-1" style={{ perspective: '1200px' }}>
              <div
                className="relative rounded-2xl shadow-2xl"
                style={{
                  background: '#111',
                  border: '1px solid rgba(13,148,136,0.35)',
                  transform: 'perspective(1200px) rotateY(-8deg) rotateX(4deg)',
                  boxShadow: '0 0 40px rgba(13,148,136,0.2), 0 30px 80px rgba(0,0,0,0.7)',
                }}
              >
                {/* Mock window header */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', borderRadius: '1rem 1rem 0 0', background: 'rgba(255,255,255,0.02)' }}>
                  <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: '#555' }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
                  <span className="ml-3 text-xs font-medium" style={{ color: '#666' }}>Lead Search Results</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#10b981' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#10b981' }}>Live</span>
                  </div>
                </div>

                {/* Mock filter chips */}
                <div className="flex gap-2 px-5 pt-4">
                  {['SaaS', 'United States', '50–200'].map(chip => (
                    <span
                      key={chip}
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        background: 'rgba(13,148,136,0.15)',
                        color: '#0D9488',
                        border: '1px solid rgba(13,148,136,0.25)',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Mock lead table */}
                <div className="p-5 space-y-2.5">
                  {[
                    { i: 'AK', n: 'Anna Kim', c: 'Lumen Cloud', avatarBg: 'rgba(13,148,136,0.22)', avatarColor: '#0D9488' },
                    { i: 'JD', n: 'James Doyle', c: 'Forge Labs', avatarBg: 'rgba(124,58,237,0.22)', avatarColor: '#7C3AED' },
                    { i: 'MN', n: 'Mei Nakamura', c: 'Pixel Bay', avatarBg: 'rgba(37,99,235,0.22)', avatarColor: '#2563EB' },
                    { i: 'TO', n: 'Tunde Obi', c: 'Stratum HQ', avatarBg: 'rgba(249,115,22,0.22)', avatarColor: '#F97316' },
                  ].map(row => (
                    <div
                      key={row.i}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black shrink-0"
                        style={{ background: row.avatarBg, color: row.avatarColor }}
                      >
                        {row.i}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{row.n}</p>
                        <p className="text-[10px] truncate" style={{ color: '#555' }}>{row.c}</p>
                      </div>
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase shrink-0"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: '#10b981' }} />
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge — new leads */}
              <div
                className="absolute -top-5 -left-6 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-2xl animate-float"
                style={{
                  background: 'rgba(17,17,17,0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(13,148,136,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                  style={{ background: 'rgba(13,148,136,0.2)', border: '1px solid rgba(13,148,136,0.3)' }}
                >
                  <TrendingUp className="h-4 w-4" style={{ color: '#0D9488' }} />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none">12 new leads</p>
                  <p className="text-[10px] mt-1" style={{ color: '#888' }}>found this minute</p>
                </div>
              </div>

              {/* Floating badge — verified */}
              <div
                className="absolute -bottom-6 -right-4 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-2xl animate-float"
                style={{
                  background: 'rgba(17,17,17,0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                  animationDelay: '1.2s',
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                  style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <Shield className="h-4 w-4" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none">98% verified</p>
                  <p className="text-[10px] mt-1" style={{ color: '#888' }}>inbox-safe contacts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section
        className="border-b relative overflow-hidden"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: '#111',
          borderTop: '1px solid transparent',
          backgroundImage: 'linear-gradient(#111, #111), linear-gradient(90deg, transparent 0%, rgba(13,148,136,0.5) 30%, rgba(13,148,136,0.5) 70%, transparent 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(13,148,136,0.6), rgba(13,148,136,0.6), transparent)' }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <AnimatedStat value={10000} suffix="+" label="Leads Generated" />
            <AnimatedStat value={50} suffix="+" label="Countries" />
            <AnimatedStat value={27} suffix="" label="Industries" />
            <AnimatedStat value={98} suffix="%" label="Accuracy" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        />
      </section>

      {/* ── INTEGRATIONS STRIP ─────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-xs font-black uppercase tracking-widest mb-8" style={{ color: '#555' }}>
            Integrates with your existing stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {INTEGRATIONS.map(name => (
              <span
                key={name}
                className="text-lg font-black tracking-tight transition-colors hover:text-white"
                style={{ color: '#444' }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────────── */}
      <section id="features" className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>
              Platform Capabilities
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Built for modern sales teams</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#666' }}>
              Find verified leads, then close them — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Top-border gradient strip */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${f.topGrad}, transparent)`,
                  }}
                />
                <div className="p-6 flex flex-col flex-1">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: f.iconBg,
                      border: `1px solid ${f.iconColor}33`,
                    }}
                  >
                    <f.icon className="h-6 w-6" style={{ color: f.iconColor }} />
                  </div>
                  <h3 className="font-black mb-2 text-white flex items-center gap-2">
                    {f.title}
                    {f.accent && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                        style={{ background: `${f.iconColor}22`, color: f.iconColor }}
                      >
                        New
                      </span>
                    )}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLD EMAIL SECTION ─────────────────────────────────────────────── */}
      <section id="cold-email" className="border-b relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111' }}>
        <div
          className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left — copy */}
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest mb-6"
                style={{
                  background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 32%, transparent)',
                  color: 'var(--brand-primary)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                New in V2
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Send cold emails that actually get replies.
              </h2>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: '#666' }}>
                Stop juggling tools. Go from a verified lead to a personalized,
                tracked cold email in seconds — without leaving TrendyyLeads.
              </p>

              {/* Perks */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EMAIL_PERKS.map(perk => (
                  <div key={perk} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--brand-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: '#bbb' }}>{perk}</span>
                  </div>
                ))}
              </div>

              {/* Stat chips */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {EMAIL_STATS.map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-xl px-3 py-4 text-center"
                    style={{
                      background: '#0d0d0d',
                      border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)',
                    }}
                  >
                    <p className="text-2xl font-black" style={{ color: 'var(--brand-primary)' }}>{stat.value}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#555' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Sequence timeline */}
              <div className="mt-8 flex items-center gap-2">
                {EMAIL_SEQUENCE.map((step, i) => (
                  <div key={step.title} className="flex items-center gap-2 flex-1">
                    <div
                      className="flex-1 rounded-xl px-3 py-3"
                      style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className="h-3.5 w-3.5" style={{ color: 'var(--brand-primary)' }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#555' }}>{step.when}</span>
                      </div>
                      <p className="text-xs font-bold text-white">{step.title}</p>
                    </div>
                    {i < EMAIL_SEQUENCE.length - 1 && (
                      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#444' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — interactive demo composer (dark email client) */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* Email client titlebar */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#111' }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#555' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-3 text-[11px] font-bold" style={{ color: '#555' }}>New Message</span>
              </div>

              {/* Template tabs */}
              <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#0d0d0d' }}>
                {EMAIL_DEMO_TABS.map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEmailDemoTab(i)}
                    className="flex-1 px-3 py-3 text-xs font-bold transition-colors"
                    style={
                      emailDemoTab === i
                        ? {
                            background: 'rgba(13,148,136,0.1)',
                            color: '#0D9488',
                            borderBottom: '2px solid #0D9488',
                          }
                        : { color: '#555', borderBottom: '2px solid transparent' }
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-3">
                {/* From field */}
                <div
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest w-12 shrink-0" style={{ color: '#444' }}>From</span>
                  <span className="text-xs" style={{ color: '#777' }}>you@company.com</span>
                </div>
                {/* To field */}
                <div
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest w-12 shrink-0" style={{ color: '#444' }}>To</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(13,148,136,0.15)', color: '#0D9488', border: '1px solid rgba(13,148,136,0.25)' }}
                  >
                    {'{first_name}'} at {'{company}'}
                  </span>
                </div>
                {/* Subject field */}
                <div
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest w-12 shrink-0" style={{ color: '#444' }}>Subj</span>
                  <span className="text-xs font-medium truncate" style={{ color: '#ccc' }}>
                    {renderMergeHighlight(EMAIL_DEMO_SUBJECTS[emailDemoTab])}
                  </span>
                </div>

                {/* Body field */}
                <div
                  className="rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: '#999',
                    minHeight: '200px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '12px',
                    lineHeight: '1.7',
                  }}
                >
                  {renderMergeHighlight(EMAIL_DEMO_BODIES[emailDemoTab])}
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-5 py-4 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#0d0d0d' }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#555' }}>
                    <Activity className="h-3.5 w-3.5" style={{ color: '#0D9488' }} />
                    <span style={{ color: '#0D9488', fontWeight: 700 }}>Open tracking on</span>
                  </span>
                </div>
                <Button
                  className="gap-2 font-black border-0 btn-primary-hover"
                  style={{ background: '#0D9488', color: '#fff', minHeight: '38px' }}
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-b relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>
              How It Works
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">From search to closed in three steps</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#666' }}>
              No setup fees, no sales calls — just a faster path to your next deal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div
              className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(13,148,136,0.5), rgba(13,148,136,0.5), transparent)' }}
            />

            {/* Step 1 — Search */}
            <div
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="p-7">
                <span
                  className="absolute top-5 right-6 text-6xl font-black select-none"
                  style={{ color: 'rgba(13,148,136,0.07)' }}
                >01</span>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0"
                  style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.28)' }}
                >
                  <Filter className="h-6 w-6" style={{ color: '#0D9488' }} />
                </div>
                <h3 className="text-lg font-black mb-2 text-white">Search</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>Enter industry, location, and company size — get instant results from our verified data engine.</p>
              </div>
              {/* Inline search input mockup */}
              <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: '#0D9488' }} />
                  <span className="text-xs" style={{ color: '#777' }}>SaaS companies in USA...</span>
                  <div className="ml-auto rounded px-2 py-0.5 text-[10px] font-black" style={{ background: '#0D9488', color: '#fff' }}>Search</div>
                </div>
                <div className="border-t px-3 py-2 flex gap-1.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {['SaaS', 'USA', '50–200'].map(tag => (
                    <span key={tag} className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(13,148,136,0.12)', color: '#0D9488' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 — Qualify */}
            <div
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="p-7">
                <span
                  className="absolute top-5 right-6 text-6xl font-black select-none"
                  style={{ color: 'rgba(13,148,136,0.07)' }}
                >02</span>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0"
                  style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.28)' }}
                >
                  <Target className="h-6 w-6" style={{ color: '#0D9488' }} />
                </div>
                <h3 className="text-lg font-black mb-2 text-white">Qualify</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>Filter and refine leads by title, revenue range, and exclude competitors to focus on real buyers.</p>
              </div>
              {/* Inline filtered leads mockup */}
              <div className="mx-5 mb-5 space-y-1.5">
                {[
                  { i: 'DR', name: 'D. Reyes', co: 'Northwind Labs', score: 'High', col: '#10b981' },
                  { i: 'AO', name: 'A. Okafor', co: 'BrightPath', score: 'High', col: '#10b981' },
                  { i: 'TB', name: 'T. Becker', co: 'Vector HQ', score: 'Med', col: '#0D9488' },
                ].map(r => (
                  <div key={r.i} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'rgba(13,148,136,0.15)', color: '#0D9488' }}>{r.i}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate">{r.name}</p>
                      <p className="text-[9px] truncate" style={{ color: '#555' }}>{r.co}</p>
                    </div>
                    <span className="text-[9px] font-black rounded-full px-1.5 py-0.5" style={{ background: `${r.col}1a`, color: r.col }}>{r.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 — Email & Convert */}
            <div
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="p-7">
                <span
                  className="absolute top-5 right-6 text-6xl font-black select-none"
                  style={{ color: 'rgba(13,148,136,0.07)' }}
                >03</span>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0"
                  style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.28)' }}
                >
                  <Mail className="h-6 w-6" style={{ color: '#0D9488' }} />
                </div>
                <h3 className="text-lg font-black mb-2 text-white">Email & Convert</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>Send personalized cold emails with templates and automated follow-up sequences.</p>
              </div>
              {/* Inline email draft mockup */}
              <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#555' }}>To: <span style={{ color: '#0D9488' }}>d.reyes@northwind.io</span></span>
                </div>
                <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#555' }}>Subj: <span style={{ color: '#ccc' }}>Quick question for Daniel...</span></span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[10px] leading-relaxed" style={{ color: '#666' }}>
                    Hi <mark style={{ background: 'rgba(13,148,136,0.2)', color: '#0D9488', borderRadius: '3px', padding: '0 3px', fontStyle: 'normal' }}>Daniel</mark>, I came across <mark style={{ background: 'rgba(13,148,136,0.2)', color: '#0D9488', borderRadius: '3px', padding: '0 3px', fontStyle: 'normal' }}>Northwind Labs</mark>...
                  </p>
                  <div className="mt-2 flex justify-end">
                    <span className="rounded px-2 py-1 text-[9px] font-black" style={{ background: '#0D9488', color: '#fff' }}>Send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>
              Product Tour
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Your pipeline, all in one view</h2>
          </div>

          {/* Browser chrome frame */}
          <div
            className="rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-5xl"
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Browser bar */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#1a1a1a' }}
            >
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#555' }} />
                <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
              </div>
              <div
                className="flex-1 max-w-sm mx-auto rounded-md px-3 py-1 text-center text-xs font-medium"
                style={{ background: '#0d0d0d', color: '#555' }}
              >
                app.trendyyleads.com/dashboard
              </div>
            </div>

            {/* App body */}
            <div className="flex">
              {/* Sidebar */}
              <div
                className="hidden sm:flex flex-col w-48 shrink-0 p-4 gap-1 border-r"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}
              >
                <div className="mb-5">
                  <TrendyyLogo />
                </div>
                {PRODUCT_PREVIEW_NAV.map((item, i) => (
                  <span
                    key={item}
                    className="rounded-lg px-3 py-2 text-xs font-bold"
                    style={
                      i === 0
                        ? { background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', color: 'var(--brand-primary)' }
                        : { color: '#555' }
                    }
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Main area */}
              <div className="flex-1 p-5">
                {/* Filter chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Industry: SaaS', 'Location: USA', 'Size: 50–200', '+ Add filter'].map((chip, i) => (
                    <span
                      key={chip}
                      className="rounded-full px-3 py-1 text-[11px] font-bold"
                      style={
                        i === 3
                          ? { border: '1px dashed rgba(255,255,255,0.15)', color: '#555' }
                          : { background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', color: 'var(--brand-primary)' }
                      }
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Table header */}
                <div
                  className="grid grid-cols-4 gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: '#444' }}
                >
                  <span>Name</span>
                  <span className="hidden sm:block">Email</span>
                  <span>Company</span>
                  <span className="text-right">Score</span>
                </div>

                {/* Lead rows */}
                <div className="space-y-1.5">
                  {PRODUCT_PREVIEW_LEADS.map(lead => (
                    <div
                      key={lead.email}
                      className="grid grid-cols-4 gap-3 items-center rounded-lg px-3 py-2.5"
                      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <span className="text-xs font-bold text-white truncate">{lead.name}</span>
                      <span className="hidden sm:block text-xs truncate" style={{ color: '#666' }}>{lead.email}</span>
                      <span className="text-xs truncate" style={{ color: '#888' }}>{lead.company}</span>
                      <span className="text-right">
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase"
                          style={
                            lead.score === 'High'
                              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                              : { background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)', color: 'var(--brand-primary)' }
                          }
                        >
                          {lead.score}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>
              What Our Users Say
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Loved by sales teams</h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            style={{ gridAutoRows: '1fr' }}
          >
            {TESTIMONIALS.slice(0, 3).map(t => (
              <div
                key={t.name}
                className="flex flex-col p-7 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle avatar-colored top strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${t.avatarColor}00, ${t.avatarColor}80, ${t.avatarColor}00)` }} />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: '#aaa' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black shrink-0"
                    style={{ background: `${t.avatarColor}22`, color: t.avatarColor, border: `1px solid ${t.avatarColor}44` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: t.avatarColor }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second row — 2 more testimonials centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto w-full">
            {TESTIMONIALS.slice(3).map(t => (
              <div
                key={t.name}
                className="flex flex-col p-7 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${t.avatarColor}00, ${t.avatarColor}80, ${t.avatarColor}00)` }} />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: '#aaa' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black shrink-0"
                    style={{ background: `${t.avatarColor}22`, color: t.avatarColor, border: `1px solid ${t.avatarColor}44` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: t.avatarColor }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-b relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111' }}>
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-72 blur-3xl rounded-full"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">Simple, honest pricing</h2>
          <p className="text-lg mb-16 max-w-xl mx-auto" style={{ color: '#666' }}>
            Buy only what you need. No monthly lock-ins, no hidden fees. Each token = one targeted lead search.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto items-center">
            {[
              { name: 'Starter', tokens: 10, desc: 'Try it out', popular: false },
              { name: 'Growth', tokens: 50, desc: 'For growing teams', popular: true },
              { name: 'Pro', tokens: 150, desc: 'Agencies & power users', popular: false },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={
                  t.popular
                    ? {
                        background: 'linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(13,148,136,0.04) 100%)',
                        border: '1.5px solid rgba(13,148,136,0.45)',
                        boxShadow: '0 0 40px rgba(13,148,136,0.18), 0 20px 60px rgba(0,0,0,0.4)',
                        transform: 'scale(1.05)',
                        zIndex: 1,
                      }
                    : {
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }
                }
              >
                {t.popular && (
                  <>
                    {/* Gradient top bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #0D9488, transparent)' }} />
                    <div
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest mb-3"
                      style={{ background: 'rgba(13,148,136,0.2)', color: '#0D9488', border: '1px solid rgba(13,148,136,0.35)' }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </div>
                  </>
                )}
                {!t.popular && <div className="mb-3 h-7" />}
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: t.popular ? '#0D9488' : '#555' }}>{t.name}</p>
                <p className="text-4xl font-black text-white mb-1">{t.tokens}<span className="text-sm ml-1 font-medium" style={{ color: '#555' }}>searches</span></p>
                <p className="text-xs mt-2" style={{ color: '#666' }}>{t.desc}</p>
                {t.popular && (
                  <Link href="/register">
                    <Button
                      className="mt-5 w-full font-black border-0 btn-shimmer btn-primary-hover"
                      style={{ background: '#0D9488', color: '#fff', minHeight: '44px' }}
                    >
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm" style={{ color: '#555' }}>
            Payments coming soon.{' '}
            <Link href="/pricing" className="font-bold hover:underline" style={{ color: 'var(--brand-primary)' }}>
              View full pricing details →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-primary)' }}>
              FAQ
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Questions, answered</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={faq.q}
                className="rounded-xl overflow-hidden"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                >
                  <span className="font-bold text-white pr-4">{faq.q}</span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 transition-transform duration-300"
                    style={{
                      color: 'var(--brand-primary)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? '200px' : '0px' }}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: '#777' }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      <section
        className="border-b relative overflow-hidden"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 20%, #0d0d0d) 0%, #0d0d0d 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-70" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Ready to close more deals?</h2>
          <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: '#888' }}>
            Join 5,000+ sales professionals filling their pipelines with TrendyyLeads.
            Start free — no card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="btn-shimmer btn-primary-hover gap-2 px-10 font-black border-0 text-base"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  minHeight: '56px',
                  boxShadow: '0 0 40px var(--brand-primary-glow)',
                }}
              >
                Start for Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                size="lg"
                variant="ghost"
                className="font-semibold gap-2"
                style={{ color: '#ccc', minHeight: '56px', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0d0d0d' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <TrendyyLogo />
              <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: '#555' }}>
                Verified business contacts for modern sales teams.
              </p>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map(col => (
              <div key={col.heading}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: '#444' }}>
                  {col.heading}
                </h3>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium transition-colors hover:text-white"
                        style={{ color: '#555' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-xs font-medium" style={{ color: '#333' }}>
              &copy; {new Date().getFullYear()} TrendyyLeads. All rights reserved.
            </p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
