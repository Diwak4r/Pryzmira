'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Globe, Search, Sparkles } from 'lucide-react';
import { aiTools } from '@/data/mockData';
import ToolCard from '@/components/ToolCard';
import { RecentTool, getRecentTools } from '@/lib/recentlyViewed';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TavilyResult {
    title: string;
    url: string;
    snippet: string;
}

export default function AITools() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [pricingFilter, setPricingFilter] = useState<'All' | 'Free' | 'Freemium' | 'Paid'>('All');
    const [liveResults, setLiveResults] = useState<TavilyResult[]>([]);
    const [liveAnswer, setLiveAnswer] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [recentTools, setRecentTools] = useState<RecentTool[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const deferredSearch = useDeferredValue(search);

    const categories = useMemo(
        () => ['All', ...Array.from(new Set(aiTools.map((tool) => tool.category))).sort()],
        []
    );

    const filteredTools = useMemo(
        () =>
            aiTools.filter((tool) => {
                const matchesSearch =
                    tool.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    tool.description.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    tool.tags.some((tag) =>
                        tag.toLowerCase().includes(deferredSearch.toLowerCase())
                    );

                const matchesCategory =
                    categoryFilter === 'All' || tool.category === categoryFilter;
                const matchesPricing =
                    pricingFilter === 'All' || tool.pricing === pricingFilter;

                return matchesSearch && matchesCategory && matchesPricing;
            }),
        [categoryFilter, deferredSearch, pricingFilter]
    );

    const searchLive = useCallback(async (query: string) => {
        if (query.length < 3) {
            setLiveResults([]);
            setLiveAnswer('');
            setHasSearched(false);
            return;
        }

        setIsSearching(true);

        try {
            const response = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const payload = await response.json();
                setLiveResults(payload.results || []);
                setLiveAnswer(payload.answer || '');
                setHasSearched(true);
            } else if (response.status === 503) {
                setHasSearched(false);
            }
        } catch {
            setHasSearched(false);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearch = (value: string) => {
        setSearch(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            void searchLive(value);
        }, 600);
    };

    const featuredTools = aiTools.filter((tool) => tool.featured).slice(0, 4);

    useEffect(() => {
        setRecentTools(getRecentTools());
    }, []);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-16 pb-16">
            <section className="page-shell grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="space-y-6">
                    <span className="brand-chip">
                        <span className="brand-chip-dot" />
                        Tool directory
                    </span>
                    <div className="space-y-4">
                        <p className="section-kicker">AI tools worth your time</p>
                        <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                            Useful tooling, filtered through actual judgment instead of launch-day hype.
                        </h1>
                        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                            Browse the catalog by category, pricing, or live web search. The goal is
                            faster judgment, not more chaos.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Directory
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-foreground">
                                {aiTools.length}+
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Curated tools in the working list.
                            </p>
                        </div>
                        <div className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Categories
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-foreground">
                                {categories.length - 1}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Tracked product buckets.
                            </p>
                        </div>
                        <div className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Search
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-foreground">Live</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Web research layered into the catalog.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="paper-panel poster-shadow rounded-[2rem] p-6 md:p-8">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <p className="section-kicker">Search and compare</p>
                            <h2 className="text-4xl text-display text-balance">
                                Pull live context first, then narrow the directory with intent.
                            </h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(event) => handleSearch(event.target.value)}
                                placeholder="Search tools, categories, or use cases"
                                className="h-12 rounded-full border-border bg-card pl-11 pr-5"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setCategoryFilter(category)}
                                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                                        categoryFilter === category
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border bg-background/70 text-muted-foreground'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(['All', 'Free', 'Freemium', 'Paid'] as const).map((pricing) => (
                                <button
                                    key={pricing}
                                    type="button"
                                    onClick={() => setPricingFilter(pricing)}
                                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                                        pricingFilter === pricing
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border bg-background/70 text-muted-foreground'
                                    }`}
                                >
                                    {pricing}
                                </button>
                            ))}
                        </div>
                        <div className="rounded-[1.5rem] border border-border bg-background/72 p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Featured shortlist
                            </p>
                            <div className="mt-4 space-y-4">
                                {featuredTools.slice(0, 3).map((tool) => (
                                    <div key={tool.id} className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                            {tool.category}
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {tool.name}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            {tool.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                            {isSearching
                                ? 'Searching the live web...'
                                : `${filteredTools.length} curated tools currently match your filters.`}
                        </p>
                    </div>
                </div>
            </section>

            {(hasSearched || liveAnswer) && (
                <section className="page-shell space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        Live web notes
                    </div>
                    {liveAnswer && (
                        <Card className="paper-soft rounded-[1.6rem] p-5">
                            <p className="text-sm leading-7 text-foreground">{liveAnswer}</p>
                        </Card>
                    )}
                    {liveResults.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {liveResults.slice(0, 6).map((result) => (
                                <a
                                    key={`${result.url}-${result.title}`}
                                    href={result.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="paper-soft hover-rise rounded-[1.5rem] p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-semibold text-foreground">
                                                {result.title}
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                {result.snippet}
                                            </p>
                                        </div>
                                        <ExternalLink className="mt-1 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {recentTools.length > 0 && (
                <section className="page-shell space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="section-kicker">Continue exploring</p>
                            <h2 className="text-4xl text-display">Recently opened tools</h2>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {recentTools.map((tool) => (
                            <a
                                key={tool.id}
                                href={tool.url}
                                target="_blank"
                                rel="noreferrer"
                                className="paper-soft hover-rise rounded-[1.5rem] p-5"
                            >
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    {tool.category}
                                </p>
                                <p className="mt-2 text-xl font-semibold text-foreground">
                                    {tool.name}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Reopen where you left off.
                                </p>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            <section className="page-shell space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="section-kicker">Curated directory</p>
                        <h2 className="text-4xl text-display">Browse the catalog</h2>
                    </div>
                    <div className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
                        {filteredTools.length} tools
                    </div>
                </div>

                <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool) => (
                            <motion.div
                                key={tool.id}
                                layout
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.22 }}
                            >
                                <ToolCard tool={tool} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredTools.length === 0 && !isSearching && (
                    <div className="paper-panel rounded-[1.8rem] px-6 py-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-3xl text-display">No tools match this pass</h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                            Clear the filters or search for a broader term to reopen the directory.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-6 rounded-full"
                            onClick={() => {
                                setSearch('');
                                setCategoryFilter('All');
                                setPricingFilter('All');
                                setLiveResults([]);
                                setLiveAnswer('');
                                setHasSearched(false);
                            }}
                        >
                            Reset filters
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}
