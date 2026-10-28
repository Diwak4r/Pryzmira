import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    canForceRefresh,
    clearBuildFeedCache,
    fetchBuildFeed,
    FORCE_REFRESH_MIN_INTERVAL_MS,
} from '@/lib/builds/feed';
import { CURATED_BUILDS } from '@/lib/builds/curated';
import { createTtlCache } from '@/lib/builds/cache';

const NOW = new Date('2026-10-28T12:00:00.000Z');

const X_PAYLOAD = {
    data: [
        {
            id: '1900000000000000001',
            author_id: '42',
            text: 'shipped a tiny habit tracker with Claude Sonnet 4.5 and v0 tonight. it syncs streaks from my calendar and nags me at 9pm.',
            created_at: '2026-10-27T18:30:00.000Z',
            public_metrics: { like_count: 128, retweet_count: 9, quote_count: 3, reply_count: 14 },
            entities: { urls: [{ expanded_url: 'https://example.com/habits' }] },
        },
        {
            id: '1900000000000000002',
            author_id: '43',
            text: 'I rebuilt my portfolio with Cursor and Next.js this weekend. The agent wrote most of the layout while I argued about spacing.',
            created_at: '2026-10-26T10:00:00.000Z',
            entities: { urls: [{ expanded_url: 'https://lovable.dev' }] },
        },
    ],
    includes: {
        users: [
            { id: '42', username: 'maker', name: 'Maker Name' },
            { id: '43', username: 'builder', name: 'Builder' },
        ],
    },
};

const GITHUB_PAYLOAD = {
    items: [
        {
            id: 101,
            name: 'open-agents',
            full_name: 'acme/open-agents',
            html_url: 'https://github.com/acme/open-agents',
            description: 'A CLI agent runner powered by GPT-5 for local automation.',
            owner: { login: 'acme' },
            stargazers_count: 1234,
            language: 'TypeScript',
            topics: ['llm', 'agents'],
            created_at: '2026-09-01T00:00:00.000Z',
            archived: false,
        },
    ],
};

function makeFetcher(options: { failX?: boolean; failGitHub?: boolean } = {}) {
    return vi.fn(async (input: unknown) => {
        const url = String(input);

        if (url.startsWith('https://api.x.com')) {
            if (options.failX) {
                return new Response(JSON.stringify({ title: 'Unauthorized', detail: 'bad token' }), {
                    status: 401,
                });
            }
            return new Response(JSON.stringify(X_PAYLOAD), { status: 200 });
        }

        if (url.startsWith('https://api.github.com')) {
            if (options.failGitHub) {
                return new Response(JSON.stringify({ message: 'API rate limit exceeded' }), {
                    status: 403,
                });
            }
            return new Response(JSON.stringify(GITHUB_PAYLOAD), { status: 200 });
        }

        return new Response('{}', { status: 404 });
    });
}

const BASE_ENV = {
    X_BEARER_TOKEN: 'x-token',
    GITHUB_TOKEN: 'gh-token',
    PRYZMIRA_DISABLE_GITHUB_FEED: 'false',
};

beforeEach(() => {
    clearBuildFeedCache();
});

