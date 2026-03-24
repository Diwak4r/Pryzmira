'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Compass,
    Crown,
    Sparkles,
    Target,
    Workflow,
} from 'lucide-react';
import {
    getExperienceOptions,
    getGoalOptions,
    getMonetizationOptions,
    type ExperienceLevel,
    type MonetizationPath,
    type StrategyGoal,
} from '@/lib/strategy';
import { setStrategyProfileId } from '@/lib/strategySession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

const promisePoints = [
    {
        icon: Workflow,
        title: 'Starts from your goal',
        body: 'Pryzmira converts an AI ambition into a weekly mission, a support stack, and a cleaner next move.',
    },
    {
        icon: Target,
        title: 'Built for visible output',
        body: 'Every brief is designed to produce shipping, proof of work, or sharper leverage inside your current workflow.',
    },
    {
        icon: Compass,
        title: 'Keeps the right material close',
        body: 'Atlas, tools, library, and roadmap become supporting surfaces around the workspace instead of separate silos.',
    },
];

const tierCards = [
    {
        title: 'Free workspace',
        badge: 'Start here',
        bullets: [
            'One personalized AI mission brief',
            'Recommended courses, tools, and resources',
            'A weekly sprint you can act on immediately',
        ],
    },
    {
        title: 'Pryzmira Pro',
        badge: 'Grows later',
        bullets: [
            'Rolling weekly reprioritization',
            'Deeper role-specific AI stacks',
            'Persistent history and stronger accountability loops',
        ],
    },
];

