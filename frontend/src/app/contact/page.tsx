import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Clock, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the TrendyyLeads support team. We respond to every message within 24 hours.',
  alternates: { canonical: '/contact' },
};

const SUPPORT_EMAIL = 'support@trendyyleads.com';

export default function ContactPage() {
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
          Support
        </p>
        <h1 className="text-4xl font-black text-white mb-4">Get in touch</h1>
        <p className="text-lg leading-relaxed max-w-xl" style={{ color: '#aaaaaa' }}>
          Have a question about leads, billing, or your account? Our support team is here to
          help. Send us an email and we&rsquo;ll get back to you quickly.
        </p>

        {/* Contact card */}
        <div
          className="mt-10 rounded-2xl p-8"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
              }}
            >
              <Mail className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Email support</h2>
              <p className="text-sm" style={{ color: '#888888' }}>
                Reach our team directly at the address below.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-block mt-2 text-base font-bold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          <div
            className="flex items-start gap-4 mt-6 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
              }}
            >
              <Clock className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Response time</h2>
              <p className="text-sm" style={{ color: '#888888' }}>
                We respond to every message{' '}
                <strong className="text-white">within 24 hours</strong>, Monday to Friday.
                Most enquiries are answered much sooner.
              </p>
            </div>
          </div>

          {/* Mailto button */}
          <div className="mt-8">
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <button
                className="btn-shimmer btn-primary-hover inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-base border-0"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  boxShadow: '0 0 32px var(--brand-primary-glow)',
                }}
              >
                <MessageSquare className="h-5 w-5" />
                Email Us
              </button>
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm" style={{ color: '#888888' }}>
          Looking for billing or volume questions? You can also review our{' '}
          <Link href="/pricing" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
            pricing
          </Link>{' '}
          or read more{' '}
          <Link href="/about" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
            about TrendyyLeads
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
