import { describe, expect, it, vi } from 'vitest';
import {
    buildXSearchUrl,
    fetchXBuilds,
    mapXTweetResponse,
    X_DEFAULT_QUERY,
    type XSearchPayload,
} from '@/lib/builds/sources/x';
import {
    buildGitHubSearchQuery,
    buildGitHubSearchUrl,
    fetchGitHubBuilds,
    mapGitHubRepos,
    type GitHubSearchPayload,
} from '@/lib/builds/sources/github';

const NOW = new Date('2026-10-28T12:00:00.000Z');

describe('X adapter', () => {
    const payload: XSearchPayload = {
        data: [
            {
                id: '1900000000000000001',
                author_id: '42',
                text: 'shipped a tiny habit tracker with Claude Sonnet 4.5 and v0 tonight. it syncs streaks from my calendar and nags me at 9pm. #buildinpublic',
                created_at: '2026-10-27T18:30:00.000Z',
                lang: 'en',
                public_metrics: { like_count: 128, retweet_count: 9, quote_count: 3, reply_count: 14 },
                entities: {
                    hashtags: [{ tag: 'buildinpublic' }],
                    urls: [
                        { url: 'https://t.co/abc', expanded_url: 'https://example.com/habits' },
                    ],
                },
            },
            {
                id: '1900000000000000002',
                author_id: '43',
                text: 'short',
                created_at: '2026-10-27T18:30:00.000Z',
            },
            {
                id: '1900000000000000003',
                author_id: '43',
                text: 'Spent the weekend on a new layout. Feels good to ship again after months of nothing.',
                created_at: '2026-10-27T18:30:00.000Z',
            },
            {
                id: '1900000000000000004',
                author_id: '44',
                text: 'A longer post about my workflow that only exists in the note tweet field. It goes on and on about agents and pipelines and tools, which is the point of this fixture.',
                created_at: '2026-10-26T10:00:00.000Z',
                note_tweet: {
                    text: 'Full length post: I rewrote my research agent with GPT-5 and LangChain this week. It now reads papers, summarises them, and files notes into my vault.',
                    entities: { urls: [{ expanded_url: 'https://example.com/agent' }] },
                },
            },
        ],
        includes: {
            users: [
                {
                    id: '42',
                    username: 'maker',
                    name: 'Maker Name',
                    verified: true,
                    profile_image_url: 'https://pbs.twimg.com/profile_images/1/avatar_normal.jpg',
                },
                { id: '44', username: 'researcher', name: 'Researcher' },
            ],
        },
        meta: { result_count: 4 },
    };

    it('builds a recent-search URL with the required fields', () => {
        const url = new URL(buildXSearchUrl());
        const params = url.searchParams;

        expect(url.origin).toBe('https://api.x.com');
        expect(url.pathname).toBe('/2/tweets/search/recent');
        expect(params.get('query')).toBe(X_DEFAULT_QUERY);
        expect(params.get('max_results')).toBe('40');
        expect(params.get('tweet.fields')).toContain('public_metrics');
        expect(params.get('tweet.fields')).toContain('note_tweet');
        expect(params.get('expansions')).toBe('author_id');
        expect(params.get('user.fields')).toContain('username');
    });

    it('clamps max_results into the API supported range', () => {
        expect(new URL(buildXSearchUrl('x', 1)).searchParams.get('max_results')).toBe('10');
        expect(new URL(buildXSearchUrl('x', 500)).searchParams.get('max_results')).toBe('100');
        expect(new URL(buildXSearchUrl('x', 47.6)).searchParams.get('max_results')).toBe('48');
    });

    it('maps posts to builds and drops the noise', () => {
        const builds = mapXTweetResponse(payload, { now: NOW });

        expect(builds).toHaveLength(2);

        const habit = builds.find((build) => build.id === 'x:1900000000000000001');
        expect(habit).toBeDefined();
        expect(habit?.title).toMatch(/tiny habit tracker/);
        expect(habit?.models).toContain('claude-sonnet-4-5');
        expect(habit?.tools).toContain('v0');
        expect(habit?.category).toBe('app');
        expect(habit?.maker).toEqual({
            name: 'Maker Name',
            handle: 'maker',
            avatarUrl: 'https://pbs.twimg.com/profile_images/1/avatar.jpg',
            verified: true,
        });
        expect(habit?.source.url).toBe('https://x.com/maker/status/1900000000000000001');
        expect(habit?.source.postedAt).toBe('2026-10-27T18:30:00.000Z');
        expect(habit?.buildUrl).toBe('https://example.com/habits');
        expect(habit?.tags).toEqual(['buildinpublic']);
        expect(habit?.metrics).toEqual({ likes: 128, reposts: 12, comments: 14 });
        expect(habit?.provenance).toBe('live');
    });

    it('prefers note_tweet text for long posts', () => {
        const builds = mapXTweetResponse(payload, { now: NOW });
        const note = builds.find((build) => build.id === 'x:1900000000000000004');

        expect(note?.summary).toContain('research agent');
        expect(note?.models).toContain('gpt-5');
        expect(note?.tools).toContain('langchain');
        expect(note?.buildUrl).toBe('https://example.com/agent');
    });

    it('falls back to the post permalink when there is no external link', () => {
        const builds = mapXTweetResponse(
            {
                data: [
                    {
                        id: '5',
                        author_id: '9',
                        text: 'Built an image pipeline with FLUX.1 and ComfyUI. It renders product shots overnight.',
                        created_at: '2026-10-20T00:00:00.000Z',
                    },
                ],
                includes: { users: [{ id: '9', username: 'lena', name: 'Lena' }] },
            },
            { now: NOW }
        );

        expect(builds[0].source.url).toBe('https://x.com/lena/status/5');
        expect(builds[0].buildUrl).toBeUndefined();
        expect(builds[0].category).toBe('creative');
    });

    it('replaces _normal in avatar URLs', () => {
        const builds = mapXTweetResponse(payload, { now: NOW });

        expect(builds[0].maker.avatarUrl).not.toContain('_normal');
    });

    it('fetches with a bearer token and parses the response', async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }));

        const builds = await fetchXBuilds({
            bearerToken: 'test-token',
            fetcher: fetcher as unknown as typeof fetch,
            now: NOW,
        });

        expect(builds).toHaveLength(2);
        const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toContain('/2/tweets/search/recent');
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
    });

    it('throws a descriptive error on API failure', async () => {
        const fetcher = vi.fn(
            async () =>
                new Response(JSON.stringify({ title: 'Unauthorized', detail: 'Invalid token' }), {
                    status: 401,
                })
        );

        await expect(
            fetchXBuilds({ bearerToken: 'bad', fetcher: fetcher as unknown as typeof fetch })
        ).rejects.toThrowError(/X search failed \(401\): Invalid token/);
    });

    it('wraps transport failures with context', async () => {
        const fetcher = vi.fn(async () => {
            throw new TypeError('fetch failed');
        });

        await expect(
            fetchXBuilds({ bearerToken: 't', fetcher: fetcher as unknown as typeof fetch })
        ).rejects.toThrowError(/X search could not be reached: fetch failed/);
    });

    it('refuses to call the API without a token', async () => {
        const fetcher = vi.fn();

        await expect(
            fetchXBuilds({ bearerToken: '  ', fetcher: fetcher as unknown as typeof fetch })
        ).rejects.toThrowError(/X_BEARER_TOKEN is not configured/);
        expect(fetcher).not.toHaveBeenCalled();
    });
});

