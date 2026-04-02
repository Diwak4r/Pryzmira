import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { Providers } from '@/components/Providers';

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
    title: 'Pryzmira',
    description:
        'Personal Writing Voice AI. Paste a writing sample, describe what you need, get output that sounds like you.',
};

export const viewport: Viewport = {
    themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }],
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${bodyFont.variable} ${monoFont.variable}`}>
            <body>
                <Providers>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
            </body>
        </html>
    );
}
