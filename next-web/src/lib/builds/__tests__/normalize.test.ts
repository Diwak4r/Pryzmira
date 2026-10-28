import { describe, expect, it } from 'vitest';
import {
    buildActionLabel,
    buildPublishedAt,
    buildSourceLabel,
    buildToWritingTask,
    canonicalUrl,
    classifyBuild,
    collectFacets,
    dedupeBuilds,
    detectAiTools,
    detectModels,
    detectTools,
    extractFirstUrl,
    extractHashtags,
    extractMentions,
    filterBuilds,
    formatCompactNumber,
    formatRelativeTime,
    isBuildCategory,
    isBuildPlatform,
    isBuildSort,
    matchesKeyword,
    scoreBuild,
    sortBuilds,
    summaryFromText,
    titleFromText,
    truncate,
} from '@/lib/builds/normalize';
import type { AiBuild } from '@/lib/builds/types';

const NOW = new Date('2026-10-28T12:00:00.000Z');

function build(overrides: Partial<AiBuild> & { id: string }): AiBuild {
    return {
        title: 'A build',
        summary: 'Something someone shipped.',
        maker: { name: 'Maker' },
        models: [],
        tools: [],
        category: 'app',
        tags: [],
        source: { platform: 'x', url: 'https://x.com/maker/status/1', postedAt: NOW.toISOString() },
        provenance: 'live',
        addedAt: NOW.toISOString(),
        ...overrides,
    };
}

describe('matchesKeyword', () => {
    it('matches whole words case-insensitively', () => {
        expect(matchesKeyword('built with Claude Sonnet 4.5 today', 'claude sonnet 4.5')).toBe(true);
        expect(matchesKeyword('BUILT WITH GPT-5', 'gpt-5')).toBe(true);
    });

    it('does not match inside longer words', () => {
        expect(matchesKeyword('reactive dashboards', 'react')).toBe(false);
        expect(matchesKeyword('reaction video', 'react')).toBe(false);
    });

    it('does not match version-prefixed tokens', () => {
        expect(matchesKeyword('released v0.1 of my app', 'v0')).toBe(false);
        expect(matchesKeyword('shipped with v0 today', 'v0')).toBe(true);
    });

    it('returns false for empty keywords', () => {
        expect(matchesKeyword('anything', '   ')).toBe(false);
    });
});

describe('detectModels / detectTools', () => {
    it('finds multiple models and vendors in one post', () => {
        const text = 'Compared Claude Sonnet 4.5 vs GPT-5 on my Rails app, then let Gemini 2.5 Pro review it.';

        expect(detectModels(text)).toEqual(
            expect.arrayContaining(['claude-sonnet-4-5', 'gpt-5', 'gemini-2-5-pro'])
        );
    });

    it('detects image and audio models', () => {
        expect(detectModels('made with FLUX.1 schnell')).toContain('flux-1');
        expect(detectModels('voiced with ElevenLabs')).toContain('elevenlabs');
        expect(detectModels('music by Suno')).toContain('suno');
    });

    it('returns an empty list when nothing matches', () => {
        expect(detectModels('a plain todo list')).toEqual([]);
    });

    it('separates AI-native tools from generic stack mentions', () => {
        expect(detectAiTools('built in Cursor with React and Python')).toEqual(['cursor']);
        expect(detectAiTools('react, python, nextjs, supabase')).toEqual([]);
    });

    it('detects tools without matching substrings', () => {
        expect(detectTools('built in Cursor with Next.js and Supabase')).toEqual(
            expect.arrayContaining(['cursor', 'nextjs', 'supabase'])
        );
        expect(detectTools('a bolt.new prototype')).toContain('bolt-new');
    });
});

