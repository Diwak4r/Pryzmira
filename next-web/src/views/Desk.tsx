'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Bot,
    Clock3,
    Copy,
    ExternalLink,
    LibraryBig,
    RotateCcw,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    type StrategyProfileRecord,
    type StrategyWorkspaceResponse,
} from '@/lib/strategy';
import {
    clearStrategyProfileId,
    clearStrategyResumeToken,
    getStrategyProfileId,
    getStrategyResumeToken,
    setStrategyProfileId,
    setStrategyResumeToken,
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

function getPremiumStageLabel(stage: StrategyProfileRecord['premiumStage']): string {
    switch (stage) {
        case 'interested':
            return 'Interested';
        case 'lead':
            return 'Joined waitlist';
        case 'contacted':
            return 'Contacted';
        case 'converted':
            return 'Active';
        default:
            return 'Open';
    }
}

async function parseWorkspaceResponse(response: Response): Promise<StrategyWorkspaceResponse> {
    const payload = (await response.json()) as StrategyWorkspaceResponse | { error?: string };

    if (!response.ok) {
        const message =
            typeof payload === 'object' && payload && 'error' in payload && payload.error
                ? payload.error
                : 'Unable to load your workspace.';
        throw new Error(message);
    }

    return payload as StrategyWorkspaceResponse;
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

export default function Desk({
    initialProfileId,
    initialToken,
}: {
    initialProfileId?: string;
    initialToken?: string;
}) {
    const [snapshot, setSnapshot] = useState<DeskSnapshot>({
        savedCourses: [],
        savedTools: [],
        savedResources: [],
        recentCourses: [],
        recentTools: [],
        vaultUnlocked: false,
    });
    const [workspace, setWorkspace] = useState<StrategyWorkspaceResponse | null>(null);
    const [workspaceError, setWorkspaceError] = useState('');
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
    const [isRefreshingWorkspace, setIsRefreshingWorkspace] = useState(false);
    const [isCapturingPremium, setIsCapturingPremium] = useState(false);
    const [premiumMessage, setPremiumMessage] = useState('');
    const [resumeLinkMessage, setResumeLinkMessage] = useState('');

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
            const nextResumeToken = initialToken || getStrategyResumeToken();
            const nextProfileId = initialProfileId || getStrategyProfileId();
            const query = nextResumeToken
                ? `token=${encodeURIComponent(nextResumeToken)}`
                : nextProfileId
                  ? `profileId=${encodeURIComponent(nextProfileId)}`
                  : null;

            if (!query) {
                setWorkspace(null);
                setWorkspaceError('');
                setIsLoadingWorkspace(false);
                return;
            }

            if (nextResumeToken) {
                setStrategyResumeToken(nextResumeToken);
            }

            if (initialProfileId) {
                setStrategyProfileId(initialProfileId);
            }

            setIsLoadingWorkspace(true);
            setWorkspaceError('');

            try {
                const response = await fetch(`/api/strategy/plan?${query}`, { cache: 'no-store' });
                const payload = await parseWorkspaceResponse(response);

                if (!isCancelled) {
                    setStrategyProfileId(payload.profile.id);
                    const nextToken = new URL(payload.resumeUrl).searchParams.get('token');
                    if (nextToken) {
                        setStrategyResumeToken(nextToken);
                    }
                    setWorkspace(payload);
                }
            } catch (error) {
                if (isCancelled) {
                    return;
                }

                const message =
                    error instanceof Error ? error.message : 'Unable to load your workspace.';

                if (
                    message.toLowerCase().includes('not found') ||
                    message.toLowerCase().includes('invalid or expired')
                ) {
                    clearStrategyProfileId();
                    clearStrategyResumeToken();
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
    }, [initialProfileId, initialToken]);

    const stats = useMemo(() => {
        if (!workspace) {
            return [];
        }

        return [
            {
                label: 'Goal',
                value: getGoalLabel(workspace.profile.goal),
                detail: getExperienceLabel(workspace.profile.experienceLevel),
            },
            {
                label: 'Hours',
                value: `${workspace.profile.weeklyHours} hrs`,
                detail: getPathLabel(workspace.profile.monetizationPath),
            },
            {
                label: 'Cadence',
                value: workspace.profile.wantsBriefs ? 'Weekly' : 'Manual',
                detail: workspace.brief.plan.weekLabel,
            },
            {
                label: 'Access',
                value: getPremiumStageLabel(workspace.profile.premiumStage),
                detail:
                    workspace.profile.premiumStage === 'lead'
                        ? 'Priority review requested'
                        : 'Standard desk',
            },
        ];
    }, [workspace]);

    const totalSaved =
        snapshot.savedCourses.length +
        snapshot.savedTools.length +
        snapshot.savedResources.length;
    const totalRecent = snapshot.recentCourses.length + snapshot.recentTools.length;

    const supportGroups = useMemo(() => {
        if (!workspace) {
            return [];
        }

        return [
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
        ];
    }, [workspace]);

    const resumeDisplayUrl = useMemo(() => {
        if (!workspace?.resumeUrl) {
            return '';
        }

        try {
            const parsed = new URL(workspace.resumeUrl);
            return `${parsed.host}${parsed.pathname}${parsed.search}`;
        } catch {
            return workspace.resumeUrl;
        }
    }, [workspace]);

    const handleRefresh = async () => {
        if (!workspace) {
            return;
        }

        setIsRefreshingWorkspace(true);
        setWorkspaceError('');
        setPremiumMessage('');

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
            const nextToken = new URL(payload.resumeUrl).searchParams.get('token');
            if (nextToken) {
                setStrategyResumeToken(nextToken);
            }
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

    const handlePremiumCapture = async () => {
        if (!workspace) {
            return;
        }

        setIsCapturingPremium(true);
        setPremiumMessage('');

        try {
            const response = await fetch('/api/strategy/premium-interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: workspace.profile.id,
                    surface: 'desk',
                    offer: 'pro_waitlist',
                }),
            });
            const payload = (await response.json()) as
                | { error?: string }
                | {
                      profile: StrategyProfileRecord;
                      waitlist?: { position: number; total: number } | null;
                  };

            if (!response.ok) {
                throw new Error(
                    typeof payload === 'object' && payload && 'error' in payload && payload.error
                        ? payload.error
                        : 'Unable to capture premium interest right now.'
                );
            }

            if ('profile' in payload) {
                setWorkspace((current) =>
                    current
                        ? {
                              ...current,
                              profile: payload.profile,
                          }
                        : current
                );
            }

            const waitlistStatus =
                'waitlist' in payload && payload.waitlist ? payload.waitlist : null;

            setPremiumMessage(
                waitlistStatus
                    ? `Priority access saved. You are #${waitlistStatus.position} of ${waitlistStatus.total}.`
                    : 'Priority access saved.'
            );
        } catch (error) {
            setPremiumMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to capture premium interest right now.'
            );
        } finally {
            setIsCapturingPremium(false);
        }
    };

    const handleCopyResumeLink = async () => {
        if (!workspace?.resumeUrl || typeof navigator === 'undefined' || !navigator.clipboard) {
            setResumeLinkMessage('Resume link is unavailable on this device.');
            return;
        }

        try {
            await navigator.clipboard.writeText(workspace.resumeUrl);
            setResumeLinkMessage('Secure resume link copied.');
        } catch {
            setResumeLinkMessage('Unable to copy the resume link right now.');
        }
    };

    return (
        <div className="space-y-10 pb-16">
            <section className="page-shell grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42 }}
                    className="hero-stage overflow-hidden"
                >
                    <div className="space-y-6 p-7 md:p-10">
                        <span className="brand-chip">
                            <span className="brand-chip-dot" />
                            Workspace
                        </span>

                        {workspace ? (
                            <>
                                <div className="space-y-4">
                                    <p className="section-kicker">Current focus</p>
                                    <h1 className="max-w-4xl text-5xl text-display text-balance md:text-6xl">
                                        {workspace.brief.plan.sprintFocus}
                                    </h1>
                                    <p className="max-w-2xl text-base leading-8 text-muted-foreground">
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
                                        {isRefreshingWorkspace ? 'Refreshing...' : 'Refresh this week'}
                                        {!isRefreshingWorkspace ? (
                                            <RotateCcw className="ml-2 h-4 w-4" />
                                        ) : null}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCopyResumeLink}
                                        className="rounded-full px-6 py-6 text-sm font-semibold"
                                    >
                                        Copy resume link
                                        <Copy className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-full px-6 py-6 text-sm font-semibold"
                                    >
                                        <Link href="/categories">Open atlas</Link>
                                    </Button>
                                </div>

                                <div className="grid gap-3">
                                    {workspace.brief.plan.nextActions.map((action, index) => (
                                        <div
                                            key={action}
                                            className="rounded-[1.25rem] border border-border/80 bg-background/72 px-4 py-4"
                                        >
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                Move {index + 1}
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-foreground">
                                                {action}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <p className="section-kicker">No active workspace</p>
                                    <h1 className="max-w-4xl text-5xl text-display text-balance md:text-6xl">
                                        Build the desk first, then let the rest of the product support it.
                                    </h1>
                                    <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                                        Start from the home intake. Pryzmira will turn the current goal,
                                        weekly hours, and outcome path into one working brief.
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
                                        <Link href="/categories">Open atlas</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
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
                                <p className="section-kicker">Desk snapshot</p>
                                <h2 className="text-3xl text-display text-balance">
                                    {workspace.profile.fullName.split(' ')[0]}&apos;s current workspace
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

                            <div className="rounded-[1.5rem] border border-border bg-background/72 p-5">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Resume
                                </p>
                                <p className="mt-2 break-all text-sm leading-7 text-foreground/82">
                                    {resumeDisplayUrl}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCopyResumeLink}
                                        className="rounded-full px-5 text-sm font-semibold"
                                    >
                                        Copy link
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handlePremiumCapture}
                                        disabled={
                                            isCapturingPremium ||
                                            workspace.profile.premiumStage === 'lead' ||
                                            workspace.profile.premiumStage === 'contacted' ||
                                            workspace.profile.premiumStage === 'converted'
                                        }
                                        className="rounded-full px-5 text-sm font-semibold"
                                    >
                                        {workspace.profile.premiumStage === 'lead' ||
                                        workspace.profile.premiumStage === 'contacted' ||
                                        workspace.profile.premiumStage === 'converted'
                                            ? 'Priority access saved'
                                            : isCapturingPremium
                                              ? 'Saving...'
                                              : 'Join priority access'}
                                    </Button>
                                </div>
                                {resumeLinkMessage ? (
                                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                        {resumeLinkMessage}
                                    </p>
                                ) : null}
                                {premiumMessage ? (
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                        {premiumMessage}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="section-kicker">Support snapshot</p>
                                <h2 className="text-3xl text-display text-balance">
                                    The support material is already here. The brief is not.
                                </h2>
                                <p className="text-sm leading-7 text-muted-foreground">
                                    Build the workspace first so these saved items stop behaving like
                                    an unstructured pile.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="paper-soft rounded-[1.4rem] p-5">
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                        Saved items
                                    </p>
                                    <p className="mt-3 text-2xl font-semibold text-foreground">
                                        {totalSaved}
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                        Material worth revisiting.
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
                                        Recent activity is still available.
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
                                        Deeper references and saved access.
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
                                        Give the desk one active mission.
                                    </p>
                                </div>
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
                    <section className="page-shell grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
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

                        <div className="paper-panel rounded-[1.9rem] p-6 md:p-7">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Target className="h-4 w-4" />
                                Support stack
                            </div>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                                Open these only when the active sprint needs them. The desk stays first.
                            </p>
                            <div className="mt-5 grid gap-4 xl:grid-cols-3">
                                {supportGroups.map((group) => (
                                    <div
                                        key={group.title}
                                        className="rounded-[1.5rem] border border-border bg-background/72 p-4"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            {group.icon}
                                            {group.title}
                                        </div>
                                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                            {group.detail}
                                        </p>
                                        <div className="mt-4 space-y-4">
                                            {(group.items as RecommendationItem[]).map((item) => (
                                                <div
                                                    key={`${group.title}-${item.id}`}
                                                    className="rounded-[1.2rem] border border-border/80 bg-background/84 p-4"
                                                >
                                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                                        {item.category}
                                                    </p>
                                                    <h3 className="mt-2 text-base font-semibold text-foreground">
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
                        </div>
                    </section>

                    <section className="page-shell grid gap-5 md:grid-cols-3">
                        <div className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Saved items
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-foreground">
                                {totalSaved}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                Material pinned for later use.
                            </p>
                        </div>
                        <div className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Recent opens
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-foreground">
                                {totalRecent}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                Quick return path into current work.
                            </p>
                        </div>
                        <div className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                Vault
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-foreground">
                                {snapshot.vaultUnlocked ? 'Open' : 'Locked'}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                Deeper references available when needed.
                            </p>
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
}
