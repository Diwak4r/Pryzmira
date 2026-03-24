'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Bot,
    Clock3,
    ExternalLink,
    LibraryBig,
    RotateCcw,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type StrategyBriefRecord, type StrategyProfileRecord } from '@/lib/strategy';
import {
    clearStrategyProfileId,
    getStrategyProfileId,
    setStrategyProfileId,
} from '@/lib/strategySession';
import { RecentCourse, RecentTool, getRecentCourses, getRecentTools } from '@/lib/recentlyViewed';
import {
    SavedCourse,
    SavedResource,
    SavedTool,
    getSavedCourses,
    getSavedResources,
    getSavedTools,
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

interface StrategyWorkspaceState {
    brief: StrategyBriefRecord;
    profile: StrategyProfileRecord;
}

interface RecommendationItem {
    id: string | number;
    title: string;
    href: string;
    label: string;
    category: string;
    reason: string;
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

function getGoalLabel(goal: StrategyProfileRecord['goal']): string {
    switch (goal) {
        case 'launch-ai-product':
            return 'Launch an AI product';
        case 'become-ai-engineer':
            return 'Become an AI engineer';
        case 'get-hired-in-tech':
            return 'Get hired in tech';
        case 'use-ai-at-work':
            return 'Use AI at work';
        default:
            return 'Build with AI';
    }
}

function getExperienceLabel(level: StrategyProfileRecord['experienceLevel']): string {
    switch (level) {
        case 'starter':
            return 'Starter';
        case 'working':
            return 'Working';
        case 'advanced':
            return 'Advanced';
        default:
            return 'Focused';
    }
}

function getPathLabel(path: StrategyProfileRecord['monetizationPath']): string {
    switch (path) {
        case 'career':
            return 'Career growth';
        case 'freelance':
            return 'Freelance income';
        case 'saas':
            return 'SaaS path';
        default:
            return 'Outcome focused';
    }
}

async function parseWorkspaceResponse(response: Response): Promise<StrategyWorkspaceState> {
    const payload = (await response.json()) as StrategyWorkspaceState | { error?: string };

    if (!response.ok) {
        const message =
            typeof payload === 'object' && payload && 'error' in payload && payload.error
                ? payload.error
                : 'Unable to load your workspace.';
        throw new Error(message);
    }

    return payload as StrategyWorkspaceState;
}

function ActionLink({ href }: { href: string }) {
    if (href.startsWith('http')) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="editorial-link mt-4 inline-flex text-sm text-foreground"
            >
                Open
                <ExternalLink className="h-4 w-4" />
            </a>
        );
    }

    return (
        <Link href={href} className="editorial-link mt-4 inline-flex text-sm text-foreground">
            Open
            <ArrowRight className="h-4 w-4" />
        </Link>
    );
}

