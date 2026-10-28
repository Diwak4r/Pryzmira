import {
    classifyBuild,
    dedupeBuilds,
    detectAiTools,
    detectModels,
    detectTools,
    summaryFromText,
} from '@/lib/builds/normalize';
import type { AiBuild } from '@/lib/builds/types';

/**
 * GitHub adapter. Uses the public repository search API, which works without
 * a token (10 requests/minute) and gets much roomier with `GITHUB_TOKEN`.
 */

export const GITHUB_API_BASE = 'https://api.github.com';
export const GITHUB_DEFAULT_TOPICS = ['llm', 'ai-agents'];
export const GITHUB_DEFAULT_MIN_STARS = 25;

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description?: string | null;
    owner?: { login?: string; avatar_url?: string };
    stargazers_count?: number;
    language?: string | null;
    topics?: string[];
    created_at?: string;
    pushed_at?: string;
    archived?: boolean;
}

export interface GitHubSearchPayload {
    items?: GitHubRepo[];
    total_count?: number;
    message?: string;
}

function isoDateDaysAgo(days: number, now: Date): string {
    const past = new Date(now.getTime() - days * 86_400_000);
    return past.toISOString().slice(0, 10);
}

export function buildGitHubSearchQuery(options: {
    topic: string;
    minStars?: number;
    sinceDays?: number;
    now?: Date;
}): string {
    const now = options.now || new Date();
    const minStars = options.minStars ?? GITHUB_DEFAULT_MIN_STARS;
    const sinceDays = options.sinceDays ?? 365;

    return [
        `topic:${options.topic}`,
        `stars:>${minStars}`,
        `created:>${isoDateDaysAgo(sinceDays, now)}`,
        'archived:false',
    ].join(' ');
}

export function buildGitHubSearchUrl(query: string, perPage = 20): string {
    const bounded = Math.min(50, Math.max(1, Math.round(perPage)));
    const params = new URLSearchParams({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: `${bounded}`,
    });

    return `${GITHUB_API_BASE}/search/repositories?${params.toString()}`;
}

export function mapGitHubRepos(
    payload: GitHubSearchPayload,
    options: { now?: Date } = {}
): AiBuild[] {
    const addedAt = (options.now || new Date()).toISOString();
    const builds: AiBuild[] = [];

    for (const repo of payload.items || []) {
        if (!repo?.html_url || !repo.name || repo.archived) {
            continue;
        }

        const topics = (repo.topics || []).filter((topic) => typeof topic === 'string');
        const haystack = [repo.full_name, repo.description || '', topics.join(' ')].join(' ');
        const models = detectModels(haystack);
        const tools = detectTools(haystack);

        if (models.length === 0 && detectAiTools(haystack).length === 0) {
            continue;
        }

        const description = (repo.description || '').trim();
        const postedAt =
            repo.created_at && !Number.isNaN(Date.parse(repo.created_at)) ? repo.created_at : addedAt;

        builds.push({
            id: `github:${repo.id}`,
            title: repo.name,
            summary: description ? summaryFromText(description) : `An open-source ${repo.name} project.`,
            maker: {
                name: repo.owner?.login || repo.full_name.split('/')[0] || 'Unknown maker',
                handle: repo.owner?.login,
                avatarUrl: repo.owner?.avatar_url,
            },
            models,
            tools,
            category: classifyBuild({ text: description, topics, models }),
            tags: topics.slice(0, 6),
            source: {
                platform: 'github',
                url: repo.html_url,
                postedAt,
                label: 'GitHub repo',
            },
            buildUrl: repo.html_url,
            metrics: { stars: repo.stargazers_count },
            provenance: 'live',
            addedAt,
            language: repo.language || undefined,
        });
    }

    return builds;
}

export async function fetchGitHubBuilds(options: {
    token?: string;
    topics?: string[];
    minStars?: number;
    sinceDays?: number;
    perPage?: number;
    fetcher?: typeof fetch;
    now?: Date;
    timeoutMs?: number;
}): Promise<AiBuild[]> {
    const fetcher = options.fetcher || fetch;
    const now = options.now || new Date();
    const topics = options.topics?.length ? options.topics : GITHUB_DEFAULT_TOPICS;
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const results: AiBuild[] = [];

    for (const topic of topics) {
        const query = buildGitHubSearchQuery({
            topic,
            minStars: options.minStars,
            sinceDays: options.sinceDays,
            now,
        });

        let response: Response;
        try {
            response = await fetcher(buildGitHubSearchUrl(query, options.perPage ?? 20), {
                method: 'GET',
                headers,
                cache: 'no-store',
                signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
            });
        } catch (error) {
            throw new Error(
                `GitHub search could not be reached: ${
                    error instanceof Error ? error.message : 'network error'
                }`
            );
        }

        const payload = (await response.json().catch(() => ({}))) as GitHubSearchPayload;

        if (!response.ok) {
            throw new Error(
                `GitHub search failed (${response.status}): ${(payload.message || 'no detail returned').slice(0, 160)}`
            );
        }

        results.push(...mapGitHubRepos(payload, { now }));
    }

    return dedupeBuilds(results);
}
