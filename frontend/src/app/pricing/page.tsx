import Link from 'next/link';
import { CheckCircle2, ArrowRight, Zap, Shield, Globe, Mail } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    tokens: 10,
    description: 'Perfect for trying out the platform',
    features: ['10 lead searches', 'Verified contact info', 'CSV export'],
    popular: false,
  },
  {
    name: 'Growth',
    tokens: 50,
    description: 'For growing businesses',
    features: ['50 lead searches', 'Verified contact info', 'CSV export', 'Priority results'],
    popular: true,
  },
  {
    name: 'Pro',
    tokens: 150,
    description: 'For power users and agencies',
    features: ['150 lead searches', 'Verified contact info', 'CSV export', 'Priority results', 'Advanced filters', 'Search history'],
    popular: false,
  },
];

const FAQS = [
  {
    q: 'What is a token?',
    a: 'One token = one lead search. Each search returns up to 10–20 verified business contacts with full contact details.',
  },
  {
    q: 'Do tokens expire?',
    a: 'No. Tokens never expire. Use them at your own pace — no pressure, no deadlines.',
  },
  {
    q: 'How do I get started?',
    a: 'Create a free account and contact our team. We\'ll get you set up with credits to start finding leads.',
  },
  {
    q: 'Do you offer team plans?',
    a: 'Yes — we offer custom plans for agencies and teams. Reach out for a tailored quote.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#ffffff' }}>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-widest"
            style={{
              background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
              color: 'var(--brand-primary)',
            }}
          >
            <Zap className="h-3 w-3" />
            Pricing
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight">
            Simple,{' '}
            <span style={{ color: 'var(--brand-primary)' }}>honest</span>{' '}
            pricing
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#888' }}>
            Pay only for what you search. No subscriptions, no hidden fees. Tokens never expire.
          </p>
          <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>
            Payments coming soon — contact us to get early access credits.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl"
              style={
                plan.popular
                  ? {
                      background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
                      border: '1.5px solid color-mix(in srgb, var(--brand-primary) 40%, transparent)',
                      transform: 'scale(1.03)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }
              }
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest shadow-lg"
                    style={{ background: 'var(--brand-primary)', color: '#fff' }}
                  >
                    Most Popular
                  </span>
                </div>
              )}
              <div className="px-7 pt-9 pb-4 text-center">
                <p className="text-xs font-black uppercase tracking-widest mb-3"
                  style={{ color: plan.popular ? 'var(--brand-primary)' : '#555' }}
                >
                  {plan.name}
                </p>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-black text-white">{plan.tokens}</span>
                  <span className="text-lg mb-1.5" style={{ color: '#555' }}>searches</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{plan.description}</p>
              </div>
              <div className="mx-7 mb-5" style={{ height: '1px', background: plan.popular ? 'color-mix(in srgb, var(--brand-primary) 30%, transparent)' : 'rgba(255,255,255,0.06)' }} />
              <div className="flex-1 px-7 pb-2 space-y-3">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-primary)' }} />
                    <span style={{ color: '#aaa' }}>{f}</span>
                  </div>
                ))}
              </div>
              <div className="px-7 pb-7 pt-6">
                <Link
                  href="mailto:support@trendyyleads.com"
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-black transition-all duration-200"
                  style={
                    plan.popular
                      ? { background: 'var(--brand-primary)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  <Mail className="h-4 w-4" />
                  Get Access
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Volume note */}
        <div className="text-center mt-12">
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl px-8 py-5"
            style={{
              background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)',
            }}
          >
            <div className="text-sm" style={{ color: '#888' }}>
              Need volume or a custom plan for your agency?
            </div>
            <a
              href="mailto:support@trendyyleads.com"
              className="text-sm font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ color: 'var(--brand-primary)' }}
            >
              Contact us <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: Shield, title: 'No subscriptions', body: 'Pay once, use forever. Tokens never expire.' },
            { icon: Zap, title: 'Instant results', body: 'Leads generated in seconds, ready to export.' },
            { icon: Globe, title: 'Global coverage', body: '65+ cities and growing across Africa and beyond.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="flex justify-center mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
                </div>
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-sm" style={{ color: '#666' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#111' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center text-white mb-10">Frequently asked</h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="font-bold text-white mb-2 text-sm">{q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to find your next client?</h2>
        <p className="text-sm mb-8" style={{ color: '#666' }}>Create a free account and start exploring.</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-black text-white text-sm transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--brand-primary)' }}
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

    </div>
  );
}