export default function Desk({ initialProfileId }: { initialProfileId?: string }) {
    const [snapshot, setSnapshot] = useState<DeskSnapshot>({
        savedCourses: [],
        savedTools: [],
        savedResources: [],
        recentCourses: [],
        recentTools: [],
        vaultUnlocked: false,
    });
    const [workspace, setWorkspace] = useState<StrategyWorkspaceState | null>(null);
    const [workspaceError, setWorkspaceError] = useState('');
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
    const [isRefreshingWorkspace, setIsRefreshingWorkspace] = useState(false);

    useEffect(() => {
        const syncSnapshot = () => {
            setSnapshot(readDeskSnapshot());
        };

        syncSnapshot();
        return subscribeToPersonalDataUpdates(syncSnapshot);
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const loadWorkspace = async () => {
            const nextProfileId = initialProfileId || getStrategyProfileId();

            if (!nextProfileId) {
                setWorkspace(null);
                setWorkspaceError('');
                setIsLoadingWorkspace(false);
                return;
            }

            if (initialProfileId) {
                setStrategyProfileId(initialProfileId);
            }

            setIsLoadingWorkspace(true);
            setWorkspaceError('');

            try {
                const response = await fetch(
                    `/api/strategy/plan?profileId=${encodeURIComponent(nextProfileId)}`,
                    { cache: 'no-store' }
                );
                const payload = await parseWorkspaceResponse(response);

                if (!isCancelled) {
                    setWorkspace(payload);
                }
            } catch (error) {
                if (isCancelled) {
                    return;
                }

                const message =
                    error instanceof Error ? error.message : 'Unable to load your workspace.';

                if (message.toLowerCase().includes('not found')) {
                    clearStrategyProfileId();
                    setWorkspace(null);
                }

                setWorkspaceError(message);
            } finally {
                if (!isCancelled) {
                    setIsLoadingWorkspace(false);
                }
            }
        };

        void loadWorkspace();

        return () => {
            isCancelled = true;
        };
    }, [initialProfileId]);

    const stats = useMemo(() => {
        if (!workspace) {
            return [];
        }

        return [
            {
                label: 'Mission',
                value: getGoalLabel(workspace.profile.goal),
                detail: getExperienceLabel(workspace.profile.experienceLevel),
            },
            {
                label: 'Capacity',
                value: `${workspace.profile.weeklyHours} hrs`,
                detail: getPathLabel(workspace.profile.monetizationPath),
            },
            {
                label: 'Cadence',
                value: workspace.profile.wantsBriefs ? 'Weekly' : 'Manual',
                detail: workspace.brief.plan.weekLabel,
            },
            {
                label: 'Premium',
                value: workspace.profile.premiumInterest ? 'Interested' : 'Later',
                detail: workspace.profile.email,
            },
        ];
    }, [workspace]);

    const totalSaved =
        snapshot.savedCourses.length +
        snapshot.savedTools.length +
        snapshot.savedResources.length;
    const totalRecent = snapshot.recentCourses.length + snapshot.recentTools.length;

    const handleRefresh = async () => {
        if (!workspace) {
            return;
        }

        setIsRefreshingWorkspace(true);
        setWorkspaceError('');

        try {
            const response = await fetch('/api/strategy/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: workspace.profile.email,
                    fullName: workspace.profile.fullName,
                    goal: workspace.profile.goal,
                    experienceLevel: workspace.profile.experienceLevel,
                    weeklyHours: workspace.profile.weeklyHours,
                    monetizationPath: workspace.profile.monetizationPath,
                    wantsBriefs: workspace.profile.wantsBriefs,
                    premiumInterest: workspace.profile.premiumInterest,
                }),
            });

            const payload = await parseWorkspaceResponse(response);
            setWorkspace(payload);
            setStrategyProfileId(payload.profile.id);
        } catch (error) {
            setWorkspaceError(
                error instanceof Error
                    ? error.message
                    : 'Unable to refresh your workspace right now.'
            );
        } finally {
            setIsRefreshingWorkspace(false);
        }
    };

    return (
        <div className="space-y-14 pb-16">
            <section className="page-shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42 }}
                    className="space-y-6"
                >
                    <span className="brand-chip">
                        <span className="brand-chip-dot" />
                        AI workspace
                    </span>

                    {workspace ? (
                        <>
                            <div className="space-y-4">
                                <p className="section-kicker">Current brief</p>
                                <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                                    {workspace.brief.plan.headline}
                                </h1>
                                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                    {workspace.brief.plan.summary}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    onClick={handleRefresh}
                                    className="rounded-full px-6 py-6 text-sm font-semibold"
                                    disabled={isRefreshingWorkspace}
                                >
                                    {isRefreshingWorkspace ? 'Refreshing...' : 'Refresh this brief'}
                                    {!isRefreshingWorkspace ? (
                                        <RotateCcw className="ml-2 h-4 w-4" />
                                    ) : null}
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full px-6 py-6 text-sm font-semibold"
                                >
                                    <Link href="/categories">Open the atlas</Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <p className="section-kicker">Build the workspace first</p>
                                <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                                    Turn Pryzmira into a mission room instead of another bookmark pile.
                                </h1>
                                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                    Start with the home intake. Pryzmira will convert your AI goal,
                                    time, and outcome into a working weekly brief and the right support
                                    stack.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button asChild className="rounded-full px-6 py-6 text-sm font-semibold">
                                    <Link href="/">Build my workspace</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full px-6 py-6 text-sm font-semibold"
                                >
                                    <Link href="/categories">Browse the atlas</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </motion.div>

                <motion.aside
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: 0.05 }}
                    className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8"
                >
                    {workspace ? (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="section-kicker">Workspace signal</p>
                                <h2 className="text-3xl text-display text-balance">
                                    {workspace.profile.fullName.split(' ')[0]}, your next week is no
                                    longer vague.
                                </h2>
                                <p className="text-sm leading-7 text-muted-foreground">
                                    {workspace.brief.preview}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {stats.map((item) => (
                                    <div key={item.label} className="paper-soft rounded-[1.4rem] p-5">
                                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold text-foreground">
                                            {item.value}
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                            {item.detail}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="paper-soft rounded-[1.4rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Saved items
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">
                                    {totalSaved}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    Good support material, but not a working plan yet.
                                </p>
                            </div>
                            <div className="paper-soft rounded-[1.4rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Recent opens
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">
                                    {totalRecent}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    What you touched last is still here.
                                </p>
                            </div>
                            <div className="paper-soft rounded-[1.4rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Vault
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">
                                    {snapshot.vaultUnlocked ? 'Open' : 'Locked'}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    Reference access for deeper sessions.
                                </p>
                            </div>
                            <div className="paper-soft rounded-[1.4rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Next move
                                </p>
                                <p className="mt-3 text-2xl font-semibold text-foreground">
                                    Build brief
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    Give this desk a mission before adding more noise.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.aside>
            </section>

            {workspaceError ? (
                <section className="page-shell">
                    <div className="rounded-[1.6rem] border border-destructive/30 bg-destructive/8 px-5 py-4 text-sm text-destructive">
                        {workspaceError}
                    </div>
                </section>
            ) : null}

            {isLoadingWorkspace ? (
                <section className="page-shell">
                    <div className="paper-panel rounded-[2rem] p-6 md:p-8">
                        <p className="section-kicker">Loading workspace</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {[0, 1, 2].map((value) => (
                                <div
                                    key={value}
                                    className="h-36 animate-pulse rounded-[1.5rem] bg-muted/55"
                                />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            {workspace ? (
                <>
                    <section className="page-shell grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="paper-panel rounded-[1.9rem] p-6 md:p-7">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Target className="h-4 w-4" />
                                This week&apos;s sprint
                            </div>
                            <h2 className="mt-4 text-4xl text-display">
                                {workspace.brief.plan.sprintFocus}
                            </h2>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                                {workspace.brief.plan.promise}
                            </p>
                            <div className="mt-6 grid gap-3">
                                {workspace.brief.plan.nextActions.map((action, index) => (
                                    <div
                                        key={action}
                                        className="rounded-[1.3rem] border border-border bg-background/74 px-4 py-4"
                                    >
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                            Action {index + 1}
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-foreground">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="paper-panel rounded-[1.9rem] p-6 md:p-7">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Clock3 className="h-4 w-4" />
                                Session plan
                            </div>
                            <div className="mt-5 space-y-4">
                                {workspace.brief.plan.sessions.map((session, index) => (
                                    <div
                                        key={`${session.title}-${index}`}
                                        className="rounded-[1.3rem] border border-border bg-background/74 px-4 py-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                    Session {index + 1}
                                                </p>
                                                <h3 className="mt-2 text-lg font-semibold text-foreground">
                                                    {session.title}
                                                </h3>
                                            </div>
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                                                {session.duration}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                            {session.outcome}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="page-shell space-y-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="section-kicker">Recommended stack</p>
                                <h2 className="mt-2 max-w-3xl text-4xl text-display text-balance">
                                    Use the brief first, then move into the right surfaces.
                                </h2>
                            </div>
                            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                                These picks should shorten the path between your AI goal and visible
                                output.
                            </p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-3">
                            {[
                                {
                                    detail: 'Depth and proof of work.',
                                    icon: <BookOpen className="h-4 w-4" />,
                                    items: workspace.brief.plan.recommendations.courses,
                                    title: 'Courses',
                                },
                                {
                                    detail: 'Workflow leverage.',
                                    icon: <Bot className="h-4 w-4" />,
                                    items: workspace.brief.plan.recommendations.tools,
                                    title: 'Tools',
                                },
                                {
                                    detail: 'References and recovery docs.',
                                    icon: <LibraryBig className="h-4 w-4" />,
                                    items: workspace.brief.plan.recommendations.resources,
                                    title: 'Resources',
                                },
                            ].map((group) => (
                                <div key={group.title} className="paper-panel rounded-[1.8rem] p-5 md:p-6">
                                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        {group.icon}
                                        {group.title}
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                        {group.detail}
                                    </p>
                                    <div className="mt-5 space-y-4">
                                        {(group.items as RecommendationItem[]).map((item) => (
                                            <div
                                                key={`${group.title}-${item.id}`}
                                                className="rounded-[1.3rem] border border-border bg-background/74 p-4"
                                            >
                                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                    {item.category}
                                                </p>
                                                <h3 className="mt-2 text-lg font-semibold text-foreground">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                    {item.reason}
                                                </p>
                                                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                    {item.label}
                                                </p>
                                                <ActionLink href={item.href} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
}
