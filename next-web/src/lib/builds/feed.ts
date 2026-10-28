import { createTtlCache } from '@/lib/builds/cache';
import { CURATED_BUILDS } from '@/lib/builds/curated';
import { dedupeBuilds } from '@/lib/builds/normalize';
import { fetchGitHubBuilds } from '@/lib/builds/sources/github';
import { fetchXBuilds } from '@/lib/builds/sources/x';
import type { AiBuild, BuildFeed, SourceStatus } from '@/lib/builds/types';

const X_CACHE_TTL_MS = 5 * 60 * 1000;
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000;

const liveCache = {
    x: createTtlCache<AiBuild[]>({ ttlMs: X_CACHE_TTL_MS }),
    github: createTtlCache<AiBuild[]>({ ttlMs: GITHUB_CACHE_TTL_MS }),
};

/** A manual refresh spends upstream quota, so it is allowed once a minute. */
export const FORCE_REFRESH_MIN_INTERVAL_MS = 60_000;

export function canForceRefresh(lastForcedAt: number | null, now: number): boolean {
    return lastForcedAt === null || now - lastForcedAt >= FORCE_REFRESH_MIN_INTERVAL_MS;
}

export function clearBuildFeedCache(): void {
    liveCache.x.clear();
    liveCache.github.clear();
}

export interface BuildFeedOptions {
    env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
    fetcher?: typeof fetch;
    now?: () => Date;
    /** Set to false to bypass the TTL cache (used by the refresh button). */
    useCache?: boolean;
    /** Set to false to skip every network call (used by tests and previews). */
    includeLive?: boolean;
}

function errorDetail(error: unknown): string {
    const message = error instanceof Error ? error.message : 'unknown error';
    return message.replace(/\s+/g, ' ').slice(0, 200);
}

function readToken(
    env: BuildFeedOptions['env'],
    ...keys: string[]
): string | null {
    for (const key of keys) {
        const value = env?.[key]?.trim();
        if (value) {
            return value;
        }
    }

    return null;
}

/**
 * Builds the gallery feed: live X and GitHub results (when reachable) plus the
 * curated starter set. Never throws; any source failure is reported in
 * `meta.sources` so the UI can tell the user why a feed is quiet.
 */
export async function fetchBuildFeed(options: BuildFeedOptions = {}): Promise<BuildFeed> {
    const env = options.env || process.env;
    const fetcher = options.fetcher || fetch;
    const now = options.now?.() || new Date();
    const useCache = options.useCache !== false;
    const includeLive = options.includeLive !== false;

    const liveItems: AiBuild[] = [];
    const sources: SourceStatus[] = [];

    if (!includeLive) {
        sources.push({
            platform: 'x',
            status: 'skipped',
            count: 0,
            detail: 'Live sources disabled.',
        });
    } else {
        const xToken = readToken(env, 'X_BEARER_TOKEN', 'TWITTER_BEARER_TOKEN');

        if (!xToken) {
            sources.push({
                platform: 'x',
                status: 'skipped',
                count: 0,
                detail: 'Set X_BEARER_TOKEN to pull live posts from X.',
            });
        } else {
            try {
                let items = useCache ? liveCache.x.get('recent') : undefined;
                if (!items) {
                    items = await fetchXBuilds({
                        bearerToken: xToken,
                        fetcher,
                        now,
                    });
                    liveCache.x.set('recent', items);
                }

                liveItems.push(...items);
                sources.push({ platform: 'x', status: 'live', count: items.length });
            } catch (error) {
                sources.push({
                    platform: 'x',
                    status: 'error',
                    count: 0,
                    detail: errorDetail(error),
                });
            }
        }

        if (env?.PRYZMIRA_DISABLE_GITHUB_FEED === 'true') {
            sources.push({
                platform: 'github',
                status: 'skipped',
                count: 0,
                detail: 'Disabled with PRYZMIRA_DISABLE_GITHUB_FEED.',
            });
        } else {
            try {
                let items = useCache ? liveCache.github.get('recent') : undefined;
                if (!items) {
                    items = await fetchGitHubBuilds({
                        token: readToken(env, 'GITHUB_TOKEN', 'GH_TOKEN') || undefined,
                        fetcher,
                        now,
                    });
                    liveCache.github.set('recent', items);
                }

                liveItems.push(...items);
                sources.push({ platform: 'github', status: 'live', count: items.length });
            } catch (error) {
                sources.push({
                    platform: 'github',
                    status: 'error',
                    count: 0,
                    detail: errorDetail(error),
                });
            }
        }
    }

    // Curated entries come first: they are richer than a raw post, so when a
    // live item links to the same project the curated card wins the dedupe.
    const items = dedupeBuilds([...CURATED_BUILDS, ...liveItems]);
    const curatedCount = items.filter((item) => item.provenance === 'curated').length;
    const liveCount = items.length - curatedCount;

    return {
        items,
        meta: {
            generatedAt: now.toISOString(),
            available: items.length,
            total: items.length,
            counts: { curated: curatedCount, live: liveCount },
            sources,
            curatedOnly: liveCount === 0,
        },
    };
}
