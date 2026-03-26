'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Radar, ShieldCheck, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    buildStrategyPlan,
    getExperienceOptions,
    getGoalOptions,
    getMonetizationOptions,
    type ExperienceLevel,
    type MonetizationPath,
    type StrategyGoal,
    type StrategyGrowthStats,
    type StrategyWorkspaceResponse,
} from '@/lib/strategy';
import { setStrategyResumeToken } from '@/lib/strategySession';

type HomeFormState = {
    email: string;
    fullName: string;
    goal: StrategyGoal;
    experienceLevel: ExperienceLevel;
    weeklyHours: string;
    monetizationPath: MonetizationPath;
    wantsBriefs: boolean;
    premiumInterest: boolean;
};

const defaultState: HomeFormState = {
    email: '',
    fullName: '',
    goal: 'launch-ai-product',
    experienceLevel: 'starter',
    weeklyHours: '6',
    monetizationPath: 'saas',
    wantsBriefs: true,
    premiumInterest: false,
};

const operatorPrinciples = [
    {
        label: 'Drift control',
        title: 'Stop losing the week to AI tab sprawl.',
        body: 'The desk keeps one active objective, one working plan, and only the material needed for the current sprint.',
    },
    {
        label: 'Signal control',
        title: 'Catch what matters before it becomes backlog.',
        body: 'Pryzmira converts a changing AI landscape into a weekly focus instead of another pile of links and launches.',
    },
    {
        label: 'Return loop',
        title: 'Open the same workspace tomorrow and keep moving.',
        body: 'Resume links keep the desk persistent, so the system compounds instead of restarting every session.',
    },
];

const deskOutcomes = [
    {
        label: 'Focus',
        body: 'One weekly target with the next three moves already ordered.',
    },
    {
        label: 'Sessions',
        body: 'Work blocks sized to the time the user actually has this week.',
    },
    {
        label: 'Stack',
        body: 'Only the tool, course, and reference material needed to support the sprint.',
    },
];

const returnReasons = [
    {
        icon: Radar,
        title: 'Know what changed',
        body: 'Users come back when the desk helps them see what is newly relevant to their goal instead of following the whole market.',
    },
    {
        icon: Workflow,
        title: 'Know what to do next',
        body: 'The brief removes blank-page decisions. The next move is already present when the user opens the platform.',
    },
    {
        icon: ShieldCheck,
        title: 'Stay ahead without noise',
        body: 'The product should trigger urgency by preventing drift, not by shouting. That is the right kind of FOMO.',
    },
];

function buildStatusLine(growthStats: StrategyGrowthStats | null): { label: string; value: string }[] {
    return [
        {
            label: 'Builders this week',
            value: growthStats ? String(growthStats.buildersThisWeek) : '...',
        },
        {
            label: 'Briefs generated',
            value: growthStats ? String(growthStats.briefsThisWeek) : '...',
        },
        {
            label: 'Priority queue',
            value: growthStats ? String(growthStats.waitlistCount) : '...',
        },
    ];
}

