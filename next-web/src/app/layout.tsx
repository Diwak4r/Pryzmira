import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope, Sora } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { Providers } from '@/components/Providers';
import RuntimeTelemetry from '@/components/RuntimeTelemetry';

const displayFont = Sora({
    subsets: ['latin'],
    variable: '--font-heading',
    weight: ['400', '500', '600', '700'],
});

const bodyFont = Manrope({
    subsets: ['latin'],
    variable: '--font-body',
    weight: ['400', '500', '600', '700', '800'],
});

const monoFont = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono-ui',
    weight: ['500', '600'],
});

export const metadata: Metadata = {
    title: {
        default: 'Pryzmira | AI operating desk',
        template: '%s | Pryzmira',
    },
    description:
        'Pryzmira is an AI operating desk that turns one goal into a weekly focus, working sessions, and an active support stack.',
    keywords: [
        'AI workspace',
        'AI operating desk',
        'AI weekly brief',
        'AI workflow',
        'AI builder workspace',
        'AI strategy workspace',
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
        title: 'Pryzmira | AI operating desk',
        description:
            'One AI goal, one weekly operating brief, and one workspace that keeps the support material in reach.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pryzmira | AI operating desk',
        description:
            'Run AI work from one desk, keep the week active, and open supporting material only when it helps execution.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#eef3f4' },
        { media: '(prefers-color-scheme: dark)', color: '#0d1214' },
    ],
    width: 'device-width',
    initialScale: 1,
};

const themeInitScript = `
  try {
    var savedTheme = localStorage.getItem('theme');
    var theme = savedTheme === 'light' ? 'light' : 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  } catch (error) {
    document.documentElement.classList.add('dark');
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
            className={`dark ${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
            suppressHydrationWarning
        >
            <body suppressHydrationWarning>
                <Script id="theme-init" strategy="beforeInteractive">
                    {themeInitScript}
                </Script>
                <Providers>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
                <RuntimeTelemetry />
            </body>
        </html>
    );
}
