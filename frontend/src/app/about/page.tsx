import type { Metadata } from 'next';
import Link from 'next/link';
import { Target, Zap, LayoutGrid, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'TrendyyLeads helps sales teams find verified business leads fast, so they can spend their time closing deals instead of hunting for contacts.',
  alternates: { canonical: '/about' },
};

const VALUE_PROPS = [
  {
    icon: Target,
    title: 'Accuracy',
    desc: 'Every contact is verified in real time against trusted sources, so your emails reach real decision-makers and your bounce rate stays low.',
  },
  {
    icon: Zap,
    title: 'Speed',
    desc: 'Go from an industry and location to a list of qualified leads in seconds. No exports, no waiting, no manual research.',
  },
  {
    icon: LayoutGrid,
    title: 'Simplicity',
    desc: 'Search, qualify, and email from one clean dashboard. Pay only for what you use with tokens that never expire.',
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen" style={{ background: '#0d0d0d', color: '#ffffff' }}>
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-80 opacity-[0.07] blur-[100px] rounded-full"
        style={{ background: 'var(--brand-primary)' }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <p
          className="text-sm font-black uppercase tracking-widest mb-3"
          style={{ color: 'var(--brand-primary)' }}
        >
          About TrendyyLeads
        </p>
        <h1 className="text-4xl font-black text-white mb-4">
          We help sales teams find leads worth chasing.
        </h1>

        {/* Mission statement */}
        <div className="mt-6 leading-relaxed" style={{ color: '#aaaaaa' }}>
          <p className="text-lg">
            Our mission is simple: give sales teams a faster, more honest path to their next
            deal. Prospecting should not mean hours lost to stale spreadsheets and bounced
            emails. TrendyyLeads surfaces verified business contacts &mdash; emails, direct
            dials, and company details &mdash; and turns them into booked meetings with a
            built-in outreach engine.
          </p>
          <p className="mt-4 text-lg">
            We built TrendyyLeads because we believe sales reps should spend their day talking
            to buyers, not hunting for them. Every feature we ship is measured against one
            question: does this help you close more deals, faster?
          </p>
        </div>

        {/* Value props */}
        <h2 className="text-xl font-bold text-white mb-3 mt-12">What we stand for</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {VALUE_PROPS.map((prop) => (
            <div
              key={prop.title}
              className="flex flex-col p-6 rounded-2xl"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 shrink-0"
                style={{
                  background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
                }}
              >
                <prop.icon className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="font-black mb-2 text-white">{prop.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
                {prop.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-14 rounded-2xl px-8 py-10 text-center"
          style={{
            background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)',
          }}
        >
          <h2 className="text-2xl font-black text-white mb-3">Ready to build your pipeline?</h2>
          <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: '#888888' }}>
            Join thousands of sales professionals who find verified leads with TrendyyLeads.
            Start free &mdash; no credit card required.
          </p>
          <Link href="/register">
            <button
              className="btn-shimmer btn-primary-hover inline-flex items-center gap-2 px-10 py-3.5 rounded-xl font-black text-base border-0"
              style={{
                background: 'var(--brand-primary)',
                color: '#ffffff',
                boxShadow: '0 0 32px var(--brand-primary-glow)',
              }}
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
