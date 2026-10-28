import { NextResponse } from 'next/server';
import { canForceRefresh, fetchBuildFeed } from '@/lib/builds/feed';
import {
    collectFacets,
    filterBuilds,
    isBuildCategory,
    isBuildPlatform,
    isBuildSort,
    sortBuilds,
} from '@/lib/builds/normalize';
import type { BuildFilters, BuildProvenance, BuildSort } from '@/lib/builds/types';

export const dynamic = 'force-dynamic';

/** Process-local timestamp of the last forced pull, used to throttle refreshes. */
let lastForcedRefreshAt: number | null = null;

function parseLimit(raw: string | null): number {
    const parsed = Number.parseInt(raw || '', 10);
    if (!Number.isFinite(parsed)) {
        return 60;
    }

    return Math.min(100, Math.max(1, parsed));
}

function parseProvenance(raw: string | null): BuildProvenance | 'all' {
    return raw === 'curated' || raw === 'live' ? raw : 'all';
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category');
        const platform = url.searchParams.get('platform');
        const sortParam = url.searchParams.get('sort');

        const filters: BuildFilters = {
            query: url.searchParams.get('q')?.trim() || undefined,
            category: category && isBuildCategory(category) ? category : 'all',
            model: url.searchParams.get('model') || 'all',
            vendor: url.searchParams.get('vendor') || 'all',
            platform: platform && isBuildPlatform(platform) ? platform : 'all',
            provenance: parseProvenance(url.searchParams.get('provenance')),
        };

        const sort: BuildSort = sortParam && isBuildSort(sortParam) ? sortParam : 'recent';

        const wantsRefresh = url.searchParams.get('refresh') === '1';
        const nowMs = Date.now();
        const force = wantsRefresh && canForceRefresh(lastForcedRefreshAt, nowMs);
        if (force) {
            lastForcedRefreshAt = nowMs;
        }

        const feed = await fetchBuildFeed({ useCache: !force });
        const filtered = sortBuilds(filterBuilds(feed.items, filters), sort, new Date());

        return NextResponse.json(
            {
                items: filtered.slice(0, parseLimit(url.searchParams.get('limit'))),
                meta: { ...feed.meta, total: filtered.length },
                facets: collectFacets(feed.items),
                filters,
                sort,
            },
            {
                headers: {
                    'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=600',
                },
            }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load builds.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
