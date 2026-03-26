import type { Metadata } from 'next';
import { Quantico, Share_Tech, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

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

export const metadata: Metadata = {
  title: 'TrendyyLeads — Find Leads That Convert',
  description: 'Discover high-quality business leads with detailed contact info. Powered by TrendyyLeads.',
  // FORCING THE FAVICON HERE
  icons: {
    icon: '/android-chrome-192x192.png',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png', // You can swap this for a 180x180 png later
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
      className={`${quantico.variable} ${shareTech.variable} ${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || !('theme' in localStorage)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#0d0d0d] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}