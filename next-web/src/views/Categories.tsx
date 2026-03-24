'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Compass,
    LayoutGrid,
    List,
    Search,
    Sparkles,
} from 'lucide-react';
import coursesData from '@/data/courses.json';
import CourseCard from '@/components/CourseCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import PageHero from '@/components/PageHero';
import { RecentCourse, getRecentCourses } from '@/lib/recentlyViewed';
import {
    getSavedCourses,
    getSavedResources,
    getSavedTools,
    subscribeToPersonalDataUpdates,
} from '@/lib/personalDesk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type SortOption = 'popular' | 'rating' | 'newest' | 'duration';

const categoryLabels: Record<string, string> = {
    'Web Dev': 'Web development',
    DSA: 'Algorithms and DSA',
    'System Design': 'System design',
    'Mobile Dev': 'Mobile apps',
    DevOps: 'DevOps',
    Cloud: 'Cloud',
    'Game Dev': 'Game development',
    Finance: 'Finance and business',
    Coding: 'Core coding',
    AI: 'AI and ML',
    'Data Science': 'Data science',
    Cybersecurity: 'Cybersecurity',
    Blockchain: 'Blockchain',
    'UI/UX': 'UI and UX',
};

const featuredCategories = [
    'AI',
    'System Design',
    'Web Dev',
    'Cybersecurity',
];