describe('fetchBuildFeed', () => {
    it('returns curated picks and reports skipped sources when nothing is configured', async () => {
        const feed = await fetchBuildFeed({
            env: { PRYZMIRA_DISABLE_GITHUB_FEED: 'true' },
            includeLive: true,
            now: () => NOW,
            fetcher: makeFetcher() as unknown as typeof fetch,
        });

        expect(feed.items).toHaveLength(CURATED_BUILDS.length);
        expect(feed.meta.counts).toEqual({ curated: CURATED_BUILDS.length, live: 0 });
        expect(feed.meta.curatedOnly).toBe(true);
        expect(feed.meta.sources).toEqual([
            expect.objectContaining({ platform: 'x', status: 'skipped', count: 0 }),
            expect.objectContaining({ platform: 'github', status: 'skipped', count: 0 }),
        ]);
        expect(feed.meta.generatedAt).toBe(NOW.toISOString());
    });

    it('merges live X posts with curated picks', async () => {
        const feed = await fetchBuildFeed({
            env: BASE_ENV,
            includeLive: true,
            now: () => NOW,
            fetcher: makeFetcher() as unknown as typeof fetch,
        });

        expect(feed.meta.counts.live).toBeGreaterThanOrEqual(2);
        expect(feed.meta.counts.curated).toBe(CURATED_BUILDS.length);
        expect(feed.meta.curatedOnly).toBe(false);

        const habit = feed.items.find((item) => item.id === 'x:1900000000000000001');
        expect(habit).toBeDefined();
        expect(feed.meta.sources).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ platform: 'x', status: 'live' }),
                expect.objectContaining({ platform: 'github', status: 'live' }),
            ])
        );
    });

    it('lets a curated entry win the dedupe when a live post points at the same build', async () => {
        const feed = await fetchBuildFeed({
            env: BASE_ENV,
            includeLive: true,
            now: () => NOW,
            fetcher: makeFetcher() as unknown as typeof fetch,
        });

        // The second tweet links to lovable.dev, which the curated catalog owns.
        expect(feed.items.some((item) => item.id === 'x:1900000000000000002')).toBe(false);
        expect(feed.items.some((item) => item.id === 'curated:lovable')).toBe(true);
    });

    it('keeps serving curated picks when X fails', async () => {
        const feed = await fetchBuildFeed({
            env: { ...BASE_ENV, PRYZMIRA_DISABLE_GITHUB_FEED: 'true' },
            includeLive: true,
            now: () => NOW,
            fetcher: makeFetcher({ failX: true }) as unknown as typeof fetch,
        });

        const xStatus = feed.meta.sources.find((source) => source.platform === 'x');
        expect(xStatus).toMatchObject({ status: 'error', count: 0 });
        expect(xStatus?.detail).toMatch(/X search failed \(401\)/);
        expect(feed.items).toHaveLength(CURATED_BUILDS.length);
    });

    it('keeps serving curated picks when GitHub fails', async () => {
        const feed = await fetchBuildFeed({
            env: { ...BASE_ENV, X_BEARER_TOKEN: '' },
            includeLive: true,
            now: () => NOW,
            fetcher: makeFetcher({ failGitHub: true }) as unknown as typeof fetch,
        });

        const githubStatus = feed.meta.sources.find((source) => source.platform === 'github');
        expect(githubStatus).toMatchObject({ status: 'error', count: 0 });
        expect(githubStatus?.detail).toMatch(/rate limit/i);
    });

    it('skips every network call when includeLive is false', async () => {
        const fetcher = makeFetcher();

        const feed = await fetchBuildFeed({
            env: BASE_ENV,
            includeLive: false,
            now: () => NOW,
            fetcher: fetcher as unknown as typeof fetch,
        });

        expect(fetcher).not.toHaveBeenCalled();
        expect(feed.items).toHaveLength(CURATED_BUILDS.length);
        expect(feed.meta.sources[0].detail).toBe('Live sources disabled.');
    });

    it('caches live results between calls and bypasses the cache on demand', async () => {
        const fetcher = makeFetcher();
        const env = { ...BASE_ENV, PRYZMIRA_DISABLE_GITHUB_FEED: 'true' };

        await fetchBuildFeed({
            env,
            includeLive: true,
            now: () => NOW,
            fetcher: fetcher as unknown as typeof fetch,
        });
        expect(fetcher).toHaveBeenCalledTimes(1);

        await fetchBuildFeed({
            env,
            includeLive: true,
            now: () => NOW,
            fetcher: fetcher as unknown as typeof fetch,
        });
        expect(fetcher).toHaveBeenCalledTimes(1);

        await fetchBuildFeed({
            env,
            includeLive: true,
            useCache: false,
            now: () => NOW,
            fetcher: fetcher as unknown as typeof fetch,
        });
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('accepts TWITTER_BEARER_TOKEN as a fallback name', async () => {
        const feed = await fetchBuildFeed({
            env: { TWITTER_BEARER_TOKEN: 'legacy-token', PRYZMIRA_DISABLE_GITHUB_FEED: 'true' },
            includeLive: true,
            now: () => NOW,
            fetcher: makeFetcher() as unknown as typeof fetch,
        });

        expect(feed.meta.sources.find((source) => source.platform === 'x')?.status).toBe('live');
    });
});

describe('canForceRefresh', () => {
    it('allows the first refresh and then throttles for a minute', () => {
        expect(canForceRefresh(null, 1_000_000)).toBe(true);
        expect(canForceRefresh(1_000_000, 1_000_000 + FORCE_REFRESH_MIN_INTERVAL_MS - 1)).toBe(false);
        expect(canForceRefresh(1_000_000, 1_000_000 + FORCE_REFRESH_MIN_INTERVAL_MS)).toBe(true);
    });
});

describe('createTtlCache', () => {
    it('serves values within the ttl and expires them after it', () => {
        let now = 1000;
        const cache = createTtlCache<string>({ ttlMs: 5000, now: () => now });

        cache.set('k', 'v');
        expect(cache.get('k')).toBe('v');

        now += 4999;
        expect(cache.get('k')).toBe('v');

        now += 2;
        expect(cache.get('k')).toBeUndefined();
        expect(cache.size()).toBe(0);
    });

    it('evicts the oldest entry when full', () => {
        const cache = createTtlCache<string>({ ttlMs: 5000, maxEntries: 2 });

        cache.set('a', '1');
        cache.set('b', '2');
        cache.set('c', '3');

        expect(cache.get('a')).toBeUndefined();
        expect(cache.get('b')).toBe('2');
        expect(cache.get('c')).toBe('3');
    });

    it('can delete and clear entries', () => {
        const cache = createTtlCache<string>({ ttlMs: 5000 });

        cache.set('a', '1');
        cache.delete('a');
        expect(cache.get('a')).toBeUndefined();

        cache.set('b', '2');
        cache.clear();
        expect(cache.size()).toBe(0);
    });
});
