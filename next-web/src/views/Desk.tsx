'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookmarkCheck,
    BookOpen,
    Clock3,
    Compass,
    ExternalLink,
    Lock,
    Sparkles,
} from 'lucide-react';
import coursesData from '@/data/courses.json';
import { Button } from '@/components/ui/button';
import { RecentCourse, RecentTool, getRecentCourses, getRecentTools } from '@/lib/recentlyViewed';
import {
    SavedCourse,
    SavedResource,
    SavedTool,
    getSavedCourses,
    getSavedResources,
    getSavedTools,
    removeSavedCourse,
    removeSavedResource,
    removeSavedTool,
    subscribeToPersonalDataUpdates,
} from '@/lib/personalDesk';

interface DeskSnapshot {
    savedCourses: SavedCourse[];
    savedTools: SavedTool[];
    savedResources: SavedResource[];
    recentCourses: RecentCourse[];
    recentTools: RecentTool[];
    vaultUnlocked: boolean;
}

function readDeskSnapshot(): DeskSnapshot {
    return {
        savedCourses: getSavedCourses(),
        savedTools: getSavedTools(),
        savedResources: getSavedResources(),
        recentCourses: getRecentCourses(),
        recentTools: getRecentTools(),
        vaultUnlocked:
            typeof window !== 'undefined' &&
            window.localStorage.getItem('vault_unlocked') === 'true',
    };
}