describe('classifyBuild', () => {
    it.each([
        ['built a roguelike in Godot', 'game'],
        ['wrote a paper with benchmark results', 'research'],
        ['generated a music video with Veo 3', 'creative'],
        ['an autonomous agent that runs workflows', 'agent'],
        ['a CLI and SDK for local dev', 'devtool'],
        ['launched a SaaS dashboard', 'app'],
    ])('classifies %j as %s', (text, expected) => {
        expect(classifyBuild({ text })).toBe(expected);
    });

    it('falls back to model abilities when the text is vague', () => {
        expect(classifyBuild({ text: 'my new thing', models: ['flux-1'] })).toBe('creative');
        expect(classifyBuild({ text: 'my new thing', models: ['gpt-5'] })).toBe('devtool');
        expect(classifyBuild({ text: 'my new thing' })).toBe('other');
    });

    it('uses topics as extra signal', () => {
        expect(classifyBuild({ text: 'weekend project', topics: ['game-dev'] })).toBe('game');
    });
});

describe('titleFromText / summaryFromText', () => {
    it('removes leading mentions, links, and hashtags from the title', () => {
        const title = titleFromText(
            '@maker just shipped a tiny habit tracker https://example.com #buildinpublic'
        );

        expect(title).toBe('just shipped a tiny habit tracker');
    });

    it('takes the first sentence only', () => {
        expect(titleFromText('Shipped my first agent. It reads issues and opens PRs.')).toBe(
            'Shipped my first agent'
        );
    });

    it('truncates long titles at a word boundary', () => {
        const title = titleFromText('a'.repeat(20) + ' ' + 'word '.repeat(40));

        expect(title.length).toBeLessThanOrEqual(84);
        expect(title.endsWith('...')).toBe(true);
    });

    it('falls back when there is nothing left after cleaning', () => {
        expect(titleFromText('https://example.com')).toBe('Untitled build');
    });

    it('keeps a longer summary but strips links', () => {
        const summary = summaryFromText(
            'I built a small CRM for my dad using Claude Sonnet 4.5 and Supabase. It syncs invoices from email and drafts replies. https://example.com'
        );

        expect(summary).toContain('small CRM');
        expect(summary).not.toContain('https://');
        expect(summary.length).toBeLessThanOrEqual(240);
    });
});

describe('text extraction helpers', () => {
    it('extracts the first URL without trailing punctuation', () => {
        expect(extractFirstUrl('see https://example.com/build.')).toBe('https://example.com/build');
        expect(extractFirstUrl('no link here')).toBeNull();
    });

    it('extracts unique lowercase hashtags', () => {
        expect(extractHashtags('#BuildInPublic #AI #buildinpublic')).toEqual(['buildinpublic', 'ai']);
    });

    it('extracts unique mentions and ignores emails', () => {
        expect(extractMentions('thanks @Maker and @maker, ping me')).toEqual(['Maker']);
        expect(extractMentions('mail me at a@b.com')).toEqual([]);
    });

    it('truncates text with a custom suffix', () => {
        expect(truncate('hello world', 8)).toBe('hello...');
        expect(truncate('short', 20)).toBe('short');
    });
});

describe('format helpers', () => {
    it('formats compact counts', () => {
        expect(formatCompactNumber(999)).toBe('999');
        expect(formatCompactNumber(1200)).toBe('1.2k');
        expect(formatCompactNumber(21_400)).toBe('21.4k');
        expect(formatCompactNumber(1_500_000)).toBe('1.5m');
        expect(formatCompactNumber(-5)).toBe('0');
    });

    it('formats relative timestamps', () => {
        expect(formatRelativeTime(NOW.toISOString(), NOW)).toBe('just now');
        expect(formatRelativeTime('2026-10-28T09:00:00.000Z', NOW)).toBe('3h ago');
        expect(formatRelativeTime('2026-10-25T12:00:00.000Z', NOW)).toBe('3d ago');
        expect(formatRelativeTime('2026-08-28T12:00:00.000Z', NOW)).toBe('2mo ago');
        expect(formatRelativeTime('not a date', NOW)).toBe('unknown date');
        expect(formatRelativeTime('2026-10-29T12:00:00.000Z', NOW)).toBe('scheduled');
    });

    it('labels the card action without implying open source', () => {
        expect(buildActionLabel({ source: { platform: 'github', url: 'https://github.com/a/b' } })).toBe(
            'Open repo'
        );
        expect(buildActionLabel({ source: { platform: 'web', url: 'https://example.com' } })).toBe(
            'Open site'
        );
        expect(buildActionLabel({ source: { platform: 'x', url: 'https://x.com/a/status/1' } })).toBe(
            'Open post'
        );
        expect(buildActionLabel({ source: { platform: 'huggingface', url: 'https://hf.co/x' } })).toBe(
            'Open space'
        );
        expect(
            buildActionLabel({
                source: { platform: 'x', url: 'https://x.com/a/status/1' },
                buildUrl: 'https://example.com/build',
            })
        ).toBe('Open build');
    });

    it('labels sources', () => {
        expect(buildSourceLabel('x')).toBe('X post');
        expect(buildSourceLabel('github')).toBe('GitHub repo');
        expect(buildSourceLabel('web')).toBe('Website');
    });
});

