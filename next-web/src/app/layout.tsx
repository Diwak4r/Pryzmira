import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
// Self-hosted variable fonts: no build-time or runtime dependency on Google
// Fonts, so the app builds and runs offline and in restricted networks.
import '@fontsource-variable/manrope';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
    title: 'Pryzmira',
    description:
        'Personal Writing Voice AI. Paste a writing sample, describe what you need, get output that sounds like you.',
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#fafafa' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body>
                <Script src="/theme-init.js" strategy="beforeInteractive" />
                <Providers>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
            </body>
        </html>
    );
}