export default function Categories({
    initialCategory = 'All',
}: {
    initialCategory?: string;
}) {
    const categories = useMemo(() => ['All', ...Object.keys(categoryLabels)], []);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(
        categories.includes(initialCategory) ? initialCategory : 'All'
    );
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [visibleCount, setVisibleCount] = useState(9);
    const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
    const [savedCounts, setSavedCounts] = useState({ courses: 0, tools: 0, resources: 0 });
    const deferredSearch = useDeferredValue(search);

    const filteredCourses = useMemo(() => {
        const query = deferredSearch.toLowerCase().trim();
        const terms = query.split(/\s+/).filter(Boolean);

        const result = coursesData.filter((course) => {
            const matchesCategory =
                selectedCategory === 'All' || course.category === selectedCategory;

            const matchesSearch =
                terms.length === 0 ||
                terms.every((term) =>
                    [
                        course.title,
                        course.instructor,
                        course.category,
                        course.description,
                        ...(course.tags || []),
                    ].some((field) => field.toLowerCase().includes(term))
                );

            return matchesCategory && matchesSearch;
        });

        return [...result].sort((left, right) => {
            switch (sortBy) {
                case 'rating':
                    return (right.rating || 0) - (left.rating || 0);
                case 'newest':
                    return right.id - left.id;
                case 'duration':
                    return parseInt(right.duration, 10) - parseInt(left.duration, 10);
                case 'popular':
                default:
                    return (right.students || 0) - (left.students || 0);
            }
        });
    }, [deferredSearch, selectedCategory, sortBy]);

    const displayedCourses = filteredCourses.slice(0, visibleCount);
    const popularCourses = [...coursesData]
        .sort((left, right) => (right.students || 0) - (left.students || 0))
        .slice(0, 3);

    useEffect(() => {
        // Sync recent items from localStorage after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecentCourses(getRecentCourses());
    }, []);

    useEffect(() => {
        const syncSavedCounts = () => {
            setSavedCounts({
                courses: getSavedCourses().length,
                tools: getSavedTools().length,
                resources: getSavedResources().length,
            });
        };

        syncSavedCounts();
        return subscribeToPersonalDataUpdates(syncSavedCounts);
    }, []);

    return (
        <div className="space-y-16 pb-16">
            <PageHero
                chip="Atlas issue 01"
                kicker="Built for serious learners"
                title="A calmer map through AI, systems, design, and everything worth studying next."
                description="Pryzmira trims the junk. You get a student-led atlas of worthwhile courses, practical sequences, and better routes into modern tech."
                actions={[
                    { href: '#catalog', label: 'Open the catalog' },
                    { href: '/roadmap', label: 'See the roadmap', variant: 'outline' },
                ]}
                stats={[
                    {
                        value: <AnimatedCounter value={130} suffix="+" />,
                        label: 'Courses that survived the cut',
                    },
                    {
                        value: <AnimatedCounter value={64} suffix="+" />,
                        label: 'AI tools worth bookmarking',
                    },
                    {
                        value: <AnimatedCounter value={10} suffix="k+" />,
                        label: 'Learners the atlas is built for',
                    },
                ]}
                asideKicker="What this page does"
                asideTitle="Find the next thing to learn without getting buried in tabs."
                asideBody="The atlas combines category paths, recent activity, search, and sorting so a learner can move from curiosity to a confident next step."
                highlights={featuredCategories.map((category, index) => ({
                    label: `Track ${String(index + 1).padStart(2, '0')}`,
                    title: categoryLabels[category],
                }))}
                footnote="Each path here is meant to get someone from curiosity to useful momentum. The goal is not infinite choice. It is a better next step."
            />

            <section className="section-shell grid gap-6 border-y border-border py-8 md:grid-cols-3">
                {[
                    {
                        title: 'Curated by an actual person',
                        body: 'Selection beats accumulation. The site is designed to help you decide, not just browse forever.',
                    },
                    {
                        title: 'Navigation built around intent',
                        body: 'Search, sort, category paths, and roadmap links all point toward the next useful action.',
                    },
                    {
                        title: 'Signal-first hierarchy',
                        body: 'The design keeps the catalog legible, tactile, and fast to scan across desktop and mobile.',
                    },
                ].map((item) => (
                    <div key={item.title} className="space-y-3">
                        <p className="section-kicker">{item.title}</p>
                        <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                    </div>
                ))}
            </section>

            {recentCourses.length > 0 && (
                <section className="page-shell space-y-5">
                    <div>
                        <p className="section-kicker">Welcome back</p>
                        <h2 className="text-4xl text-display">Continue where you left off</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {recentCourses.map((course) => (
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
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {course.instructor}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {(savedCounts.courses > 0 || savedCounts.tools > 0 || savedCounts.resources > 0) && (
                <section className="page-shell">
                    <div className="paper-panel rounded-[2rem] p-6 md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-3">
                                <p className="section-kicker">Your desk</p>
                                <h2 className="text-4xl text-display text-balance">
                                    Your saved shortlist is ready when you return.
                                </h2>
                                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                    Pryzmira now keeps your chosen courses, tools, and references in
                                    one place so the platform behaves more like a working desk than a
                                    disposable browse session.
                                </p>
                            </div>
                            <Button asChild className="rounded-full px-6">
                                <Link href="/desk" className="editorial-link">
                                    Open your desk
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <div className="paper-soft rounded-[1.5rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Courses
                                </p>
                                <p className="mt-3 text-3xl font-semibold">{savedCounts.courses}</p>
                            </div>
                            <div className="paper-soft rounded-[1.5rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Tools
                                </p>
                                <p className="mt-3 text-3xl font-semibold">{savedCounts.tools}</p>
                            </div>
                            <div className="paper-soft rounded-[1.5rem] p-5">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Resources
                                </p>
                                <p className="mt-3 text-3xl font-semibold">{savedCounts.resources}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section id="catalog" className="page-shell space-y-8">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-5">
                        <p className="section-kicker">Catalog</p>
                        <h2 className="max-w-xl text-4xl text-display text-balance md:text-5xl">
                            Discovery should feel like reading a well-edited index, not a dashboard.
                        </h2>
                        <p className="max-w-lg text-base leading-8 text-muted-foreground">
                            Search what you need, narrow by track, and switch between a visual grid or
                            compact list depending on how you like to browse.
                        </p>
                        <div className="paper-soft rounded-[1.5rem] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Now showing
                            </p>
                            <p className="mt-3 text-3xl font-semibold">{filteredCourses.length} courses</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {selectedCategory === 'All'
                                    ? 'Across all tracks'
                                    : `Inside ${categoryLabels[selectedCategory] || selectedCategory}`}
                            </p>
                        </div>
                    </div>

                    <div className="paper-panel rounded-[2rem] p-5 md:p-6">
                        <div className="grid gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search courses, instructors, or topics"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setVisibleCount(9);
                                    }}
                                    className="h-12 rounded-full border-border bg-card pl-11 pr-5"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setVisibleCount(9);
                                        }}
                                        className={`rounded-full px-4 py-2 text-sm transition-colors ${
                                            selectedCategory === category
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-border bg-background/70 text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {category === 'All'
                                            ? 'All tracks'
                                            : categoryLabels[category] || category}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => {
                                        setSortBy(value as SortOption);
                                        setVisibleCount(9);
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-full border-border bg-background/70 md:w-[220px]">
                                        <SelectValue placeholder="Sort catalog" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popular">Most popular</SelectItem>
                                        <SelectItem value="rating">Highest rated</SelectItem>
                                        <SelectItem value="newest">Newest added</SelectItem>
                                        <SelectItem value="duration">Longest duration</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="inline-flex rounded-full border border-border bg-background/70 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-full px-3 py-2 ${
                                            viewMode === 'grid'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground'
                                        }`}
                                        aria-label="Grid view"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-full px-3 py-2 ${
                                            viewMode === 'list'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground'
                                        }`}
                                        aria-label="List view"
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_0.32fr]">
                    <div className={viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
                        <AnimatePresence mode="popLayout">
                            {displayedCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    layout
                                    initial={{ opacity: 0, y: 22 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.22, delay: index < 6 ? index * 0.02 : 0 }}
                                >
                                    <CourseCard course={course} isCompact={viewMode === 'list'} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <aside className="space-y-4">
                        <div className="paper-panel rounded-[1.8rem] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Compass className="h-4 w-4" />
                                Popular starts
                            </div>
                            <div className="mt-5 space-y-4">
                                {popularCourses.map((course) => (
                                    <Link
                                        key={course.id}
                                        href={`/course/${course.id}`}
                                        className="block border-t border-border/70 pt-4"
                                    >
                                        <p className="text-sm text-muted-foreground">{course.category}</p>
                                        <p className="mt-1 font-semibold leading-6 text-foreground">
                                            {course.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="paper-soft rounded-[1.8rem] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                <Sparkles className="h-4 w-4" />
                                Need a route?
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                If you are not sure what to learn next, the roadmap page is a better
                                starting point than random browsing.
                            </p>
                            <Button asChild variant="ghost" className="mt-4 px-0 text-sm font-semibold">
                                <Link href="/roadmap" className="editorial-link">
                                    Open the roadmap
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </aside>
                </div>

                {filteredCourses.length === 0 && (
                    <div className="paper-panel rounded-[1.8rem] px-6 py-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-3xl text-display">No matching courses</h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                            Try a broader term, switch tracks, or clear the filters to reopen the catalog.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-6 rounded-full"
                            onClick={() => {
                                setSearch('');
                                setSelectedCategory('All');
                                setSortBy('popular');
                            }}
                        >
                            Reset catalog
                        </Button>
                    </div>
                )}

                {visibleCount < filteredCourses.length && (
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full px-6"
                            onClick={() =>
                                setVisibleCount((current) =>
                                    Math.min(current + 9, filteredCourses.length)
                                )
                            }
                        >
                            Load more
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}
