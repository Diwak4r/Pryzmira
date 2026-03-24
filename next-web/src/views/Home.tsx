import Link from 'next/link';
import {
    ArrowRight,
    BookOpen,
    BookmarkCheck,
    Compass,
    LibraryBig,
    Sparkles,
    Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const routes = [
    {
        href: '/categories',
        eyebrow: 'Atlas',
        title: 'Browse the curated course index.',
        body: 'Move through categories, recent views, and structured filters when you already know you want to learn.',
        accent: '130+',
    },
    {
        href: '/ai-tools',
        eyebrow: 'Tools',
        title: 'Compare useful tooling with sharper judgment.',
        body: 'Scan the tool directory, filter by category or pricing, and compare live search notes against the curated list.',
        accent: '64+',
    },
    {
        href: '/desk',
        eyebrow: 'Desk',
        title: 'Return to your saved shortlist and recent momentum.',
        body: 'Keep the courses, tools, and references you chose in one personal working surface built for repeat visits.',
        accent: 'Desk',
    },
    {
        href: '/resources',
        eyebrow: 'Archive',
        title: 'Open the references and field notes collection.',
        body: 'Keep study material, motivation, and compact tips inside a calmer private archive once unlocked.',
        accent: 'Vault',
    },
    {
        href: '/roadmap',
        eyebrow: 'Roadmap',
        title: 'Follow a route with a reasoned order.',
        body: 'Use the staged roadmap when the problem is not choosing a single course, but choosing the next chapter.',
        accent: '06',
    },
];

export default function Home() {
    return (
        <div className="space-y-16 pb-16">
            <section className="page-shell">
                <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
                    <div className="space-y-6">
                        <span className="brand-chip">
                            <span className="brand-chip-dot" />
                            Pryzmira front door
                        </span>
                        <div className="space-y-4">
                            <p className="section-kicker">Signal-first learning system</p>
                            <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                                A more deliberate way to find what to learn, what to use, and where to go next.
                            </h1>
                            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                Pryzmira is not a feed. It is a structured surface for courses,
                                tools, study references, and the route between them.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="rounded-full px-6 py-6 text-sm font-semibold">
                                <Link href="/categories" className="editorial-link">
                                    Enter the atlas
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-6 py-6 text-sm font-semibold">
                                <Link href="/roadmap">See the route</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <p className="section-kicker">How to use Pryzmira</p>
                                <h2 className="text-4xl text-display text-balance">
                                    Five surfaces. Five different jobs.
                                </h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className="rounded-[1.4rem] border border-border bg-background/72 p-4 transition-colors hover:border-primary/25 hover:bg-background"
                                    >
                                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                            {route.eyebrow}
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {route.title}
                                        </p>
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                            {route.body}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-shell grid gap-6 border-y border-border py-8 md:grid-cols-3">
                {[
                    {
                        icon: Compass,
                        title: 'Choose the right surface first',
                        body: 'The homepage clarifies whether you need discovery, tools, references, or an ordered path.',
                    },
                    {
                        icon: LibraryBig,
                        title: 'Use curated collections, not feeds',
                        body: 'Each product area is organized to reduce noise and bring the next useful move closer.',
                    },
                    {
                        icon: BookmarkCheck,
                        title: 'Keep a personal layer inside the product',
                        body: 'The desk gives returning users a durable reason to reopen Pryzmira instead of starting from zero.',
                    },
                    {
                        icon: Target,
                        title: 'Turn reading into momentum',
                        body: 'Pryzmira is built to shorten the gap between finding signal and acting on it.',
                    },
                ].map((item) => (
                    <div key={item.title} className="space-y-3">
                        <item.icon className="h-5 w-5 text-primary" />
                        <p className="section-kicker">{item.title}</p>
                        <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                    </div>
                ))}
            </section>

            <section className="page-shell grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {routes.map((route) => (
                    <Link
                        key={`${route.href}-card`}
                        href={route.href}
                        className="paper-soft hover-rise rounded-[1.7rem] p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    {route.eyebrow}
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {route.accent}
                                </p>
                            </div>
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-5 text-lg font-semibold text-foreground">{route.title}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{route.body}</p>
                    </Link>
                ))}
            </section>

            <section className="page-shell">
                <div className="paper-panel rounded-[2rem] p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                        <div className="space-y-4">
                            <p className="section-kicker">Start point</p>
                            <h2 className="text-4xl text-display text-balance">
                                If you are unsure what to open first, start with the roadmap, then return to the atlas.
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm leading-7 text-muted-foreground">
                                That sequence gives new users a structure first and abundance second.
                                It keeps the site from feeling like a pile of links and makes the
                                rest of the product easier to trust.
                            </p>
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <Link href="/roadmap" className="editorial-link">
                                    Open the roadmap
                                    <BookOpen className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
