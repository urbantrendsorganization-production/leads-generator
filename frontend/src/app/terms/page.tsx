import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions that govern your use of the TrendyyLeads B2B leads search and outreach platform.',
  alternates: { canonical: '/terms' },
};

const LAST_UPDATED = 'May 22, 2026';

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
        <p className="text-sm" style={{ color: '#666666' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 leading-relaxed" style={{ color: '#aaaaaa' }}>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
            TrendyyLeads website, application, and related services (collectively, the
            &ldquo;Service&rdquo;), operated by TrendyyLeads (&ldquo;TrendyyLeads&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). Please read them
            carefully.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">1. Acceptance of Terms</h2>
          <p style={{ color: '#888888' }}>
            By creating an account, purchasing tokens, or otherwise using the Service, you agree
            to be bound by these Terms and by our{' '}
            <Link href="/privacy" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Privacy Policy
            </Link>
            . If you are using the Service on behalf of an organisation, you represent that you
            have authority to bind that organisation. If you do not agree to these Terms, you
            must not use the Service.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">2. Eligibility and Accounts</h2>
          <p style={{ color: '#888888' }}>
            You must be at least 18 years old and capable of forming a binding contract to use
            the Service. You are responsible for keeping your account credentials confidential
            and for all activity that occurs under your account. Notify us promptly of any
            unauthorised use. The Service is intended for legitimate business-to-business use.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">3. Use of the Service</h2>
          <p style={{ color: '#888888' }}>
            TrendyyLeads provides tools to search for business contact data and to send outreach
            emails. The data we return is compiled from third-party and public sources and is
            provided on an &ldquo;as is&rdquo; basis. You are solely responsible for how you use
            any leads, including for verifying data accuracy and for ensuring that your outreach
            complies with all applicable laws &mdash; including the GDPR, CAN-SPAM, CASL, and
            other anti-spam and data protection regulations in the jurisdictions you operate in.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">4. Tokens, Payments, and Refunds</h2>
          <p style={{ color: '#888888' }}>
            The Service operates on a token model. Each lead search consumes one token. Tokens
            are purchased through our payment provider, Paystack, in the amounts shown at
            checkout. Prices are listed in USD, and your local currency equivalent may be shown
            at checkout.
          </p>
          <p className="mt-4">
            <strong className="text-white">
              Tokens are non-refundable once they have been used.
            </strong>{' '}
            Because a search consumes a token immediately and returns results, a used token
            cannot be reversed. If you have unused tokens and are dissatisfied, you may contact
            our team within 7 days of purchase to request a refund of the unused balance, at our
            reasonable discretion. We may correct billing errors and reverse fraudulent or
            disputed charges.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">5. Prohibited Uses</h2>
          <p>You agree not to, and not to permit others to:</p>
          <ul className="mt-3 space-y-2 list-disc pl-5" style={{ color: '#888888' }}>
            <li>Use the Service for unlawful, harassing, deceptive, or fraudulent purposes.</li>
            <li>
              Send spam, malware, or unsolicited communications that violate anti-spam laws.
            </li>
            <li>
              Resell, sublicense, or redistribute leads or Service data without our written
              permission.
            </li>
            <li>
              Scrape, crawl, reverse engineer, or attempt to extract our underlying data sets or
              source code.
            </li>
            <li>
              Circumvent token limits, security controls, rate limits, or authentication
              mechanisms.
            </li>
            <li>
              Use the Service to build a competing product or to harm the integrity or
              performance of our systems.
            </li>
            <li>Share your account credentials or allow unauthorised access to your account.</li>
          </ul>
          <p className="mt-4" style={{ color: '#888888' }}>
            We may suspend or terminate accounts that violate these Terms, without refund of
            used tokens.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">6. Intellectual Property</h2>
          <p style={{ color: '#888888' }}>
            The Service, including its software, design, branding, and compiled data sets, is
            owned by TrendyyLeads and protected by intellectual property laws. We grant you a
            limited, non-exclusive, non-transferable, revocable licence to use the Service for
            your internal business purposes in accordance with these Terms. All rights not
            expressly granted are reserved. You retain ownership of the content you create, such
            as your email drafts, and grant us a limited licence to process it to deliver the
            Service.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">7. Disclaimer of Warranties</h2>
          <p style={{ color: '#888888' }}>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, whether express or implied. We do not warrant that lead data
            is complete, accurate, or up to date, or that the Service will be uninterrupted or
            error-free. You use the Service and any data it provides at your own risk.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">8. Limitation of Liability</h2>
          <p style={{ color: '#888888' }}>
            To the maximum extent permitted by law, TrendyyLeads and its officers, employees, and
            partners will not be liable for any indirect, incidental, special, consequential, or
            punitive damages, or for any loss of profits, revenue, data, or goodwill arising from
            your use of the Service. Our total aggregate liability for any claim relating to the
            Service will not exceed the amount you paid to us in the three (3) months preceding
            the event giving rise to the claim. Nothing in these Terms excludes liability that
            cannot lawfully be excluded.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">9. Indemnification</h2>
          <p style={{ color: '#888888' }}>
            You agree to indemnify and hold harmless TrendyyLeads from any claims, damages, or
            expenses arising out of your use of the Service, your outreach activity, or your
            breach of these Terms or applicable law.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">10. Termination</h2>
          <p style={{ color: '#888888' }}>
            You may stop using the Service and close your account at any time. We may suspend or
            terminate your access if you breach these Terms or if required by law. Provisions
            that by their nature should survive termination &mdash; including intellectual
            property, disclaimers, and limitation of liability &mdash; will survive.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">11. Governing Law</h2>
          <p style={{ color: '#888888' }}>
            These Terms are governed by the laws of the Republic of Kenya, without regard to its
            conflict of law principles. Any dispute arising from these Terms or the Service will
            be subject to the exclusive jurisdiction of the courts of Kenya, unless a mandatory
            consumer protection law in your country of residence provides otherwise.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">12. Changes to These Terms</h2>
          <p style={{ color: '#888888' }}>
            We may update these Terms from time to time. When we make material changes, we will
            update the &ldquo;Last updated&rdquo; date above and, where appropriate, notify you.
            Continued use of the Service after changes take effect constitutes acceptance of the
            revised Terms.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">13. Contact Us</h2>
          <p style={{ color: '#888888' }}>
            Questions about these Terms can be sent to our legal team at{' '}
            <a
              href="mailto:legal@trendyyleads.com"
              className="font-semibold"
              style={{ color: 'var(--brand-primary)' }}
            >
              legal@trendyyleads.com
            </a>
            .
          </p>

          <div
            className="mt-12 pt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Link href="/privacy" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Privacy Policy
            </Link>
            <Link href="/cookies" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Cookie Policy
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
