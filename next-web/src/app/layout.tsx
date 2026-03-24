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
    default: 'Pryzmira | Curated AI tools, courses, and field notes',
    template: '%s | Pryzmira',
  },
  description:
    'Pryzmira is a curated atlas for ambitious builders: standout AI tools, serious courses, practical resources, and a cleaner path through modern tech.',
  keywords: [
    'AI tools',
    'tech courses',
    'learning resources',
    'developer roadmap',
    'computer science',
    'engineering students',
    'curated tech learning',
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
    title: 'Pryzmira | Curated AI tools, courses, and field notes',
    description:
      'A distinctive learning hub for builders who want signal over noise across AI, systems, design, and engineering.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pryzmira | Curated AI tools, courses, and field notes',
    description:
      'Signal-first discovery for builders: curated AI tools, sharp learning paths, and field-tested resources.',
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