export default function Home() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formState, setFormState] = useState<HomeFormState>(defaultState);
    const [error, setError] = useState('');

    const goals = useMemo(() => getGoalOptions(), []);
    const experienceOptions = useMemo(() => getExperienceOptions(), []);
    const monetizationOptions = useMemo(() => getMonetizationOptions(), []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        startTransition(async () => {
            try {
                const response = await fetch('/api/strategy/plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formState,
                        weeklyHours: Number(formState.weeklyHours),
                    }),
                });

                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(
                        typeof payload.error === 'string'
                            ? payload.error
                            : 'Unable to generate your strategy right now.'
                    );
                }

                setStrategyProfileId(payload.profile.id);
                router.push(`/desk?profileId=${encodeURIComponent(payload.profile.id)}`);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to generate your strategy right now.'
                );
            }
        });
    };

    return (
        <div className="space-y-16 pb-16">
            <section className="page-shell">
                <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
                    <div className="space-y-7">
                        <span className="brand-chip">
                            <span className="brand-chip-dot" />
                            AI mission workspace
                        </span>

                        <div className="space-y-5">
                            <p className="section-kicker">Turn AI ambition into a room you can work from</p>
                            <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                                Build your AI workspace, tool stack, and weekly brief in one move.
                            </h1>
                            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                Start with a goal and leave with a working mission room: a weekly
                                brief, the right AI tools, and the learning depth behind your next step.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="rounded-full px-6 py-6 text-sm font-semibold">
                                <Link href="#strategy-form" className="editorial-link">
                                    Build my strategy
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full px-6 py-6 text-sm font-semibold"
                            >
                                <Link href="/categories">Explore the atlas</Link>
                            </Button>
                        </div>

                        <div className="grid gap-4 pt-3 md:grid-cols-3">
                            <Metric
                                label="Starting point"
                                value="One brief"
                                detail="A user enters one goal and gets a clear weekly direction back."
                            />
                            <Metric
                                label="Core habit"
                                value="Weekly"
                                detail="The brief becomes the reason to return instead of rebrowse."
                            />
                            <Metric
                                label="User value"
                                value="Focus"
                                detail="The product should reduce confusion before it tries to monetize."
                            />
                        </div>
                    </div>

                    <motion.div
                        id="strategy-form"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.06 }}
                        className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8"
                    >
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="section-kicker">Free workspace brief</p>
                                <h2 className="text-4xl text-display text-balance">
                                    Tell Pryzmira what you want to become or build.
                                </h2>
                                <p className="text-sm leading-7 text-muted-foreground">
                                    This creates your first AI workspace brief and saves it so you can
                                    come back without rebuilding context.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="grid gap-4">
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
                                        className="h-12 rounded-full border-border bg-background/82 px-5"
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
                                        className="h-12 rounded-full border-border bg-background/82 px-5"
                                    />
                                </div>

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
                                        <SelectTrigger className="h-12 rounded-full border-border bg-background/82 px-5">
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
                                        <SelectTrigger className="h-12 rounded-full border-border bg-background/82 px-5">
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
                                        className="h-12 rounded-full border-border bg-background/82 px-5"
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
                                        <SelectTrigger className="h-12 rounded-full border-border bg-background/82 px-5">
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

                                <div className="grid gap-3 rounded-[1.5rem] border border-border bg-background/68 p-4">
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
                                        <span>
                                            Send me the weekly workspace brief.
                                            <span className="mt-1 block text-muted-foreground">
                                                Pryzmira will keep the mission alive with a tighter next
                                                move each week.
                                            </span>
                                        </span>
                                    </label>

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
                                        <span>
                                            I want deeper guidance when it is ready.
                                            <span className="mt-1 block text-muted-foreground">
                                                This helps Pryzmira identify people who want a stronger,
                                                more persistent workspace later.
                                            </span>
                                        </span>
                                    </label>
                                </div>

                                {error ? (
                                    <p className="rounded-[1.2rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        {error}
                                    </p>
                                ) : null}

                                <Button
                                    type="submit"
                                    className="h-12 rounded-full text-sm font-semibold"
                                    disabled={isPending}
                                >
                                    {isPending ? 'Building your workspace...' : 'Build my free workspace'}
                                    {!isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="section-shell grid gap-6 border-y border-border py-8 md:grid-cols-3">
                {promisePoints.map((point) => (
                    <div key={point.title} className="space-y-3">
                        <point.icon className="h-5 w-5 text-primary" />
                        <p className="section-kicker">{point.title}</p>
                        <p className="text-sm leading-7 text-muted-foreground">{point.body}</p>
                    </div>
                ))}
            </section>

            <section className="page-shell grid gap-5 lg:grid-cols-2">
                {tierCards.map((tier) => (
                    <div key={tier.title} className="paper-soft rounded-[1.8rem] p-6 md:p-7">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    {tier.badge}
                                </p>
                                <h2 className="mt-2 text-3xl text-display">{tier.title}</h2>
                            </div>
                            {tier.title === 'Pryzmira Pro' ? (
                                <Crown className="h-5 w-5 text-primary" />
                            ) : (
                                <Sparkles className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div className="mt-5 space-y-3">
                            {tier.bullets.map((bullet) => (
                                <div key={bullet} className="flex items-start gap-3 text-sm text-foreground">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                                    <span className="leading-7">{bullet}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            <section className="page-shell">
                <div className="paper-panel rounded-[2rem] p-6 md:p-8">
                    <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
                        <div className="space-y-4">
                            <p className="section-kicker">Supporting surfaces</p>
                            <h2 className="text-4xl text-display text-balance">
                                The workspace comes first. Everything else should support it.
                            </h2>
                            <p className="text-sm leading-7 text-muted-foreground">
                                Users should enter through the brief, then use the atlas, tools,
                                library, roadmap, and studio as deeper layers around that mission.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {[
                                {
                                    href: '/desk',
                                    eyebrow: 'Workspace',
                                    title: 'Open the workspace',
                                    body: 'Reopen your mission brief, saved stack, and current momentum.',
                                },
                                {
                                    href: '/categories',
                                    eyebrow: 'Atlas',
                                    title: 'Use the learning atlas',
                                    body: 'Browse deeper once the brief points you to the right track.',
                                },
                                {
                                    href: '/ai-tools',
                                    eyebrow: 'Tools',
                                    title: 'Sharpen the stack',
                                    body: 'Match the right tool to the week you are in.',
                                },
                                {
                                    href: '/resources',
                                    eyebrow: 'Library',
                                    title: 'Keep references close',
                                    body: 'Use guides and notes as the support layer behind execution.',
                                },
                                {
                                    href: '/roadmap',
                                    eyebrow: 'Roadmap',
                                    title: 'See the full route',
                                    body: 'Use the staged sequence when you need structure before action.',
                                },
                                {
                                    href: '/canvas',
                                    eyebrow: 'Studio',
                                    title: 'Make rough work visible',
                                    body: 'Use the studio for sketches, systems thinking, and experiments.',
                                },
                            ].map((surface) => (
                                <Link
                                    key={surface.href}
                                    href={surface.href}
                                    className="rounded-[1.4rem] border border-border bg-background/72 p-4 transition-colors hover:border-primary/25 hover:bg-background"
                                >
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        {surface.eyebrow}
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-foreground">
                                        {surface.title}
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                        {surface.body}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Metric({
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
