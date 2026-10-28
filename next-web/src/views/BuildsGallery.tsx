'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, RefreshCw, Search, X } from 'lucide-react';
import BuildCard from '@/components/BuildCard';
import { Button } from '@/components/ui/button';
import { BUILD_CATEGORIES, BUILD_PLATFORMS, modelLabel, modelVendors, vendorOfModel } from '@/lib/builds/catalog';
import { collectFacets, filterBuilds, sortBuilds } from '@/lib/builds/normalize';
import type {
    AiBuild,
    BuildFeed,
    BuildFeedResponse,
    BuildProvenance,
    BuildSort,
} from '@/lib/builds/types';

const SORT_OPTIONS: Array<{ id: BuildSort; label: string }> = [
    { id: 'recent', label: 'Newest first' },
    { id: 'trending', label: 'Trending' },
    { id: 'az', label: 'A to Z' },
];

const PROVENANCE_OPTIONS: Array<{ id: BuildProvenance | 'all'; label: string }> = [
    { id: 'all', label: 'Everything' },
    { id: 'live', label: 'Live only' },
    { id: 'curated', label: 'Curated only' },
];

function formatUtcTime(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
        return 'recently';
    }

    return `${parsed.toISOString().slice(11, 16)} UTC`;
}

function StatusPill({
    label,
    state,
    detail,
}: {
    label: string;
    state: 'live' | 'quiet' | 'error';
    detail?: string;
}) {
    const tone =
        state === 'live'
            ? 'border-primary/30 bg-primary/5 text-foreground'
            : state === 'error'
              ? 'border-destructive/30 bg-destructive/5 text-destructive'
              : 'border-border bg-card text-muted-foreground';

    return (
        <span
            title={detail}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[0.65rem] ${tone}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    state === 'live' ? 'bg-primary' : state === 'error' ? 'bg-destructive' : 'bg-muted-foreground/40'
                }`}
                aria-hidden
            />
            {label}
        </span>
    );
}

export default function BuildsGallery({ initialFeed }: { initialFeed: BuildFeed }) {
    const [feed, setFeed] = useState<BuildFeed>(initialFeed);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [model, setModel] = useState<string>('all');
    const [platform, setPlatform] = useState<string>('all');
    const [provenance, setProvenance] = useState<BuildProvenance | 'all'>('all');
    const [sort, setSort] = useState<BuildSort>('recent');
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const facets = useMemo(() => collectFacets(feed.items), [feed.items]);

    const visible = useMemo(() => {
        const filtered = filterBuilds(feed.items, {
            query,
            category: category as AiBuild['category'] | 'all',
            model,
            platform: platform as AiBuild['source']['platform'] | 'all',
            provenance,
        });

        return sortBuilds(filtered, sort);
    }, [feed.items, query, category, model, platform, provenance, sort]);

    const activeFilters =
        (query.trim() ? 1 : 0) +
        [category, model, platform, provenance].filter((value) => value !== 'all').length;

    const modelsByVendor = useMemo(() => {
        const available = new Set(Object.keys(facets.models));
        return modelVendors()
            .map((vendor) => ({
                vendor,
                models: Object.keys(facets.models)
                    .filter((id) => available.has(id) && vendorOfModel(id) === vendor)
                    .sort((left, right) => modelLabel(left).localeCompare(modelLabel(right))),
            }))
            .filter((group) => group.models.length > 0);
    }, [facets.models]);

    const resetFilters = () => {
        setQuery('');
        setCategory('all');
        setModel('all');
        setPlatform('all');
        setProvenance('all');
        setSort('recent');
    };

    const refresh = async () => {
        setRefreshing(true);
        setError('');

        try {
            // `refresh=1` asks the server to bypass its feed cache. The server
            // throttles forced pulls to once a minute.
            const response = await fetch('/api/builds?limit=100&refresh=1', { cache: 'no-store' });
            const payload = (await response.json()) as BuildFeedResponse & { error?: string };

            if (!response.ok) {
                throw new Error(payload.error || 'Unable to refresh builds.');
            }

            setFeed({ items: payload.items || [], meta: payload.meta });
        } catch (refreshError) {
            setError(refreshError instanceof Error ? refreshError.message : 'Unable to refresh builds.');
        } finally {
            setRefreshing(false);
        }
    };

    const sourcePills = feed.meta.sources.map((source) => {
        const label = source.platform === 'x' ? 'X' : source.platform === 'github' ? 'GitHub' : source.platform;

        if (source.status === 'live') {
            return (
                <StatusPill key={source.platform} label={`${label} - ${source.count} live`} state="live" />
            );
        }

        if (source.status === 'error') {
            return (
                <StatusPill
                    key={source.platform}
                    label={`${label} - unavailable`}
                    state="error"
                    detail={source.detail}
                />
            );
        }

        return (
            <StatusPill
                key={source.platform}
                label={`${label} - not connected`}
                state="quiet"
                detail={source.detail}
            />
        );
    });

    return (
        <div className="wide-container pb-20 pt-8 md:pt-12">
            <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                        Build gallery
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                        Built with AI models
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        What people are shipping with Claude, GPT, Gemini, Llama, FLUX, and friends. Pulled
                        from X and GitHub when those sources are connected, plus a hand-picked starter set.
                        Every card names the model and links back to the source.
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refresh}
                        disabled={refreshing}
                        className="gap-1.5"
                        title="Pull live sources again. Forced at most once a minute."
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing' : 'Refresh'}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/guide#builds">How this feed works</Link>
                    </Button>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {sourcePills}
                <StatusPill
                    label={`${feed.meta.counts.curated} curated picks`}
                    state="quiet"
                    detail="Hand-picked entries that ship with the app."
                />
                <span className="ml-auto font-mono text-[0.65rem] text-muted-foreground/70">
                    {feed.items.length} builds - updated {formatUtcTime(feed.meta.generatedAt)}
                </span>
            </div>

            {feed.meta.curatedOnly && (
                <div className="mt-4 rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    Live sources are quiet right now, so you are seeing the curated starter set. Add{' '}
                    <code className="rounded bg-background px-1 py-0.5 font-mono text-[0.7rem]">X_BEARER_TOKEN</code>{' '}
                    (and optionally{' '}
                    <code className="rounded bg-background px-1 py-0.5 font-mono text-[0.7rem]">GITHUB_TOKEN</code>) to
                    pull fresh posts. Setup steps live in the{' '}
                    <Link href="/guide#builds" className="text-foreground underline underline-offset-2">
                        guide
                    </Link>
                    .
                </div>
            )}

            <div className="mt-5 space-y-2">
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search builds, makers, models, tools..."
                        aria-label="Search builds"
                        className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        aria-label="Filter by category"
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                        <option value="all">All categories</option>
                        {BUILD_CATEGORIES.filter((entry) => facets.categories[entry.id]).map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.label} ({facets.categories[entry.id]})
                            </option>
                        ))}
                    </select>

                    <select
                        value={model}
                        onChange={(event) => setModel(event.target.value)}
                        aria-label="Filter by model"
                        className="h-8 max-w-[15rem] rounded-md border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                        <option value="all">All models</option>
                        {modelsByVendor.map((group) => (
                            <optgroup key={group.vendor} label={group.vendor}>
                                {group.models.map((id) => (
                                    <option key={id} value={id}>
                                        {modelLabel(id)} ({facets.models[id]})
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    <select
                        value={platform}
                        onChange={(event) => setPlatform(event.target.value)}
                        aria-label="Filter by source"
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                        <option value="all">All sources</option>
                        {BUILD_PLATFORMS.filter((entry) => facets.platforms[entry.id]).map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.label} ({facets.platforms[entry.id]})
                            </option>
                        ))}
                    </select>

                    <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value as BuildSort)}
                        aria-label="Sort builds"
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
                        {PROVENANCE_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setProvenance(option.id)}
                                className={`rounded-sm px-2 py-1 text-[0.68rem] transition-colors ${
                                    provenance === option.id
                                        ? 'bg-secondary text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                            Clear {activeFilters}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                <span>
                    {visible.length} {visible.length === 1 ? 'build' : 'builds'}
                </span>
                {activeFilters > 0 && <span>{activeFilters} filter{activeFilters > 1 ? 's' : ''} active</span>}
            </div>

            {error && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                    <span className="flex-1">{error}</span>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="shrink-0 text-destructive/60 hover:text-destructive"
                        aria-label="Dismiss"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {visible.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((build) => (
                        <BuildCard key={build.id} build={build} />
                    ))}
                </div>
            ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-md border border-dashed border-border px-4 py-16 text-center">
                    <Filter className="h-5 w-5 text-muted-foreground" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-foreground">No builds match those filters</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Try a shorter search, or clear the filters and start again.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                        Clear filters
                    </Button>
                </div>
            )}

            <div className="mt-10 grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-3">
                <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        What counts
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Anything someone shipped with a known AI model or AI-native tool. A post with no
                        detectable model or tool is dropped rather than guessed at.
                    </p>
                </div>
                <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        Live sources
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        X uses the v2 recent-search API and GitHub uses repository search. Both are cached
                        for a few minutes and fail quietly into the curated set.
                    </p>
                </div>
                <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        Curated picks
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Hand-picked examples with verified links. They use the catalog date instead of a
                        launch date, and only list models the team has said they build on.
                    </p>
                </div>
            </div>
        </div>
    );
}
