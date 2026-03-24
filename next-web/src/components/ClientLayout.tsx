'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp, Dot } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getRouteMeta, normalizeRoute, siteNavigation } from '@/lib/siteNavigation';

const Newsletter = dynamic(() => import('@/components/Newsletter'), { ssr: false });

const footerLinks = [
    { label: 'Home', href: '/' },
    { label: 'Workspace', href: '/desk' },
    { label: 'Atlas', href: '/categories' },
    { label: 'Tools', href: '/ai-tools' },
    { label: 'Library', href: '/resources' },
    { label: 'Roadmap', href: '/roadmap' },
];

const shellEase = [0.22, 1, 0.36, 1] as const;

function getContextLinks(currentPath: string) {
    switch (currentPath) {
        case '/':
            return ['/desk', '/categories', '/ai-tools'];
        case '/desk':
            return ['/categories', '/ai-tools', '/resources'];
        case '/categories':
        case '/course/[id]':
            return ['/desk', '/ai-tools', '/roadmap'];
        case '/ai-tools':
            return ['/desk', '/categories', '/resources'];
        case '/resources':
            return ['/desk', '/categories', '/roadmap'];
        case '/roadmap':
            return ['/desk', '/categories', '/canvas'];
        default:
            return ['/desk', '/categories', '/ai-tools'];
    }
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shouldReduceMotion = useReducedMotion();
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const currentPath = useMemo(() => normalizeRoute(pathname), [pathname]);
    const routeMeta = useMemo(() => getRouteMeta(pathname), [pathname]);

    useEffect(() => {
        let frame = 0;

        const updateBackToTop = () => {
            frame = 0;
            const nextVisible = window.scrollY > 520;
            setShowBackToTop((current) =>
                current === nextVisible ? current : nextVisible
            );
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

    const siblingLinks = useMemo(
        () => {
            const nextHrefs = getContextLinks(currentPath);
            return nextHrefs
                .map((href) => siteNavigation.find((item) => item.href === href))
                .filter((item): item is (typeof siteNavigation)[number] => Boolean(item));
        },
        [currentPath]
    );

    const showNewsletter =
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/canvas') &&
        routeMeta.showNewsletter !== false;

    return (
        <div className="site-shell relative min-h-screen bg-background text-foreground">
            <div
                className="shell-progress"
                style={{ transform: `scaleX(${Math.max(scrollProgress, 0.02)})` }}
            />
            <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[26rem] overflow-hidden">
                <div className="ambient-orb ambient-orb-primary absolute left-[8%] top-[-3rem] h-48 w-48 opacity-90 md:h-72 md:w-72" />
                <div className="ambient-orb ambient-orb-secondary absolute right-[6%] top-20 h-56 w-56 opacity-80 md:h-80 md:w-80" />
            </div>

            <Navbar />

            <main className="relative z-10 pt-24 md:pt-28">
                <AnimatePresence initial={false} mode="wait">
                    {routeMeta.showContextStrip !== false ? (
                        <motion.div
                            key={`path-${pathname}`}
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                            transition={
                                shouldReduceMotion
                                    ? { duration: 0 }
                                    : { duration: 0.24, ease: shellEase }
                            }
                            className="page-shell mb-5 md:mb-7"
                        > 
                            <div className="context-strip route-shell rounded-[1.8rem] px-5 py-5 md:px-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="route-pill">{routeMeta.label}</span>
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                {routeMeta.eyebrow}
                                            </p>
                                        </div>
                                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                            {routeMeta.summary}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {siblingLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className="rounded-full border border-border bg-background/72 px-4 py-2.5 text-sm transition-colors hover:border-primary/25 hover:bg-background"
                                            >
                                                <span className="font-medium text-foreground">{link.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={pathname}
                        initial={false}
                        animate={{
                            opacity: 1,
                            y: 0,
                            filter: 'none',
                        }}
                        exit={
                            shouldReduceMotion
                                ? undefined
                                : { opacity: 0.98, y: -4, filter: 'none' }
                        }
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

            {showNewsletter && <Newsletter />}

            <footer className="relative border-t border-border/80 py-12 md:py-14">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="page-shell">
                    <div className="shell-surface rounded-[1.75rem] p-6 md:p-8">
                        <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
                            <div className="space-y-4">
                                <span className="brand-chip">
                                    <span className="brand-chip-dot" />
                                    Pryzmira
                                </span>
                                <div className="space-y-3">
                                    <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-[2.4rem]">
                                        A weekly AI edge system that tells you what matters now.
                                    </h2>
                                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-[0.95rem]">
                                        Pryzmira combines guidance, tools, and learning depth so users
                                        keep returning to a workspace that helps them stay current
                                        without drowning in noise.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-8 text-sm md:grid-cols-2">
                                <div className="space-y-3">
                                    <p className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Explore
                                    </p>
                                    {footerLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="block font-medium text-foreground/88 hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <p className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Product
                                    </p>
                                    <p className="leading-6 text-muted-foreground">
                                        Weekly clarity first. Supporting surfaces second. The workspace
                                        is the product, not the chrome around it.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-border/70 pt-5">
                            <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                <p>&copy; {new Date().getFullYear()} Pryzmira. All rights reserved.</p>
                                <div className="flex items-center gap-2">
                                    <span>Built for repeat use</span>
                                    <Dot className="h-4 w-4" />
                                    <span>Designed for momentum</span>
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
