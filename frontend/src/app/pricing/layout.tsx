import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for every stage. Buy search tokens and start finding high-quality leads today.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | TrendyyLeads',
    description: 'Simple, transparent pricing for every stage. Buy search tokens and start finding high-quality leads today.',
    url: 'https://trendyyleads.com/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