export default function Desk() {
    const [snapshot, setSnapshot] = useState<DeskSnapshot>({
        savedCourses: [],
        savedTools: [],
        savedResources: [],
        recentCourses: [],
        recentTools: [],
        vaultUnlocked: false,
    });

    useEffect(() => {
        const syncSnapshot = () => {
            setSnapshot(readDeskSnapshot());
        };

        syncSnapshot();
        return subscribeToPersonalDataUpdates(syncSnapshot);
    }, []);

    const totalSaved =
        snapshot.savedCourses.length +
        snapshot.savedTools.length +
        snapshot.savedResources.length;
    const totalRecent = snapshot.recentCourses.length + snapshot.recentTools.length;

    const recommendedCourses = useMemo(() => {
        const preferredCategories = Array.from(
            new Set(
                [...snapshot.savedCourses, ...snapshot.recentCourses]
                    .map((entry) => entry.category)
                    .filter(Boolean)
            )
        );
        const savedIds = new Set(snapshot.savedCourses.map((course) => course.id));

        return coursesData
            .filter(
                (course) =>
                    !savedIds.has(course.id) &&
                    preferredCategories.some((category) => category === course.category)
            )
            .slice(0, 3);
    }, [snapshot.recentCourses, snapshot.savedCourses]);

    const isEmpty = totalSaved === 0 && totalRecent === 0;

    return (
        <div className="space-y-16 pb-16">
            <section className="page-shell grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    <span className="brand-chip">
                        <span className="brand-chip-dot" />
                        Personal desk
                    </span>
                    <div className="space-y-4">
                        <p className="section-kicker">Return to what matters</p>
                        <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                            Your saved learning desk for the things worth reopening.
                        </h1>
                        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                            Save the courses, tools, and references that actually matter, then pick
                            up where you stopped without rebuilding context every time.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild className="rounded-full px-6 py-6 text-sm font-semibold">
                            <Link href="/categories" className="editorial-link">
                                Add more to the desk
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full px-6 py-6 text-sm font-semibold"
                        >
                            <Link href="/roadmap">Open roadmap</Link>
                        </Button>
                    </div>
                </motion.div>

                <motion.aside
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <StatTile
                            label="Saved items"
                            value={String(totalSaved)}
                            detail="Courses, tools, and references in your desk."
                        />
                        <StatTile
                            label="Recent opens"
                            value={String(totalRecent)}
                            detail="Things you looked at most recently."
                        />
                        <StatTile
                            label="Vault status"
                            value={snapshot.vaultUnlocked ? 'Open' : 'Locked'}
                            detail="Resources archive access for returning sessions."
                        />
                        <StatTile
                            label="Best next move"
                            value={snapshot.savedCourses.length > 0 ? 'Resume' : 'Explore'}
                            detail="Use the desk when you want continuity instead of rediscovery."
                        />
                    </div>
                </motion.aside>
            </section>

            {isEmpty ? (
                <section className="page-shell">
                    <div className="paper-panel rounded-[2rem] px-6 py-12 text-center md:px-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <BookmarkCheck className="h-7 w-7" />
                        </div>
                        <h2 className="mt-6 text-4xl text-display">Your desk is empty</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                            Start saving the good stuff. Bookmark standout courses, tools, and
                            resources so Pryzmira becomes a working desk instead of a page you visit
                            once.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button asChild className="rounded-full px-6">
                                <Link href="/categories">Browse courses</Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <Link href="/ai-tools">Browse tools</Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <Link href="/resources">Open resources</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    {snapshot.savedCourses.length > 0 && (
                        <section className="page-shell space-y-5">
                            <SectionHeading
                                kicker="Saved courses"
                                title="Courses worth returning to"
                                detail="Keep a shortlist of material you actually plan to finish."
                            />
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {snapshot.savedCourses.map((course) => (
                                    <div key={course.id} className="paper-soft rounded-[1.5rem] p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                                    {course.category}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold text-foreground">
                                                    {course.title}
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {course.instructor}
                                                </p>
                                            </div>
                                            <RemoveButton onClick={() => removeSavedCourse(course.id)} />
                                        </div>
                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                Saved course
                                            </span>
                                            <Link
                                                href={`/course/${course.id}`}
                                                className="editorial-link text-sm text-foreground"
                                            >
                                                Open
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {snapshot.savedTools.length > 0 && (
                        <section className="page-shell space-y-5">
                            <SectionHeading
                                kicker="Saved tools"
                                title="Tools you chose to keep close"
                                detail="Use the desk as a deliberate shortlist instead of another tab graveyard."
                            />
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {snapshot.savedTools.map((tool) => (
                                    <div key={tool.id} className="paper-soft rounded-[1.5rem] p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                                    {tool.category}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold text-foreground">
                                                    {tool.name}
                                                </p>
                                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                    {tool.description}
                                                </p>
                                            </div>
                                            <RemoveButton onClick={() => removeSavedTool(tool.id)} />
                                        </div>
                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                {tool.pricing}
                                            </span>
                                            <a
                                                href={tool.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="editorial-link text-sm text-foreground"
                                            >
                                                Visit
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {snapshot.savedResources.length > 0 && (
                        <section className="page-shell space-y-5">
                            <SectionHeading
                                kicker="Saved resources"
                                title="References that deserve a place on the desk"
                                detail="Keep the good channels, guides, and references one click away."
                            />
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {snapshot.savedResources.map((resource) => (
                                    <div key={resource.id} className="paper-soft rounded-[1.5rem] p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                                    {resource.type}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold text-foreground">
                                                    {resource.title}
                                                </p>
                                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                    {resource.description}
                                                </p>
                                            </div>
                                            <RemoveButton onClick={() => removeSavedResource(resource.id)} />
                                        </div>
                                        <div className="mt-5 flex items-center justify-between gap-3">
                                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                Saved reference
                                            </span>
                                            <a
                                                href={resource.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="editorial-link text-sm text-foreground"
                                            >
                                                Open
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {totalRecent > 0 && (
                <section className="page-shell space-y-5">
                    <SectionHeading
                        kicker="Recent activity"
                        title="What you touched last"
                        detail="A lightweight memory so you can resume without hunting."
                    />
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="paper-panel rounded-[1.8rem] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                Recent courses
                            </div>
                            <div className="mt-5 space-y-4">
                                {snapshot.recentCourses.length === 0 ? (
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        Open a course and it will appear here.
                                    </p>
                                ) : (
                                    snapshot.recentCourses.map((course) => (
                                        <Link
                                            key={course.id}
                                            href={`/course/${course.id}`}
                                            className="block border-t border-border/70 pt-4"
                                        >
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                {course.category}
                                            </p>
                                            <p className="mt-2 font-semibold text-foreground">
                                                {course.title}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {course.instructor}
                                            </p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="paper-panel rounded-[1.8rem] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Clock3 className="h-4 w-4" />
                                Recent tools
                            </div>
                            <div className="mt-5 space-y-4">
                                {snapshot.recentTools.length === 0 ? (
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        Visit a tool and it will appear here.
                                    </p>
                                ) : (
                                    snapshot.recentTools.map((tool) => (
                                        <a
                                            key={tool.id}
                                            href={tool.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block border-t border-border/70 pt-4"
                                        >
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                {tool.category}
                                            </p>
                                            <p className="mt-2 font-semibold text-foreground">
                                                {tool.name}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Reopen the tool you used last.
                                            </p>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {recommendedCourses.length > 0 && (
                <section className="page-shell space-y-5">
                    <SectionHeading
                        kicker="Suggested next"
                        title="A tighter next step"
                        detail="Based on the categories you already gravitated toward."
                    />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {recommendedCourses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/course/${course.id}`}
                                className="paper-soft hover-rise rounded-[1.5rem] p-5"
                            >
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    {course.category}
                                </p>
                                <p className="mt-2 text-xl font-semibold text-foreground">
                                    {course.title}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    {course.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="section-shell grid gap-6 border-y border-border py-8 md:grid-cols-3">
                <QuickAction
                    title="Open the atlas"
                    body="Return to the main course catalog when you want a fresh pass through the learning tracks."
                    href="/categories"
                    icon={<Compass className="h-4 w-4" />}
                />
                <QuickAction
                    title="Check the vault"
                    body="Revisit references, guides, and study notes when you need supporting material."
                    href="/resources"
                    icon={<Lock className="h-4 w-4" />}
                />
                <QuickAction
                    title="Find fresh tools"
                    body="Jump back into the tools directory when you need something new for a workflow."
                    href="/ai-tools"
                    icon={<Sparkles className="h-4 w-4" />}
                />
            </section>
        </div>
    );
}

function StatTile({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="paper-soft rounded-[1.5rem] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</p>
        </div>
    );
}

function SectionHeading({
    kicker,
    title,
    detail,
}: {
    kicker: string;
    title: string;
    detail: string;
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="section-kicker">{kicker}</p>
                <h2 className="mt-2 text-4xl text-display">{title}</h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground">{detail}</p>
        </div>
    );
}

function QuickAction({
    title,
    body,
    href,
    icon,
}: {
    title: string;
    body: string;
    href: string;
    icon: ReactNode;
}) {
    return (
        <Link href={href} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {icon}
                {title}
            </div>
            <p className="text-sm leading-7 text-muted-foreground">{body}</p>
            <span className="editorial-link text-sm text-foreground">
                Open
                <ArrowRight className="h-4 w-4" />
            </span>
        </Link>
    );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-full border border-border bg-background/80 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
            Remove
        </button>
    );
}
