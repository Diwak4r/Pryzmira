import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { JetBrains_Mono, Manrope, Sora } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import PostHogTelemetry from '@/components/PostHogTelemetry';
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
        default: 'Pryzmira | Personal Writing Voice AI',
        template: '%s | Pryzmira',
    },
    description:
        'Paste one real writing sample, describe what you need written, and get a result that sounds like you — not like AI.',
    keywords: [
        'AI writing voice',
        'personal writing AI',
        'voice AI',
        'write like me',
        'AI writing assistant',
        'voice profile AI',
        'code-switching AI',
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
        title: 'Pryzmira | Personal Writing Voice AI',
        description:
            'Write anything — exactly like you. Paste a sample, get output in your voice.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pryzmira | Personal Writing Voice AI',
        description:
            'Paste one real writing sample, describe what you need, and get a result that sounds like you.',
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
                    <Suspense fallback={null}>
                        <PostHogTelemetry />
                    </Suspense>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
                <RuntimeTelemetry />
            </body>
        </html>
    );
}
