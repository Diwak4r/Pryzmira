import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/builds/route';
import { clearBuildFeedCache } from '@/lib/builds/feed';
import { CURATED_BUILDS } from '@/lib/builds/curated';
import type { BuildFeedResponse } from '@/lib/builds/types';

function request(query = ''): Request {
    return new Request(`http://localhost:3000/api/builds${query}`);
}

beforeEach(() => {
    clearBuildFeedCache();
    vi.stubEnv('X_BEARER_TOKEN', '');
    vi.stubEnv('PRYZMIRA_DISABLE_GITHUB_FEED', 'true');
});

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('GET /api/builds', () => {
    it('returns the curated feed with facets and metadata', async () => {
        const response = await GET(request());
        const payload = (await response.json()) as BuildFeedResponse;

        expect(response.status).toBe(200);
        expect(payload.items).toHaveLength(CURATED_BUILDS.length);
        expect(payload.meta.total).toBe(CURATED_BUILDS.length);
        expect(payload.meta.available).toBe(CURATED_BUILDS.length);
        expect(payload.facets.categories.app).toBeGreaterThan(0);
        expect(payload.meta.sources.map((source) => source.status)).toEqual(['skipped', 'skipped']);
    });

    it('sorts newest first by default', async () => {
        const response = await GET(request());
        const payload = (await response.json()) as BuildFeedResponse;
        const dates = payload.items.map((item) => item.source.postedAt || item.addedAt);

        expect(dates).toEqual([...dates].sort().reverse());
    });

    it('applies category, model, and source filters', async () => {
        const devtools = (await (await GET(request('?category=devtool'))).json()) as BuildFeedResponse;
        expect(devtools.items.every((item) => item.category === 'devtool')).toBe(true);
        expect(devtools.meta.total).toBeLessThan(CURATED_BUILDS.length);

        const claude = (await (await GET(request('?model=claude-sonnet-4-5'))).json()) as BuildFeedResponse;
        expect(claude.items.every((item) => item.models.includes('claude-sonnet-4-5'))).toBe(true);

        const github = (await (await GET(request('?platform=github'))).json()) as BuildFeedResponse;
        expect(github.items.every((item) => item.source.platform === 'github')).toBe(true);
    });

    it('searches across titles, summaries, makers, and vendors', async () => {
        const payload = (await (await GET(request('?q=anthropic'))).json()) as BuildFeedResponse;

        expect(payload.items.length).toBeGreaterThan(0);
        expect(
            payload.items.every((item) =>
                item.models.some((model) => model.startsWith('claude'))
            )
        ).toBe(true);
    });

    it('sorts A to Z when asked', async () => {
        const payload = (await (await GET(request('?sort=az'))).json()) as BuildFeedResponse;
        const titles = payload.items.map((item) => item.title);

        expect(titles).toEqual([...titles].sort((left, right) => left.localeCompare(right, 'en')));
        expect(payload.sort).toBe('az');
    });

    it('ignores invalid filter values instead of failing', async () => {
        const response = await GET(
            request('?category=not-a-category&platform=myspace&sort=sideways&provenance=maybe')
        );
        const payload = (await response.json()) as BuildFeedResponse;

        expect(response.status).toBe(200);
        expect(payload.filters).toMatchObject({
            category: 'all',
            platform: 'all',
            provenance: 'all',
        });
        expect(payload.sort).toBe('recent');
        expect(payload.items).toHaveLength(CURATED_BUILDS.length);
    });

    it('clamps the limit parameter', async () => {
        const limited = (await (await GET(request('?limit=3'))).json()) as BuildFeedResponse;
        expect(limited.items).toHaveLength(3);
        expect(limited.meta.total).toBe(CURATED_BUILDS.length);

        const zero = (await (await GET(request('?limit=0'))).json()) as BuildFeedResponse;
        expect(zero.items).toHaveLength(1);

        const huge = (await (await GET(request('?limit=9999'))).json()) as BuildFeedResponse;
        expect(huge.items.length).toBeLessThanOrEqual(100);
    });

    it('reports curated-only status when no live source is connected', async () => {
        const payload = (await (await GET(request())).json()) as BuildFeedResponse;

        expect(payload.meta.curatedOnly).toBe(true);
        expect(payload.meta.counts).toEqual({ curated: CURATED_BUILDS.length, live: 0 });
    });

    it('accepts the refresh flag without breaking the response', async () => {
        const response = await GET(request('?refresh=1&limit=5'));
        const payload = (await response.json()) as BuildFeedResponse;

        expect(response.status).toBe(200);
        expect(payload.items).toHaveLength(5);
    });

    it('sets a cache header', async () => {
        const response = await GET(request());

        expect(response.headers.get('Cache-Control')).toContain('s-maxage=120');
    });
});
