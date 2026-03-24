import type { Metadata, Viewport } from 'next';
import { Manrope, Newsreader } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { Providers } from '@/components/Providers';

const displayFont = Newsreader({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-plex-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Pryzmira | Your weekly AI edge workspace',
    template: '%s | Pryzmira',
  },
  description:
    'Pryzmira turns AI anxiety into a weekly action plan: a sharper stack, a working brief, and a clearer next move for builders who do not want to fall behind.',
  keywords: [
    'AI workspace',
    'AI strategy brief',
    'AI learning plan',
    'AI tool stack',
    'builder workflow',
    'AI operator',
    'weekly AI brief',
  ],
  authors: [{ name: 'Diwakar Ray Yadav' }],
  creator: 'Diwakar Ray Yadav',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/android-chrome-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pryzmira.diwakaryadav.com.np',
    siteName: 'Pryzmira',
    title: 'Pryzmira | Your weekly AI edge workspace',
    description:
      'A strategy-first AI workspace that turns changing tools and trends into one weekly plan you can actually act on.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pryzmira | Your weekly AI edge workspace',
    description:
      'Stay ahead of AI change with a weekly brief, a sharper stack, and a workspace built for momentum.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4efe5' },
    { media: '(prefers-color-scheme: dark)', color: '#181410' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `
  try {
    var savedTheme = localStorage.getItem('theme');
    var theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  } catch (error) {
    document.documentElement.classList.add('light');
  }
`;

const enableVercelTelemetry =
  process.env.NODE_ENV === 'production' && process.env.VERCEL === '1';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
        {enableVercelTelemetry ? <Analytics /> : null}
        {enableVercelTelemetry ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
