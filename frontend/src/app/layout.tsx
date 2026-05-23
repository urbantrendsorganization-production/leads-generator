import type { Metadata } from 'next';
import { Quantico, Share_Tech, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { CookieConsent } from '@/components/CookieConsent';
import { GoogleAuthWrapper } from '@/components/GoogleAuthWrapper';

// Heading Font
const quantico = Quantico({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-quantico'
});

// Data/Mono Font
const shareTech = Share_Tech({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-share-tech'
});

// Standard Body Font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

// Primary Body Font (v2)
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'TrendyyLeads — Find Leads That Convert',
    template: '%s | TrendyyLeads',
  },
  description: 'Discover high-quality business leads with detailed contact info. Search by industry, location, and company size. Powered by TrendyyLeads.',
  metadataBase: new URL('https://trendyyleads.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'TrendyyLeads',
    title: 'TrendyyLeads — Find Leads That Convert',
    description: 'Discover high-quality business leads with detailed contact info. Search by industry, location, and company size.',
    url: 'https://trendyyleads.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendyyLeads — Find Leads That Convert',
    description: 'Discover high-quality business leads with detailed contact info.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/android-chrome-192x192.png',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quantico.variable} ${shareTech.variable} ${inter.variable} ${plusJakarta.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0d0d0d] text-white">
        <GoogleAuthWrapper>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <ThemeCustomizer />
            <CookieConsent />
          </ThemeProvider>
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}