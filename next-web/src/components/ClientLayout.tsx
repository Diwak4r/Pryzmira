'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp, Dot } from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import Navbar from '@/components/Navbar';

const footerPrimaryLinks = [
    { label: 'Home', href: '/' },
    { label: 'Desk', href: '/desk' },
];

const shellEase = [0.22, 1, 0.36, 1] as const;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shouldReduceMotion = useReducedMotion();
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        let frame = 0;

        const updateBackToTop = () => {
            frame = 0;
            const nextVisible = window.scrollY > 520;
            setShowBackToTop((current) => (current === nextVisible ? current : nextVisible));
        };

        const handleScroll = () => {
            if (frame) {
                return;
            }

            frame = window.requestAnimationFrame(updateBackToTop);
        };

        updateBackToTop();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (frame) {
                window.cancelAnimationFrame(frame);
            }

            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleProgress = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const nextProgress = maxScroll <= 0 ? 0 : Math.min(window.scrollY / maxScroll, 1);
            setScrollProgress(nextProgress);
        };

        handleProgress();
        window.addEventListener('scroll', handleProgress, { passive: true });
        window.addEventListener('resize', handleProgress);

        return () => {
            window.removeEventListener('scroll', handleProgress);
            window.removeEventListener('resize', handleProgress);
        };
    }, []);

    return (
        <div className="site-shell relative min-h-screen bg-background text-foreground">
            <div
                className="shell-progress"
                style={{ transform: `scaleX(${Math.max(scrollProgress, 0.02)})` }}
            />
            <Navbar />

            <main className="relative z-10 pt-24 md:pt-28">
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={pathname}
                        initial={false}
                        animate={{ opacity: 1, y: 0, filter: 'none' }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0.98, y: -4, filter: 'none' }}
                        transition={
                            shouldReduceMotion
                                ? { duration: 0 }
                                : { duration: 0.38, ease: shellEase }
                        }
                        className="route-shell relative z-10"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <footer className="relative border-t border-border/80 py-12 md:py-14">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="page-shell">
                    <div className="shell-surface rounded-[1.75rem] p-6 md:p-8">
                        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                                <BrandMark />
                                <div className="space-y-3">
                                    <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-[2.4rem]">
                                        Personal Writing Voice AI.
                                    </h2>
                                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-[0.95rem]">
                                        Paste one real writing sample, describe what you need, and get a
                                        result that sounds like you — not like AI.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <p className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Navigate
                                </p>
                                {footerPrimaryLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block font-medium text-foreground/88 hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border/70 pt-5">
                            <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                <p>&copy; {new Date().getFullYear()} Pryzmira. All rights reserved.</p>
                                <div className="flex items-center gap-2">
                                    <span>Write anything — exactly like you</span>
                                    <Dot className="h-4 w-4" />
                                    <span>Your voice, not a template</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {showBackToTop ? (
                    <motion.button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.92 }}
                        transition={
                            shouldReduceMotion
                                ? { duration: 0 }
                                : { duration: 0.22, ease: shellEase }
                        }
                        className="shell-surface fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-foreground shadow-[0_18px_42px_hsl(var(--foreground)/0.16)] hover:-translate-y-0.5"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </motion.button>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
