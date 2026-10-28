import {
    classifyBuild,
    detectAiTools,
    detectModels,
    detectTools,
    extractHashtags,
    summaryFromText,
    titleFromText,
} from '@/lib/builds/normalize';
import type { AiBuild } from '@/lib/builds/types';

/**
 * X (Twitter) adapter for the build gallery.
 *
 * Uses the v2 "recent search" endpoint, which requires an app-only bearer
 * token (`X_BEARER_TOKEN`). Nothing here runs unless a token is configured,
 * and every failure is isolated so the gallery can fall back to curated picks.
 */

export const X_API_BASE = 'https://api.x.com/2';
export const X_DEFAULT_MAX_RESULTS = 40;

export const X_DEFAULT_QUERY = [
    '(built OR building OR shipped OR launched OR "vibe coded" OR "made with" OR "made in")',
    '(claude OR gpt OR gemini OR llama OR grok OR mistral OR deepseek OR qwen OR cursor OR windsurf OR lovable OR "bolt.new" OR v0)',
    '-is:retweet',
    '-is:reply',
    'has:links',
    'lang:en',
].join(' ');

export interface XPublicMetrics {
    retweet_count?: number;
    reply_count?: number;
    like_count?: number;
    quote_count?: number;
    impression_count?: number;
}

export interface XTweet {
    id: string;
    text?: string;
    author_id?: string;
    created_at?: string;
    lang?: string;
    public_metrics?: XPublicMetrics;
    entities?: {
        hashtags?: Array<{ tag?: string }>;
        urls?: Array<{ url?: string; expanded_url?: string }>;
    };
    note_tweet?: {
        text?: string;
        entities?: { urls?: Array<{ url?: string; expanded_url?: string }> };
    };
}

export interface XUser {
    id: string;
    username?: string;
    name?: string;
    profile_image_url?: string;
    verified?: boolean;
}

export interface XSearchPayload {
    data?: XTweet[];
    includes?: { users?: XUser[] };
    errors?: Array<{ title?: string; detail?: string }>;
    title?: string;
    detail?: string;
    meta?: { result_count?: number };
}

export function buildXSearchUrl(query: string = X_DEFAULT_QUERY, maxResults = X_DEFAULT_MAX_RESULTS): string {
    const bounded = Math.min(100, Math.max(10, Math.round(maxResults)));
    const params = new URLSearchParams({
        query: query.slice(0, 512),
        max_results: `${bounded}`,
        'tweet.fields': 'created_at,public_metrics,entities,lang,note_tweet',
        expansions: 'author_id',
        'user.fields': 'username,name,profile_image_url,verified',
    });

    return `${X_API_BASE}/tweets/search/recent?${params.toString()}`;
}

function xPostUrl(tweet: XTweet, user?: XUser): string {
    const handle = user?.username || 'i';
    return `https://x.com/${handle}/status/${tweet.id}`;
}

function externalBuildUrl(tweet: XTweet): string | undefined {
    const candidates = [
        ...(tweet.entities?.urls || []),
        ...(tweet.note_tweet?.entities?.urls || []),
    ];

    return candidates
        .map((entry) => entry.expanded_url)
        .find((url): url is string => Boolean(url && /^https?:\/\//.test(url)));
}

/**
 * Maps a raw X search payload to gallery items.
 *
 * Posts are dropped when they are too short to describe anything or when no
 * known model or tool can be detected, because a card with no attribution is
 * noise in a gallery literally about what built the thing.
 */
export function mapXTweetResponse(
    payload: XSearchPayload,
    options: { now?: Date } = {}
): AiBuild[] {
    const users = new Map<string, XUser>();
    for (const user of payload.includes?.users || []) {
        if (user?.id) {
            users.set(user.id, user);
        }
    }

    const addedAt = (options.now || new Date()).toISOString();
    const builds: AiBuild[] = [];

    for (const tweet of payload.data || []) {
        if (!tweet?.id) {
            continue;
        }

        const text = (tweet.note_tweet?.text || tweet.text || '').trim();
        if (text.length < 40) {
            continue;
        }

        const models = detectModels(text);
        const tools = detectTools(text);
        if (models.length === 0 && detectAiTools(text).length === 0) {
            continue;
        }

        const user = tweet.author_id ? users.get(tweet.author_id) : undefined;
        const tags = extractHashtags(text).slice(0, 6);
        const buildUrl = externalBuildUrl(tweet);
        const postedAt = tweet.created_at && !Number.isNaN(Date.parse(tweet.created_at))
            ? tweet.created_at
            : addedAt;

        builds.push({
            id: `x:${tweet.id}`,
            title: titleFromText(text),
            summary: summaryFromText(text),
            maker: {
                name: user?.name || (user?.username ? `@${user.username}` : 'Unknown maker'),
                handle: user?.username,
                avatarUrl: user?.profile_image_url?.replace('_normal', ''),
                verified: user?.verified,
            },
            models,
            tools,
            category: classifyBuild({ text, models }),
            tags,
            source: {
                platform: 'x',
                url: xPostUrl(tweet, user),
                postedAt,
                label: 'X post',
            },
            buildUrl,
            metrics: tweet.public_metrics
                ? {
                      likes: tweet.public_metrics.like_count,
                      reposts:
                          (tweet.public_metrics.retweet_count || 0) +
                          (tweet.public_metrics.quote_count || 0),
                      comments: tweet.public_metrics.reply_count,
                  }
                : undefined,
            provenance: 'live',
            addedAt,
        });
    }

    return builds;
}

function describeXFailure(status: number, payload: XSearchPayload): string {
    const detail =
        payload.detail ||
        payload.errors?.[0]?.detail ||
        payload.errors?.[0]?.title ||
        payload.title ||
        'no detail returned';

    return `X search failed (${status}): ${detail}`.slice(0, 240);
}

export async function fetchXBuilds(options: {
    bearerToken: string;
    fetcher?: typeof fetch;
    query?: string;
    maxResults?: number;
    now?: Date;
    timeoutMs?: number;
}): Promise<AiBuild[]> {
    const token = options.bearerToken?.trim();
    if (!token) {
        throw new Error('X_BEARER_TOKEN is not configured.');
    }

    const fetcher = options.fetcher || fetch;
    let response: Response;

    try {
        response = await fetcher(buildXSearchUrl(options.query, options.maxResults), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
        });
    } catch (error) {
        throw new Error(
            `X search could not be reached: ${error instanceof Error ? error.message : 'network error'}`
        );
    }

    const payload = (await response.json().catch(() => ({}))) as XSearchPayload;

    if (!response.ok) {
        throw new Error(describeXFailure(response.status, payload));
    }

    return mapXTweetResponse(payload, { now: options.now });
}