export default function Home() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formState, setFormState] = useState<HomeFormState>(defaultState);
    const [error, setError] = useState('');
    const [growthStats, setGrowthStats] = useState<StrategyGrowthStats | null>(null);

    const goals = useMemo(() => getGoalOptions(), []);
    const experienceOptions = useMemo(() => getExperienceOptions(), []);
    const monetizationOptions = useMemo(() => getMonetizationOptions(), []);
    const previewPlan = useMemo(
        () =>
            buildStrategyPlan({
                email: formState.email || 'preview@pryzmira.dev',
                fullName: formState.fullName || 'Pryzmira User',
                goal: formState.goal,
                experienceLevel: formState.experienceLevel,
                weeklyHours: Number(formState.weeklyHours) || 6,
                monetizationPath: formState.monetizationPath,
                wantsBriefs: formState.wantsBriefs,
                premiumInterest: formState.premiumInterest,
            }),
        [formState]
    );

    const growthRail = useMemo(() => buildStatusLine(growthStats), [growthStats]);

    useEffect(() => {
        let isCancelled = false;

        const loadGrowthStats = async () => {
            try {
                const response = await fetch('/api/platform/stats', { cache: 'no-store' });
                if (!response.ok) {
                    return;
                }

                const payload = (await response.json()) as StrategyGrowthStats;
                if (!isCancelled) {
                    setGrowthStats(payload);
                }
            } catch {
                if (!isCancelled) {
                    setGrowthStats(null);
                }
            }
        };

        void loadGrowthStats();

        return () => {
            isCancelled = true;
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        startTransition(async () => {
            try {
                const response = await fetch('/api/strategy/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formState,
                        weeklyHours: Number(formState.weeklyHours),
                    }),
                });

                const payload = (await response.json()) as StrategyWorkspaceResponse | { error?: string };

                if (!response.ok) {
                    throw new Error(
                        typeof payload === 'object' &&
                            payload !== null &&
                            'error' in payload &&
                            typeof payload.error === 'string'
                            ? payload.error
                            : 'Unable to generate your workspace right now.'
                    );
                }

                const nextUrl = new URL((payload as StrategyWorkspaceResponse).resumeUrl);
                const token = nextUrl.searchParams.get('token');

                if (token) {
                    setStrategyResumeToken(token);
                }

                router.push(`${nextUrl.pathname}${nextUrl.search}`);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to generate your workspace right now.'
                );
            }
        });
    };

    return (
        <div className="space-y-12 pb-20">
            <section className="page-shell">
                <div className="hero-stage">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-8 p-7 md:p-10 lg:p-12">
                            <span className="status-badge">Active workspace system</span>

                            <div className="space-y-5">
                                <p className="utility-kicker">Daily AI operating desk</p>
                                <h1 className="max-w-4xl text-5xl text-display md:text-7xl">
                                    Stay current. Stay useful. Do not lose the week.
                                </h1>
                                <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                                    Pryzmira turns one AI goal into an active weekly desk so users know
                                    what matters now, what to do next, and what can be ignored.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button asChild className="rounded-full px-6 py-6 text-sm font-semibold">
                                    <Link href="#strategy-form" className="editorial-link">
                                        Build workspace
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full px-6 py-6 text-sm font-semibold"
                                >
                                    <Link href="/desk">Open workspace</Link>
                                </Button>
                            </div>

                            <div className="signal-grid border-t border-border/70 pt-6">
                                {growthRail.map((item) => (
                                    <div key={item.label} className="signal-item first:border-l-0 first:pl-0">
                                        <p className="control-label">{item.label}</p>
                                        <p className="mt-3 text-2xl font-semibold text-foreground md:text-[1.75rem]">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-border/70 pt-6">
                                {operatorPrinciples.map((item) => (
                                    <div key={item.label} className="operator-row">
                                        <p className="control-label">{item.label}</p>
                                        <div className="space-y-1.5">
                                            <h2 className="text-lg font-semibold text-foreground">
                                                {item.title}
                                            </h2>
                                            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                                {item.body}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.42, delay: 0.05 }}
                            className="border-t border-border/70 bg-background/34 lg:border-l lg:border-t-0"
                        >
                            <div className="space-y-5 p-7 md:p-10 lg:p-12">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="utility-kicker">Preview board</p>
                                        <h2 className="mt-3 max-w-xl text-3xl text-display md:text-4xl">
                                            {previewPlan.sprintFocus}
                                        </h2>
                                    </div>
                                    <span className="brand-chip">Week active</span>
                                </div>

                                <div className="control-frame p-5">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="control-label">Goal</p>
                                            <p className="mt-2 text-sm leading-7 text-foreground">
                                                {goals.find((goal) => goal.value === formState.goal)?.label}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="control-label">Hours</p>
                                            <p className="mono-value mt-2 text-sm leading-7 text-foreground">
                                                {formState.weeklyHours || '6'} hrs / week
                                            </p>
                                        </div>
                                        <div>
                                            <p className="control-label">Path</p>
                                            <p className="mt-2 text-sm leading-7 text-foreground">
                                                {
                                                    monetizationOptions.find(
                                                        (option) =>
                                                            option.value === formState.monetizationPath
                                                    )?.label
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="dense-divider my-5" />

                                    <div className="space-y-3">
                                        <p className="control-label">Next actions</p>
                                        {previewPlan.nextActions.slice(0, 3).map((action, index) => (
                                            <div
                                                key={action}
                                                className="grid gap-2 border-t border-border/60 py-3 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[auto_1fr]"
                                            >
                                                <span className="mono-value text-sm text-primary">
                                                    0{index + 1}
                                                </span>
                                                <p className="text-sm leading-7 text-foreground">{action}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="dense-divider my-5" />

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="control-label">Anchor course</p>
                                            <p className="mt-2 text-sm leading-7 text-foreground">
                                                {previewPlan.recommendations.courses[0]?.title}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="control-label">Primary tool</p>
                                            <p className="mt-2 text-sm leading-7 text-foreground">
                                                {previewPlan.recommendations.tools[0]?.title}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="control-label">Reference</p>
                                            <p className="mt-2 text-sm leading-7 text-foreground">
                                                {previewPlan.recommendations.resources[0]?.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm leading-7 text-muted-foreground">
                                    The product only works if it helps users avoid drift. This board is
                                    the standard: focus, ordered action, and a support stack that stays
                                    in the background until needed.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="strategy-form" className="page-shell grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="paper-panel rounded-[1.35rem] p-6 md:p-8"
                >
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="utility-kicker">Start the desk</p>
                            <h2 className="text-4xl text-display">Build the weekly operating brief.</h2>
                            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                Goal, experience, hours, and outcome path are enough to build the first
                                live workspace.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid gap-5">
                            <div className="grid gap-2">
                                <p className="control-label">Identity</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Input
                                        type="text"
                                        placeholder="Your name"
                                        value={formState.fullName}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                fullName: event.target.value,
                                            }))
                                        }
                                        className="h-12 rounded-[0.95rem] border-border bg-background/82 px-4"
                                    />
                                    <Input
                                        type="email"
                                        placeholder="name@email.com"
                                        value={formState.email}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                email: event.target.value,
                                            }))
                                        }
                                        className="h-12 rounded-[0.95rem] border-border bg-background/82 px-4"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <p className="control-label">Direction</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Select
                                        value={formState.goal}
                                        onValueChange={(value) =>
                                            setFormState((current) => ({
                                                ...current,
                                                goal: value as StrategyGoal,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-[0.95rem] border-border bg-background/82 px-4">
                                            <SelectValue placeholder="Primary goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {goals.map((goal) => (
                                                <SelectItem key={goal.value} value={goal.value}>
                                                    {goal.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formState.experienceLevel}
                                        onValueChange={(value) =>
                                            setFormState((current) => ({
                                                ...current,
                                                experienceLevel: value as ExperienceLevel,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-[0.95rem] border-border bg-background/82 px-4">
                                            <SelectValue placeholder="Experience level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {experienceOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <p className="control-label">Capacity</p>
                                <div className="grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
                                    <Input
                                        type="number"
                                        min={2}
                                        max={20}
                                        placeholder="Hours / week"
                                        value={formState.weeklyHours}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                weeklyHours: event.target.value,
                                            }))
                                        }
                                        className="h-12 rounded-[0.95rem] border-border bg-background/82 px-4"
                                    />

                                    <Select
                                        value={formState.monetizationPath}
                                        onValueChange={(value) =>
                                            setFormState((current) => ({
                                                ...current,
                                                monetizationPath: value as MonetizationPath,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-[0.95rem] border-border bg-background/82 px-4">
                                            <SelectValue placeholder="Monetization path" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monetizationOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="control-frame p-4">
                                <div className="operator-row">
                                    <p className="control-label">Weekly brief</p>
                                    <label className="flex items-start gap-3 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={formState.wantsBriefs}
                                            onChange={(event) =>
                                                setFormState((current) => ({
                                                    ...current,
                                                    wantsBriefs: event.target.checked,
                                                }))
                                            }
                                            className="mt-1 h-4 w-4 rounded border-border text-primary"
                                        />
                                        <span className="leading-7">
                                            Keep the desk refreshed week to week so users do not have
                                            to reconstruct the plan manually.
                                        </span>
                                    </label>
                                </div>
                                <div className="operator-row">
                                    <p className="control-label">Priority access</p>
                                    <label className="flex items-start gap-3 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={formState.premiumInterest}
                                            onChange={(event) =>
                                                setFormState((current) => ({
                                                    ...current,
                                                    premiumInterest: event.target.checked,
                                                }))
                                            }
                                            className="mt-1 h-4 w-4 rounded border-border text-primary"
                                        />
                                        <span className="leading-7">
                                            Join the deeper-review queue without changing the core
                                            workspace flow.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {error ? (
                                <p className="rounded-[1rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {error}
                                </p>
                            ) : null}

                            <Button
                                type="submit"
                                className="h-12 rounded-[0.95rem] text-sm font-semibold"
                                disabled={isPending}
                            >
                                {isPending ? 'Building workspace...' : 'Build workspace'}
                                {!isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                            </Button>
                        </form>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    <div className="control-frame p-6 md:p-7">
                        <div className="space-y-4">
                            <div>
                                <p className="utility-kicker">Why users return</p>
                                <h2 className="mt-3 text-3xl text-display">
                                    The product earns daily use when it removes uncertainty.
                                </h2>
                            </div>
                            {returnReasons.map((item) => (
                                <div key={item.title} className="operator-row">
                                    <p className="control-label inline-flex items-center gap-2">
                                        <item.icon className="h-4 w-4 text-primary" />
                                        {item.title}
                                    </p>
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="paper-soft rounded-[1.2rem] p-6 md:p-7">
                        <p className="utility-kicker">Desk output</p>
                        <div className="mt-5 space-y-4">
                            {deskOutcomes.map((item) => (
                                <div key={item.label} className="operator-row">
                                    <p className="control-label">{item.label}</p>
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
