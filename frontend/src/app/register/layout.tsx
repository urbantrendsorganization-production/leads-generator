import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for TrendyyLeads and start discovering high-quality business leads in seconds.',
  alternates: { canonical: '/register' },
  openGraph: {
    title: 'Create Account | TrendyyLeads',
    description: 'Sign up for TrendyyLeads and start discovering high-quality business leads in seconds.',
    url: 'https://trendyyleads.com/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
