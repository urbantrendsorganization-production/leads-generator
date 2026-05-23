import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How TrendyyLeads collects, uses, and protects your personal data, and the rights available to you under the GDPR.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = 'May 22, 2026';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
        <p className="text-sm" style={{ color: '#666666' }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-8 leading-relaxed" style={{ color: '#aaaaaa' }}>
          <p>
            TrendyyLeads (&ldquo;TrendyyLeads&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) provides a B2B leads search and outreach platform. This Privacy
            Policy explains what personal data we collect, why we collect it, how we use and
            share it, and the rights you have over it. It applies to our website, application,
            and related services (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p className="mt-4">
            We act as a data controller for the account and billing data described below. By
            creating an account or using the Service, you acknowledge the practices described
            in this policy.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">1. Data We Collect</h2>
          <p>We collect the following categories of personal data:</p>
          <h3 className="text-base font-bold text-white mb-2 mt-5">Account information</h3>
          <p style={{ color: '#888888' }}>
            Your name and email address, a hashed password, and (where you choose Google
            sign-in) your Google account identifier and profile email. We never store your
            password in plain text.
          </p>
          <h3 className="text-base font-bold text-white mb-2 mt-5">Payment information</h3>
          <p style={{ color: '#888888' }}>
            When you purchase tokens, payment is processed by our payment provider, Paystack.
            We receive a transaction reference, amount, currency, and status. We do not store
            your full card number, CVV, or bank credentials &mdash; these are handled directly
            by Paystack.
          </p>
          <h3 className="text-base font-bold text-white mb-2 mt-5">Search queries and usage data</h3>
          <p style={{ color: '#888888' }}>
            We store the search queries you run (such as industry, location, and company size),
            the results returned, your token balance and history, and basic technical data such
            as IP address, browser type, and timestamps for security and abuse prevention.
          </p>
          <h3 className="text-base font-bold text-white mb-2 mt-5">Communications</h3>
          <p style={{ color: '#888888' }}>
            If you contact our support team, we keep a record of that correspondence so we can
            respond and improve our Service.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">2. How We Use Your Data</h2>
          <p>We process your personal data for the following purposes:</p>
          <ul className="mt-3 space-y-2 list-disc pl-5" style={{ color: '#888888' }}>
            <li>To create and administer your account and authenticate you.</li>
            <li>To deliver the core Service &mdash; running searches and returning leads.</li>
            <li>To process token purchases and maintain accurate billing records.</li>
            <li>To provide customer support and respond to your enquiries.</li>
            <li>To detect, prevent, and investigate fraud, abuse, and security incidents.</li>
            <li>To comply with our legal, accounting, and tax obligations.</li>
            <li>To send essential service notices about your account or changes to terms.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">3. Legal Bases for Processing</h2>
          <p style={{ color: '#888888' }}>
            Under the EU and UK General Data Protection Regulation (GDPR), we rely on the
            following legal bases: <strong className="text-white">performance of a contract</strong>{' '}
            to provide the Service you sign up for; <strong className="text-white">legitimate
            interests</strong> to secure our platform, prevent abuse, and improve our product;{' '}
            <strong className="text-white">legal obligation</strong> for tax and accounting
            records; and <strong className="text-white">consent</strong> where required, such as
            for non-essential cookies, which you may withdraw at any time.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">4. Cookies and Similar Technologies</h2>
          <p style={{ color: '#888888' }}>
            We use strictly necessary cookies to keep you signed in (a JWT authentication
            cookie) and to protect against cross-site request forgery (a CSRF token). These
            cookies are essential for the Service to function and cannot be disabled. We do not
            currently use third-party advertising or analytics cookies. For full details, see
            our{' '}
            <Link href="/cookies" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Cookie Policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">5. Third-Party Services</h2>
          <p>We share data with the following processors, only as needed to run the Service:</p>
          <ul className="mt-3 space-y-2 list-disc pl-5" style={{ color: '#888888' }}>
            <li>
              <strong className="text-white">Paystack</strong> &mdash; payment processing for
              token purchases. Paystack receives the data necessary to complete your
              transaction.
            </li>
            <li>
              <strong className="text-white">Resend</strong> &mdash; transactional and outreach
              email delivery. Resend processes the recipient address and message content for
              emails sent through the Service.
            </li>
            <li>
              <strong className="text-white">Google</strong> &mdash; if you choose Google
              sign-in, Google authenticates you and shares your basic profile with us.
            </li>
            <li>
              <strong className="text-white">Hosting and infrastructure providers</strong> who
              store data on our behalf under appropriate data processing agreements.
            </li>
          </ul>
          <p className="mt-4" style={{ color: '#888888' }}>
            We do not sell your personal data. Where data is transferred outside the EEA or UK,
            we rely on appropriate safeguards such as Standard Contractual Clauses.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">6. Data Retention</h2>
          <p style={{ color: '#888888' }}>
            We retain account and search data for as long as your account is active. After you
            close your account, we delete or anonymise personal data within 90 days, except
            where we are required to retain billing and tax records for longer under applicable
            law (typically up to 7 years).
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">7. Data Security</h2>
          <p style={{ color: '#888888' }}>
            We protect your data with encryption in transit (HTTPS), hashed passwords, access
            controls, and CSRF protection on state-changing requests. No system is perfectly
            secure, but we work to safeguard your information and will notify you and the
            relevant authorities of a breach where legally required.
          </p>

          <h2 id="gdpr" className="text-xl font-bold text-white mb-3 mt-8 scroll-mt-24">
            8. Your Rights Under the GDPR
          </h2>
          <p>
            If you are in the EEA or UK, you have the following rights regarding your personal
            data:
          </p>
          <ul className="mt-3 space-y-2 list-disc pl-5" style={{ color: '#888888' }}>
            <li>
              <strong className="text-white">Right of access</strong> &mdash; request a copy of
              the personal data we hold about you.
            </li>
            <li>
              <strong className="text-white">Right to rectification</strong> &mdash; correct
              inaccurate or incomplete data.
            </li>
            <li>
              <strong className="text-white">Right to erasure</strong> &mdash; request deletion
              of your data (&ldquo;the right to be forgotten&rdquo;).
            </li>
            <li>
              <strong className="text-white">Right to data portability</strong> &mdash; receive
              your data in a structured, machine-readable format.
            </li>
            <li>
              <strong className="text-white">Right to restrict or object</strong> &mdash; limit
              or object to certain processing, including processing based on legitimate
              interests.
            </li>
            <li>
              <strong className="text-white">Right to withdraw consent</strong> &mdash; where
              processing is based on consent, withdraw it at any time.
            </li>
            <li>
              <strong className="text-white">Right to lodge a complaint</strong> &mdash; with
              your local data protection supervisory authority.
            </li>
          </ul>
          <p className="mt-4" style={{ color: '#888888' }}>
            To exercise any of these rights, email us at the address below. We will respond
            within one month, as required by the GDPR.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">9. Children&rsquo;s Privacy</h2>
          <p style={{ color: '#888888' }}>
            The Service is intended for business use and is not directed at individuals under
            18. We do not knowingly collect personal data from children.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">10. Changes to This Policy</h2>
          <p style={{ color: '#888888' }}>
            We may update this Privacy Policy from time to time. When we make material changes,
            we will update the &ldquo;Last updated&rdquo; date above and, where appropriate,
            notify you by email.
          </p>

          <h2 className="text-xl font-bold text-white mb-3 mt-8">11. Contact Us</h2>
          <p style={{ color: '#888888' }}>
            For any privacy questions or to exercise your data rights, contact our Data
            Protection team at{' '}
            <a
              href="mailto:privacy@trendyyleads.com"
              className="font-semibold"
              style={{ color: 'var(--brand-primary)' }}
            >
              privacy@trendyyleads.com
            </a>
            .
          </p>

          <div
            className="mt-12 pt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Link href="/terms" className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
              Terms of Service
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
