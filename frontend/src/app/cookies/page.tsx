import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How TrendyyLeads uses cookies and similar technologies, including essential authentication and security cookies.',
  alternates: { canonical: '/cookies' },
};

const LAST_UPDATED = 'May 22, 2026';

export default function CookiePolicyPage() {
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
          Legal
        </p>
        <h1 className="text-4xl font-black text-white mb-4">Cookie Policy</h1>
        <p className="text-sm" style={{ color: '#666666' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 leading-relaxed" style={{ color: '#aaaaaa' }}>
          <p>
            This Cookie Policy explains how TrendyyLeads (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) uses cookies and similar technologies when you use our website and
            application (the &ldquo;Service&rdquo;). It should be read together with our{' '}
            <Link href="/privacy" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Privacy Policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">1. What Are Cookies?</h2>
          <p style={{ color: '#888888' }}>
            Cookies are small text files stored on your device by your browser. They allow a
            website to remember information between requests &mdash; for example, that you are
            signed in. We also use related browser storage, such as <code>localStorage</code>,
            to hold your session token and security tokens needed for the Service to work.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">2. Essential Cookies</h2>
          <p style={{ color: '#888888' }}>
            These cookies are strictly necessary for the Service to function and cannot be
            switched off. They do not track you for advertising purposes.
          </p>
          <ul className="mt-3 space-y-2 list-disc pl-5" style={{ color: '#888888' }}>
            <li>
              <strong className="text-white">Authentication (JWT)</strong> &mdash; an HttpOnly
              cookie named <code>auth_token</code> keeps you securely signed in as you move
              between pages. Without it you would have to log in on every request.
            </li>
            <li>
              <strong className="text-white">CSRF protection</strong> &mdash; a{' '}
              <code>csrf_token</code> is used in a double-submit pattern to verify that
              state-changing requests genuinely originate from you, protecting your account
              against cross-site request forgery.
            </li>
            <li>
              <strong className="text-white">Cookie consent</strong> &mdash; we store your
              consent choice so we do not show the consent banner on every visit.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">3. Analytics Cookies</h2>
          <p style={{ color: '#888888' }}>
            We do not currently use any third-party analytics or advertising cookies. We do not
            track your browsing across other websites. If we introduce analytics in the future,
            we will update this policy and request your consent where required.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">4. Third-Party Cookies</h2>
          <p style={{ color: '#888888' }}>
            If you choose to sign in with Google, Google may set its own cookies as part of the
            OAuth authentication flow. These cookies are controlled by Google and are governed
            by{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
              style={{ color: 'var(--brand-primary)' }}
            >
              Google&rsquo;s Privacy Policy
            </a>
            . We do not control or have access to the contents of Google&rsquo;s cookies.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">5. Managing Cookies</h2>
          <p style={{ color: '#888888' }}>
            Because the cookies we use are essential, disabling them in your browser will
            prevent you from signing in and using core features of the Service. You can clear
            cookies and browser storage at any time through your browser settings; doing so will
            sign you out. Most browsers also let you block cookies, though this will break the
            Service.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">6. Changes to This Policy</h2>
          <p style={{ color: '#888888' }}>
            We may update this Cookie Policy as our Service evolves. Material changes will be
            reflected in the &ldquo;Last updated&rdquo; date above.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">7. Contact Us</h2>
          <p style={{ color: '#888888' }}>
            If you have questions about our use of cookies, email us at{' '}
            <a
              href="mailto:privacy@trendyyleads.com"
              className="font-semibold"
              style={{ color: 'var(--brand-primary)' }}
            >
              privacy@trendyyleads.com
            </a>
            . For more on how we handle personal data, see our{' '}
            <Link href="/privacy" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Privacy Policy
            </Link>
            .
          </p>

          <div
            className="mt-12 pt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Link href="/privacy" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Terms of Service
            </Link>
            <Link href="/contact" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