describe('canonicalUrl / dedupeBuilds', () => {
    it('normalizes hosts, trailing slashes, and tracking params', () => {
        expect(canonicalUrl('https://www.Example.com/build/?utm_source=x&ref=y')).toBe('example.com/build');
        expect(canonicalUrl('https://example.com/build?page=2')).toBe('example.com/build?page=2');
        expect(canonicalUrl('not a url')).toBeNull();
    });

    it('drops duplicate ids, sources, and build links', () => {
        const first = build({ id: 'x:1', source: { platform: 'x', url: 'https://x.com/a/status/1' } });
        const sameId = build({ id: 'x:1', source: { platform: 'x', url: 'https://x.com/b/status/2' } });
        const sameBuild = build({
            id: 'curated:one',
            source: { platform: 'web', url: 'https://example.com/project' },
            buildUrl: 'https://example.com/project/',
        });

        const result = dedupeBuilds([first, sameId, sameBuild]);

        expect(result.map((item) => item.id)).toEqual(['x:1', 'curated:one']);
    });
});

describe('filterBuilds', () => {
    const builds: AiBuild[] = [
        build({
            id: 'a',
            title: 'Habit tracker',
            summary: 'A small habit tracker built with Claude Sonnet 4.5.',
            models: ['claude-sonnet-4-5'],
            tools: ['cursor'],
            category: 'app',
            tags: ['productivity'],
            maker: { name: 'Ada', handle: 'ada' },
        }),
        build({
            id: 'b',
            title: 'Agent runner',
            summary: 'Autonomous agent that opens PRs.',
            models: ['gpt-5'],
            tools: ['openhands'],
            category: 'agent',
            source: { platform: 'github', url: 'https://github.com/acme/agent' },
        }),
        build({
            id: 'c',
            title: 'Pixel art tool',
            summary: 'Image generation playground.',
            models: ['flux-1'],
            category: 'creative',
            source: { platform: 'huggingface', url: 'https://huggingface.co/spaces/x' },
        }),
    ];

    it('returns everything for empty filters', () => {
        expect(filterBuilds(builds, {})).toHaveLength(3);
    });

    it('matches every query token across fields', () => {
        expect(filterBuilds(builds, { query: 'habit claude' }).map((item) => item.id)).toEqual(['a']);
        expect(filterBuilds(builds, { query: 'ada' }).map((item) => item.id)).toEqual(['a']);
        expect(filterBuilds(builds, { query: 'anthropic' }).map((item) => item.id)).toEqual(['a']);
        expect(filterBuilds(builds, { query: 'nothing' })).toHaveLength(0);
    });

    it('filters by category, model, vendor, platform, and provenance', () => {
        expect(filterBuilds(builds, { category: 'agent' }).map((item) => item.id)).toEqual(['b']);
        expect(filterBuilds(builds, { model: 'flux-1' }).map((item) => item.id)).toEqual(['c']);
        expect(filterBuilds(builds, { vendor: 'OpenAI' }).map((item) => item.id)).toEqual(['b']);
        expect(filterBuilds(builds, { platform: 'github' }).map((item) => item.id)).toEqual(['b']);
        expect(filterBuilds(builds, { provenance: 'curated' })).toHaveLength(0);
        expect(filterBuilds(builds, { category: 'all', platform: 'all', model: 'all' })).toHaveLength(3);
    });

    it('combines filters', () => {
        expect(filterBuilds(builds, { query: 'agent', platform: 'github' })).toHaveLength(1);
        expect(filterBuilds(builds, { query: 'agent', platform: 'x' })).toHaveLength(0);
    });
});