describe('GitHub adapter', () => {
    const payload: GitHubSearchPayload = {
        items: [
            {
                id: 101,
                name: 'open-agents',
                full_name: 'acme/open-agents',
                html_url: 'https://github.com/acme/open-agents',
                description: 'A CLI agent runner powered by GPT-5 for local automation.',
                owner: { login: 'acme', avatar_url: 'https://avatars.githubusercontent.com/u/1' },
                stargazers_count: 1234,
                language: 'TypeScript',
                topics: ['llm', 'agents', 'cli'],
                created_at: '2026-09-01T00:00:00.000Z',
                archived: false,
            },
            {
                id: 102,
                name: 'archived-thing',
                full_name: 'acme/archived-thing',
                html_url: 'https://github.com/acme/archived-thing',
                description: 'An archived Claude Code experiment.',
                owner: { login: 'acme' },
                archived: true,
            },
            {
                id: 103,
                name: 'todo-list',
                full_name: 'someone/todo-list',
                html_url: 'https://github.com/someone/todo-list',
                description: 'A neat todo list.',
                owner: { login: 'someone' },
                topics: ['productivity'],
            },
            {
                id: 105,
                name: 'plain-python-tool',
                full_name: 'someone/plain-python-tool',
                html_url: 'https://github.com/someone/plain-python-tool',
                description: 'A Python script for renaming files.',
                owner: { login: 'someone' },
                topics: ['python', 'cli'],
                archived: false,
            },
            {
                id: 104,
                name: 'flux-workflows',
                full_name: 'studio/flux-workflows',
                html_url: 'https://github.com/studio/flux-workflows',
                description: 'ComfyUI workflows for FLUX.1 product photography.',
                owner: { login: 'studio' },
                stargazers_count: 87,
                language: 'Python',
                topics: ['image-generation'],
                created_at: 'not-a-date',
                archived: false,
            },
        ],
    };

    it('builds a bounded search query', () => {
        expect(
            buildGitHubSearchQuery({ topic: 'llm', minStars: 50, sinceDays: 30, now: NOW })
        ).toBe('topic:llm stars:>50 created:>2026-09-28 archived:false');

        expect(buildGitHubSearchQuery({ topic: 'ai-agents', now: NOW })).toContain('stars:>25');
    });

    it('builds an encoded search URL', () => {
        const url = new URL(buildGitHubSearchUrl('topic:llm stars:>25', 999));

        expect(url.origin).toBe('https://api.github.com');
        expect(url.pathname).toBe('/search/repositories');
        expect(url.searchParams.get('q')).toBe('topic:llm stars:>25');
        expect(url.searchParams.get('sort')).toBe('stars');
        expect(url.searchParams.get('per_page')).toBe('50');
    });

    it('maps repos to builds and skips archived or unattributed projects', () => {
        const builds = mapGitHubRepos(payload, { now: NOW });

        expect(builds.map((build) => build.id)).toEqual(['github:101', 'github:104']);

        const agent = builds[0];
        expect(agent.title).toBe('open-agents');
        expect(agent.models).toEqual(['gpt-5']);
        expect(agent.category).toBe('agent');
        expect(agent.metrics).toEqual({ stars: 1234 });
        expect(agent.language).toBe('TypeScript');
        expect(agent.tags).toEqual(['llm', 'agents', 'cli']);
        expect(agent.source).toEqual({
            platform: 'github',
            url: 'https://github.com/acme/open-agents',
            postedAt: '2026-09-01T00:00:00.000Z',
            label: 'GitHub repo',
        });
        expect(agent.buildUrl).toBe('https://github.com/acme/open-agents');
    });

    it('falls back to the catalog date when repo metadata is odd', () => {
        const flux = mapGitHubRepos(payload, { now: NOW })[1];

        expect(flux.source.postedAt).toBe(NOW.toISOString());
        expect(flux.category).toBe('creative');
    });

    it('queries every topic and dedupes the results', async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }));

        const builds = await fetchGitHubBuilds({
            topics: ['llm', 'ai-agents'],
            fetcher: fetcher as unknown as typeof fetch,
            now: NOW,
        });

        expect(fetcher).toHaveBeenCalledTimes(2);
        expect(builds).toHaveLength(2);
    });

    it('sends an auth header only when a token is provided', async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify({ items: [] }), { status: 200 }));

        await fetchGitHubBuilds({
            topics: ['llm'],
            token: 'gh-test',
            fetcher: fetcher as unknown as typeof fetch,
        });

        const [, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer gh-test');
    });

    it('wraps transport failures with context', async () => {
        const fetcher = vi.fn(async () => {
            throw new TypeError('fetch failed');
        });

        await expect(
            fetchGitHubBuilds({ topics: ['llm'], fetcher: fetcher as unknown as typeof fetch })
        ).rejects.toThrowError(/GitHub search could not be reached: fetch failed/);
    });

    it('surfaces the API error message', async () => {
        const fetcher = vi.fn(
            async () => new Response(JSON.stringify({ message: 'API rate limit exceeded' }), { status: 403 })
        );

        await expect(
            fetchGitHubBuilds({ topics: ['llm'], fetcher: fetcher as unknown as typeof fetch })
        ).rejects.toThrowError(/GitHub search failed \(403\): API rate limit exceeded/);
    });
});
