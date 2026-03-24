'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroAction {
    href: string;
    label: string;
    variant?: 'default' | 'outline';
}

interface HeroStat {
    value: ReactNode;
    label: string;
    note?: string;
}

interface HeroHighlight {
    label: string;
    title: string;
}

interface PageHeroProps {
    chip: string;
    kicker: string;
    title: string;
    description: string;
    actions?: HeroAction[];
    stats?: HeroStat[];
    asideKicker: string;
    asideTitle: string;
    asideBody: string;
    highlights?: HeroHighlight[];
    footnote?: string;
}

export default function PageHero({
    chip,
    kicker,
    title,
    description,
    actions = [],
    stats = [],
    asideKicker,
    asideTitle,
    asideBody,
    highlights = [],
    footnote,
}: PageHeroProps) {
    return (
        <section className="page-shell">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    <span className="brand-chip">
                        <span className="brand-chip-dot" />
                        {chip}
                    </span>
                    <div className="space-y-4">
                        <p className="section-kicker">{kicker}</p>
                        <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                            {title}
                        </h1>
                        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {actions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                            {actions.map((action) => (
                                <Button
                                    key={`${action.href}-${action.label}`}
                                    asChild
                                    variant={action.variant ?? 'default'}
                                    className="rounded-full px-6 py-6 text-sm font-semibold"
                                >
                                    <Link href={action.href} className="editorial-link">
                                        {action.label}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}

                    {stats.length > 0 && (
                        <div className="grid gap-4 pt-4 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <div
                                    key={`${stat.label}-${stat.value}`}
                                    className="space-y-2 border-t border-border pt-4"
                                >
                                    <p className="text-3xl font-semibold tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    {stat.note && (
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                                            {stat.note}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                <motion.aside
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8"
                >
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <p className="section-kicker">{asideKicker}</p>
                            <h2 className="text-4xl text-display text-balance">
                                {asideTitle}
                            </h2>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">{asideBody}</p>

                        {highlights.length > 0 && (
                            <div className="space-y-4">
                                {highlights.map((highlight, index) => (
                                    <div
                                        key={`${highlight.label}-${highlight.title}`}
                                        className="flex items-start justify-between gap-4 border-t border-border/70 pt-4"
                                    >
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                                {highlight.label || `Point ${String(index + 1).padStart(2, '0')}`}
                                            </p>
                                            <p className="mt-1 text-xl font-semibold text-foreground">
                                                {highlight.title}
                                            </p>
                                        </div>
                                        <span className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {footnote && (
                            <div className="rounded-[1.6rem] border border-border bg-background/70 p-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Editorial note
                                </p>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {footnote}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.aside>
            </div>
        </section>
    );
}