describe('sortBuilds and scoreBuild', () => {
    const older = build({
        id: 'older',
        title: 'Zeta',
        source: { platform: 'x', url: 'https://x.com/a/status/1', postedAt: '2026-10-01T00:00:00.000Z' },
        metrics: { likes: 5000 },
    });
    const newer = build({
        id: 'newer',
        title: 'Alpha',
        source: { platform: 'x', url: 'https://x.com/a/status/2', postedAt: '2026-10-27T00:00:00.000Z' },
        metrics: { likes: 20 },
    });

    it('sorts by recency', () => {
        expect(sortBuilds([older, newer], 'recent', NOW).map((item) => item.id)).toEqual([
            'newer',
            'older',
        ]);
    });

    it('sorts by title for az', () => {
        expect(sortBuilds([older, newer], 'az', NOW).map((item) => item.id)).toEqual(['newer', 'older']);
    });

    it('decays old engagement so fresh builds can trend', () => {
        expect(scoreBuild(newer, NOW)).toBeGreaterThan(0);
        expect(sortBuilds([older, newer], 'trending', NOW)).toHaveLength(2);
    });

    it('gives curated picks an editorial boost without faking metrics', () => {
        const curated = build({ id: 'curated', provenance: 'curated', highlight: 'Worth a look' });
        const plain = build({ id: 'plain' });

        expect(scoreBuild(curated, NOW)).toBeGreaterThan(scoreBuild(plain, NOW));
        expect(scoreBuild(plain, NOW)).toBe(0);
    });

    it('falls back to addedAt when a curated item has no publish date', () => {
        const curated = build({
            id: 'curated',
            provenance: 'curated',
            addedAt: '2026-10-20T00:00:00.000Z',
            source: { platform: 'web', url: 'https://example.com' },
        });

        expect(buildPublishedAt(curated)).toBe('2026-10-20T00:00:00.000Z');
    });
});

describe('collectFacets', () => {
    it('counts categories, platforms, models, and vendors', () => {
        const facets = collectFacets([
            build({ id: 'a', category: 'app', models: ['claude-sonnet-4-5'], source: { platform: 'x', url: 'https://x.com/1' } }),
            build({ id: 'b', category: 'app', models: ['claude-sonnet-4-5', 'gpt-5'], source: { platform: 'github', url: 'https://github.com/2' } }),
            build({ id: 'c', category: 'creative', models: ['flux-1'] }),
        ]);

        expect(facets.categories).toEqual({ app: 2, creative: 1 });
        expect(facets.platforms).toEqual({ x: 2, github: 1 });
        expect(facets.models['claude-sonnet-4-5']).toBe(2);
        expect(facets.vendors).toEqual({ Anthropic: 2, OpenAI: 1, 'Black Forest Labs': 1 });
    });
});

describe('buildToWritingTask', () => {
    it('includes the title, maker, and model names', () => {
        const task = buildToWritingTask(
            build({
                id: 'a',
                title: 'Habit tracker',
                summary: 'A tiny habit tracker.',
                maker: { name: 'Ada' },
                models: ['claude-sonnet-4-5', 'gpt-5'],
            })
        );

        expect(task).toContain('Habit tracker');
        expect(task).toContain('Ada');
        expect(task).toContain('Claude Sonnet 4.5');
        expect(task).toContain('GPT-5');
        expect(task).toContain('skip hype');
    });

    it('omits the model sentence when attribution is unknown', () => {
        const task = buildToWritingTask(
            build({ id: 'a', title: 'Thing', summary: 'Does stuff.', maker: { name: 'Sam' } })
        );

        expect(task).not.toContain('built with');
    });
});

describe('type guards', () => {
    it('validates categories, platforms, and sorts', () => {
        expect(isBuildCategory('agent')).toBe(true);
        expect(isBuildCategory('nonsense')).toBe(false);
        expect(isBuildPlatform('huggingface')).toBe(true);
        expect(isBuildPlatform('tiktok')).toBe(false);
        expect(isBuildSort('trending')).toBe(true);
        expect(isBuildSort('random')).toBe(false);
    });
});
