/* eslint-disable @next/next/no-page-custom-font -- Google Sans Flex is not available via next/font/google. */
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: {
    default: "Pryzmira — Curated AI Tools, Courses & Resources",
    template: "%s | Pryzmira",
  },
  description: "Stop drowning in choice. 64 hand-picked AI tools, 130+ tech courses, and curated resources — filtered by a CS student for CS students.",
  keywords: ["AI tools", "tech courses", "learning resources", "AI directory", "student", "computer science", "programming"],
  authors: [{ name: "Diwakar Ray Yadav" }],
  creator: "Diwakar Ray Yadav",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pryzmira.vercel.app",
    siteName: "Pryzmira",
    title: "Pryzmira — Curated AI Tools, Courses & Resources",
    description: "Stop drowning in choice. 64 hand-picked AI tools, 130+ tech courses, and curated resources for students.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pryzmira — Curated AI Tools & Courses",
    description: "64 hand-picked AI tools, 130+ courses, curated by a student for students.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Sans Flex is not exposed via next/font, so this project loads it explicitly. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
