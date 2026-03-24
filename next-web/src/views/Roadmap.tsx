'use client';

import { motion } from 'framer-motion';
import {
    ArrowRight,
    BrainCircuit,
    Cloud,
    Code2,
    Globe,
    Heart,
    Rocket,
    Server,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const roadmapData = [
    {
        id: 1,
        title: 'Foundations of computer science',
        description:
            'Where every strong technical path begins: syntax, thinking, debugging, and core data structures.',
        icon: Code2,
        status: 'completed' as const,
        topics: ['Python or C++', 'Data structures', 'Algorithms', 'Git and GitHub'],
        emotion: 'This is where the fog lifts and computing starts to feel legible.',
        link: '/categories?cat=Coding',
    },
    {
        id: 2,
        title: 'Web development',
        description:
            'Learn how interfaces, state, APIs, and product decisions come together in something people can actually use.',
        icon: Globe,
        status: 'in-progress' as const,
        topics: ['HTML, CSS, and JavaScript', 'React and Next.js', 'Responsive systems', 'Shipping to production'],
        emotion: 'Shipping something public changes how you think forever.',
        link: '/categories?cat=Web Dev',
    },
    {
        id: 3,
        title: 'Backend and data',
        description:
            'Move from screens to systems: storage, authentication, APIs, reliability, and the shape of production software.',
        icon: Server,
        status: 'locked' as const,
        topics: ['Node.js', 'PostgreSQL', 'APIs', 'Auth and security'],
        emotion: 'You start seeing every product as flows, contracts, and state.',
        link: '/categories',
    },
    {
        id: 4,
        title: 'AI and machine learning',
        description:
            'Go beyond using tools and learn the foundations behind models, agents, language systems, and evaluation.',
        icon: BrainCircuit,
        status: 'locked' as const,
        topics: ['Python for ML', 'Neural networks', 'NLP and LLMs', 'Model evaluation'],
        emotion: 'This is when the black box turns back into engineering.',
        link: '/categories?cat=AI',
    },
    {
        id: 5,
        title: 'Cloud and DevOps',
        description:
            'Deployment, infrastructure, observability, and the systems work that keeps useful software alive.',
        icon: Cloud,
        status: 'locked' as const,
        topics: ['AWS and cloud basics', 'Docker', 'CI/CD', 'Monitoring'],
        emotion: 'You stop treating uptime and reliability like somebody else’s job.',
        link: '/categories?cat=Cloud',
    },
    {
        id: 6,
        title: 'Security and engineering ethics',
        description:
            'Understand the responsibility that comes with building systems people trust and rely on.',
        icon: Shield,
        status: 'locked' as const,
        topics: ['Threat awareness', 'Secure design', 'Privacy', 'Responsible systems'],
        emotion: 'You begin designing for consequences, not only functionality.',
        link: '/categories?cat=Cybersecurity',
    },
];

export default function Roadmap() {
    return (
        <div className="space-y-16 pb-16">
            <section className="page-shell">
                <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr]">
                    <div className="space-y-6">
                        <span className="brand-chip">
                            <span className="brand-chip-dot" />
                            Learning route
                        </span>
                        <div className="space-y-4">
                            <p className="section-kicker">From zero to working engineer</p>
                            <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                                A path built for consistency, not burnout.
                            </h1>
                            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                The roadmap is opinionated on purpose. Each stage has a job, a mindset shift,
                                and a reason it sits where it does.
                            </p>
                        </div>
                    </div>

                    <div className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-[1.4rem] border border-border bg-background/72 p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Stages
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-foreground">
                                    {roadmapData.length}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Chapters in the route.
                                </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-border bg-background/72 p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Open now
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-foreground">
                                    {roadmapData.filter((step) => step.status !== 'locked').length}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Stages currently actionable.
                                </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-border bg-background/72 p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Principle
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-foreground">Depth</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Before decoration.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-[1.6rem] border border-border bg-background/68 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
                                    <Rocket className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                        Guiding principle
                                    </p>
                                    <p className="text-lg font-semibold text-foreground">
                                        Depth before decoration
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                The route rewards consistency: foundations first, visible building second, then
                                production systems, then specialization. Each phase should unlock confidence,
                                not just another checklist.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="page-shell">
                <div className="space-y-6">
                    {roadmapData.map((step, index) => {
                        const isOpen = step.status !== 'locked';
                        const statusLabel =
                            step.status === 'completed'
                                ? 'Completed'
                                : step.status === 'in-progress'
                                  ? 'In progress'
                                  : 'Locked';

                        return (
                            <motion.article
                                key={step.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-120px' }}
                                transition={{ duration: 0.4, delay: index * 0.04 }}
                                className="paper-panel rounded-[2rem] p-6 md:p-8"
                            >
                                <div className="grid gap-8 lg:grid-cols-[120px_1fr_0.72fr]">
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                            Stage {String(step.id).padStart(2, '0')}
                                        </p>
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] ${
                                                step.status === 'completed'
                                                    ? 'bg-[hsl(var(--brand-olive)/0.12)] text-[hsl(var(--brand-olive))]'
                                                    : step.status === 'in-progress'
                                                      ? 'bg-primary/10 text-primary'
                                                      : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <step.icon className="h-7 w-7" />
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                                        step.status === 'completed'
                                                            ? 'bg-[hsl(var(--brand-olive)/0.12)] text-[hsl(var(--brand-olive))]'
                                                            : step.status === 'in-progress'
                                                              ? 'bg-primary/10 text-primary'
                                                              : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <h2 className="text-4xl text-display">{step.title}</h2>
                                            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            {step.topics.map((topic) => (
                                                <div
                                                    key={topic}
                                                    className="rounded-[1.2rem] border border-border bg-background/70 px-4 py-3 text-sm text-foreground"
                                                >
                                                    {topic}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                                            <div className="flex items-start gap-3">
                                                <Heart className="mt-1 h-4 w-4 text-primary" />
                                                <p className="text-sm leading-7 text-muted-foreground">
                                                    {step.emotion}
                                                </p>
                                            </div>
                                        </div>
                                        {isOpen && (
                                            <Button asChild className="w-full rounded-full">
                                                <Link href={step.link} className="editorial-link">
                                                    {step.status === 'completed'
                                                        ? 'Review this stage'
                                                        : 'Continue this stage'}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
