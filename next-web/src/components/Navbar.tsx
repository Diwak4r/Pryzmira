'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
    getSavedCourses,
    getSavedResources,
    getSavedTools,
    subscribeToPersonalDataUpdates,
} from '@/lib/personalDesk';
import { getRouteMeta, normalizeRoute } from '@/lib/siteNavigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
    { label: 'Atlas', href: '/categories' },
    { label: 'Desk', href: '/desk' },
    { label: 'Tools', href: '/ai-tools' },
    { label: 'Resources', href: '/resources' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Canvas', href: '/canvas' },
];

const shellEase = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isCompressed, setIsCompressed] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const currentPath = useMemo(() => normalizeRoute(pathname), [pathname]);
    const routeMeta = useMemo(() => getRouteMeta(pathname), [pathname]);

    useEffect(() => {
        let frame = 0;

        const updateCompression = () => {
            frame = 0;
            const nextCompressed = window.scrollY > 24;
            setIsCompressed((current) =>
                current === nextCompressed ? current : nextCompressed
            );
        };

        const handleScroll = () => {
            if (frame) {
                return;
            }

            frame = window.requestAnimationFrame(updateCompression);
        };

        updateCompression();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (frame) {
                window.cancelAnimationFrame(frame);
            }

            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const syncSavedCount = () => {
            setSavedCount(
                getSavedCourses().length +
                    getSavedTools().length +
                    getSavedResources().length
            );
        };

        syncSavedCount();
        return subscribeToPersonalDataUpdates(syncSavedCount);
    }, []);

    const iconMotionProps = shouldReduceMotion
        ? {}
        : {
              initial: { opacity: 0, rotate: 16, scale: 0.82 },
              animate: { opacity: 1, rotate: 0, scale: 1 },
              exit: { opacity: 0, rotate: -16, scale: 0.82 },
          };

    return (
        <motion.header
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.42, ease: shellEase }
            }
            className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
        >
            <motion.div
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                              y: isCompressed ? 0 : 2,
                              scale: isCompressed ? 1 : 0.995,
                          }
                }
                transition={
                    shouldReduceMotion ? { duration: 0 } : { duration: 0.32, ease: shellEase }
                }
                className={`shell-surface mx-auto flex w-full max-w-6xl items-center justify-between rounded-[1.4rem] px-4 py-3 md:px-5 ${
                    isCompressed
                        ? 'border-border/80 shadow-[0_20px_56px_hsl(var(--foreground)/0.12)]'
                        : 'border-border/60 shadow-[0_16px_40px_hsl(var(--foreground)/0.06)]'
                }`}
            >
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,hsl(var(--primary)/0.08),transparent_26%,transparent_74%,hsl(var(--brand-olive)/0.08))]" />

                <Link href="/" className="group relative z-10 flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-[1rem] border border-border/80 bg-background/90 shadow-[inset_0_1px_0_hsl(var(--background)/0.9)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <Image
                            src="/logo.png"
                            alt="Pryzmira"
                            fill
                            priority
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                    </div>
                    <div className="min-w-0 leading-none">
                        <p className="truncate text-[0.66rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/90">
                            {routeMeta.eyebrow}
                        </p>
                        <p className="truncate text-base font-semibold tracking-[-0.03em] text-foreground md:text-lg">
                            Pryzmira
                        </p>
                    </div>
                </Link>

                <div className="hidden min-w-0 xl:block">
                    <div className="border-l border-border/70 pl-3">
                        <p className="text-sm font-semibold text-foreground">{routeMeta.label}</p>
                        <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                            {routeMeta.focus}
                        </p>
                    </div>
                </div>

                <nav className="relative z-10 hidden items-center gap-1 rounded-full border border-border/70 bg-background/72 p-1 md:flex">
                    {navItems.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            (item.href === '/categories' && currentPath === '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className="relative block"
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-active-pill"
                                        className="nav-active-pill absolute inset-0 rounded-full"
                                        transition={
                                            shouldReduceMotion
                                                ? { duration: 0 }
                                                : {
                                                      type: 'spring',
                                                      stiffness: 420,
                                                      damping: 34,
                                                      mass: 0.72,
                                                  }
                                        }
                                    />
                                )}
                                <span
                                    className={`relative z-10 inline-flex items-center gap-2 nav-chip ${
                                        isActive
                                            ? 'text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {item.href === '/desk' && savedCount > 0 && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                                                isActive
                                                    ? 'bg-primary-foreground/16 text-primary-foreground'
                                                    : 'bg-primary/10 text-primary'
                                            }`}
                                        >
                                            {savedCount}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="relative z-10 hidden items-center gap-2 md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="group relative overflow-hidden rounded-full border border-border/70 bg-background/72 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle theme"
                    >
                        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_72%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        <AnimatePresence initial={false} mode="wait">
                            {theme === 'dark' ? (
                                <motion.span
                                    key="sun"
                                    {...iconMotionProps}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="relative z-10"
                                >
                                    <Sun className="h-4 w-4" />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="moon"
                                    {...iconMotionProps}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="relative z-10"
                                >
                                    <Moon className="h-4 w-4" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                    <Button
                        asChild
                        className="rounded-full border border-primary/20 bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_hsl(var(--primary)/0.24)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_hsl(var(--primary)/0.28)]"
                    >
                        <Link href="/categories" className="editorial-link">
                            Open atlas
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="relative z-10 md:hidden">
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full border border-border/70 bg-background/72 text-muted-foreground hover:text-foreground"
                                aria-label="Open navigation"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[320px] border-l border-border/80 bg-background/92 px-0 sm:w-[360px]"
                        >
                            <motion.div
                                initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={
                                    shouldReduceMotion
                                        ? { duration: 0 }
                                        : { duration: 0.28, ease: shellEase }
                                }
                                className="relative flex h-full flex-col overflow-hidden"
                            >
                                <div className="ambient-orb ambient-orb-primary absolute -left-12 top-6 h-36 w-36 opacity-80" />
                                <div className="ambient-orb ambient-orb-secondary absolute bottom-12 right-[-2rem] h-40 w-40 opacity-70" />

                                <div className="relative flex h-full flex-col px-6 pb-8 pt-10">
                                    <div className="mb-8 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[0.66rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                                {routeMeta.eyebrow}
                                            </p>
                                            <p className="truncate pt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
                                                {routeMeta.label}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleTheme}
                                            className="rounded-full border border-border/70 bg-background/72 text-muted-foreground hover:text-foreground"
                                            aria-label="Toggle theme"
                                        >
                                            {theme === 'dark' ? (
                                                <Sun className="h-4 w-4" />
                                            ) : (
                                                <Moon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="ink-rule" />
                                    </div>

                                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                        {routeMeta.summary}
                                    </p>

                                    <div className="mt-6 space-y-2">
                                        {navItems.map((item, index) => {
                                            const isActive =
                                                currentPath === item.href ||
                                                (item.href === '/categories' && currentPath === '/');

                                            return (
                                                <motion.div
                                                    key={item.href}
                                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={
                                                        shouldReduceMotion
                                                            ? { duration: 0 }
                                                            : {
                                                                  duration: 0.22,
                                                                  delay: index * 0.035,
                                                                  ease: shellEase,
                                                              }
                                                    }
                                                >
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setMenuOpen(false)}
                                                        className={`group flex items-center justify-between rounded-[1.15rem] border px-4 py-3.5 text-base font-medium ${
                                                            isActive
                                                                ? 'border-primary/20 bg-primary text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.18)]'
                                                                : 'paper-soft border-border/70 text-foreground hover:border-border/90 hover:bg-background/90'
                                                        }`}
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <span>{item.label}</span>
                                                            {item.href === '/desk' && savedCount > 0 && (
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                                                                        isActive
                                                                            ? 'bg-primary-foreground/16 text-primary-foreground'
                                                                            : 'bg-primary/10 text-primary'
                                                                    }`}
                                                                >
                                                                    {savedCount}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-auto space-y-3 pt-8">
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {routeMeta.focus}
                                        </p>
                                        <Button
                                            asChild
                                            className="w-full rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-[0_12px_30px_hsl(var(--primary)/0.22)]"
                                        >
                                            <Link href="/categories" onClick={() => setMenuOpen(false)}>
                                                Open atlas
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.div>
        </motion.header>
    );
}
