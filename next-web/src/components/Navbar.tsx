'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun } from 'lucide-react';
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
    { label: 'Home', href: '/' },
    { label: 'Workspace', href: '/desk' },
    { label: 'Atlas', href: '/categories' },
    { label: 'Tools', href: '/ai-tools' },
    { label: 'Library', href: '/resources' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Studio', href: '/canvas' },
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
            const nextCompressed = window.scrollY > 18;
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
              initial: { opacity: 0, rotate: 14, scale: 0.82 },
              animate: { opacity: 1, rotate: 0, scale: 1 },
              exit: { opacity: 0, rotate: -14, scale: 0.82 },
          };

    return (
        <motion.header
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.34, ease: shellEase }
            }
            className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4"
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
                    shouldReduceMotion ? { duration: 0 } : { duration: 0.26, ease: shellEase }
                }
                className={`shell-surface mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-[1.3rem] px-3 py-2.5 md:px-4 ${
                    isCompressed
                        ? 'shadow-[0_18px_42px_hsl(var(--foreground)/0.10)]'
                        : 'shadow-[0_14px_32px_hsl(var(--foreground)/0.06)]'
                }`}
            >
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-[0.95rem] border border-border/80 bg-background/90">
                        <Image
                            src="/logo.png"
                            alt="Pryzmira"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-[-0.03em] text-foreground">
                            Pryzmira
                        </p>
                        <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {routeMeta.shortLabel}
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-background/76 p-1 lg:flex">
                    {navItems.map((item) => {
                        const isActive =
                            currentPath === item.href ||
                            (item.href === '/categories' && currentPath === '/course/[id]');

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
                                    className={`relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${
                                        isActive
                                            ? 'text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {item.href === '/desk' && savedCount > 0 && (
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
                                                isActive
                                                    ? 'bg-primary-foreground/14 text-primary-foreground'
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

                <div className="hidden items-center gap-2 md:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full border border-border/70 bg-background/72 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle theme"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            {theme === 'dark' ? (
                                <motion.span
                                    key="sun"
                                    {...iconMotionProps}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                >
                                    <Sun className="h-4 w-4" />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="moon"
                                    {...iconMotionProps}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                >
                                    <Moon className="h-4 w-4" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>

                <div className="flex items-center gap-2 md:hidden">
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
                            className="w-[320px] border-l border-border/80 bg-background/96 px-0 sm:w-[360px]"
                        >
                            <motion.div
                                initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={
                                    shouldReduceMotion
                                        ? { duration: 0 }
                                        : { duration: 0.24, ease: shellEase }
                                }
                                className="flex h-full flex-col px-6 pb-8 pt-10"
                            >
                                <div className="mb-8 space-y-2">
                                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                        Pryzmira
                                    </p>
                                    <p className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                                        {routeMeta.title}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {navItems.map((item, index) => {
                                        const isActive =
                                            currentPath === item.href ||
                                            (item.href === '/categories' &&
                                                currentPath === '/course/[id]');

                                        return (
                                            <motion.div
                                                key={item.href}
                                                initial={
                                                    shouldReduceMotion ? false : { opacity: 0, y: 12 }
                                                }
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={
                                                    shouldReduceMotion
                                                        ? { duration: 0 }
                                                        : {
                                                              duration: 0.2,
                                                              delay: index * 0.03,
                                                              ease: shellEase,
                                                          }
                                                }
                                            >
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMenuOpen(false)}
                                                    className={`flex items-center justify-between rounded-[1.1rem] border px-4 py-3.5 text-base font-medium ${
                                                        isActive
                                                            ? 'border-primary/20 bg-primary text-primary-foreground'
                                                            : 'border-border/70 bg-background/72 text-foreground'
                                                    }`}
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <span>{item.label}</span>
                                                        {item.href === '/desk' && savedCount > 0 ? (
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
                                                                    isActive
                                                                        ? 'bg-primary-foreground/14 text-primary-foreground'
                                                                        : 'bg-primary/10 text-primary'
                                                                }`}
                                                            >
                                                                {savedCount}
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <p className="mt-auto pt-8 text-sm leading-6 text-muted-foreground">
                                    {routeMeta.summary}
                                </p>
                            </motion.div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.div>
        </motion.header>
    );
}
