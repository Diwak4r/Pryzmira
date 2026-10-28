import {
    AI_MODELS,
    AI_TOOLS,
    BUILD_CATEGORIES,
    getCategory,
    modelLabel,
    vendorOfModel,
    type AiModel,
} from '@/lib/builds/catalog';
import type {
    AiBuild,
    BuildCategory,
    BuildFacetCounts,
    BuildFilters,
    BuildPlatform,
    BuildSort,
} from '@/lib/builds/types';

const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/i;
const HASHTAG_PATTERN = /#([\p{L}\p{N}_]{2,30})/gu;
const MENTION_PATTERN = /@([A-Za-z0-9_]{2,15})/g;

const CATEGORY_RULES: Array<{ category: BuildCategory; pattern: RegExp }> = [
    {
        category: 'game',
        pattern: /\b(game|games|gamedev|game dev|game jam|roguelike|platformer|godot|unity|unreal|phaser|pygame)\b/i,
    },
    {
        category: 'research',
        pattern:
            /\b(paper|papers|arxiv|benchmark|benchmarks|eval|evals|evaluation|dataset|datasets|research|ablation|fine-?tun(e|ed|ing)|reproduc)\b/i,
    },
    {
        category: 'creative',
        pattern:
            /\b(image|images|video|videos|music|song|songs|audio|voice|art|artwork|design|designs|3d|render|renders|animation|animate|poster|illustration|ui kit|brand)\b/i,
    },
    {
        category: 'agent',
        pattern:
            /\b(agent|agents|agentic|autonomous|workflow|workflows|automation|automate|mcp|tool[- ]use|orchestrat(e|or|ion)|swarm|browser use)\b/i,
    },
    {
        category: 'devtool',
        pattern:
            /\b(cli|sdk|api wrapper|editor|ide|extension|plugin|linter|compiler|devtool|dev tool|dev tools|boilerplate|template|scaffold|framework|library|infra|local dev|self[- ]host)\b/i,
    },
    {
        category: 'app',
        pattern:
            /\b(app|apps|saas|dashboard|website|web app|webapp|landing page|launch|launched|crm|marketplace|planner|tracker|notebook|chatbot|bot)\b/i,
    },
];

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word-ish keyword match. Prevents `v0` from matching `v0.1` and
 * `react` from matching `reactive`, which otherwise creates noisy badges.
 */
export function matchesKeyword(text: string, keyword: string): boolean {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
        return false;
    }

    const pattern = new RegExp(
        `(?<![\\p{L}\\p{N}])${escapeRegExp(normalizedKeyword)}(?![\\p{L}\\p{N}]|\\.\\d)`,
        'iu'
    );

    return pattern.test(text);
}

export function normalizeWhitespace(value: string): string {
    return value.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

export function stripUrls(value: string): string {
    return value.replace(new RegExp(URL_PATTERN.source, 'gi'), ' ');
}

export function extractFirstUrl(value: string): string | null {
    const match = value.match(URL_PATTERN);
    if (!match) {
        return null;
    }

    return match[0].replace(/[.,;:!?]+$/, '');
}

export function extractHashtags(value: string): string[] {
    const tags = new Set<string>();
    for (const match of value.matchAll(HASHTAG_PATTERN)) {
        tags.add(match[1].toLowerCase());
    }

    return [...tags];
}

export function extractMentions(value: string): string[] {
    const seen = new Set<string>();
    const handles: string[] = [];

    for (const match of value.matchAll(MENTION_PATTERN)) {
        const handle = match[1];
        const key = handle.toLowerCase();
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        handles.push(handle);
    }

    return handles;
}

export function truncate(value: string, maxLength: number, suffix = '...'): string {
    const normalized = normalizeWhitespace(value);
    if (normalized.length <= maxLength) {
        return normalized;
    }

    const slice = normalized.slice(0, Math.max(1, maxLength - suffix.length));
    const lastSpace = slice.lastIndexOf(' ');
    const trimmed = (lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice).trim();

    return `${trimmed.replace(/[,.;:!?-]+$/, '')}${suffix}`;
}

export function titleFromText(value: string, maxLength = 84): string {
    const cleaned = normalizeWhitespace(stripUrls(value).replace(/^(\s*@[A-Za-z0-9_]+\s*)+/, ''));

    if (!cleaned) {
        return 'Untitled build';
    }

    const withoutTags = normalizeWhitespace(cleaned.replace(/#[\p{L}\p{N}_]{2,30}/gu, ' '));
    const candidate = withoutTags || cleaned;
    const firstSentence = candidate.split(/(?<=[.!?])\s+/)[0] || candidate;

    return truncate(
        firstSentence.replace(/^["'“”]+|["'“”]+$/g, '').replace(/[.,;:!?]+$/, ''),
        maxLength
    );
}

export function summaryFromText(value: string, maxLength = 240): string {
    const cleaned = normalizeWhitespace(
        stripUrls(value)
            .replace(/^(\s*@[A-Za-z0-9_]+\s*)+/, '')
            .replace(/\s+#[\p{L}\p{N}_]{2,30}/gu, ' ')
    );

    return truncate(cleaned, maxLength, '…');
}

export function detectModels(text: string, catalog: AiModel[] = AI_MODELS): string[] {
    return catalog
        .filter((model) => model.keywords.some((keyword) => matchesKeyword(text, keyword)))
        .map((model) => model.id);
}

export function detectTools(text: string): string[] {
    return AI_TOOLS.filter((tool) => tool.keywords.some((keyword) => matchesKeyword(text, keyword))).map(
        (tool) => tool.id
    );
}

/**
 * Only AI-native tools count as attribution. Mentioning Python or React is
 * context, not "made with AI", so those are excluded from this list.
 */
export function detectAiTools(text: string): string[] {
    return AI_TOOLS.filter(
        (tool) => tool.ai && tool.keywords.some((keyword) => matchesKeyword(text, keyword))
    ).map((tool) => tool.id);
}

export function classifyBuild(input: {
    text: string;
    topics?: string[];
    models?: string[];
}): BuildCategory {
    const haystack = [input.text, ...(input.topics || [])].join(' ');

    for (const rule of CATEGORY_RULES) {
        if (rule.pattern.test(haystack)) {
            return rule.category;
        }
    }

    const abilities = new Set(
        (input.models || []).flatMap((id) => AI_MODELS.find((model) => model.id === id)?.abilities || [])
    );

    if (abilities.has('image') || abilities.has('video') || abilities.has('audio')) {
        return 'creative';
    }

    if (abilities.has('code')) {
        return 'devtool';
    }

    return 'other';
}

export function categoryLabel(id: BuildCategory): string {
    return getCategory(id)?.label || 'Other';
}

export function isBuildCategory(value: string): value is BuildCategory {
    return BUILD_CATEGORIES.some((category) => category.id === value);
}

export function formatCompactNumber(value: number): string {
    if (!Number.isFinite(value) || value < 0) {
        return '0';
    }

    if (value < 1000) {
        return `${Math.round(value)}`;
    }

    if (value < 1_000_000) {
        const thousands = value / 1000;
        return `${thousands >= 100 ? Math.round(thousands) : Number(thousands.toFixed(1))}k`;
    }

    const millions = value / 1_000_000;
    return `${millions >= 100 ? Math.round(millions) : Number(millions.toFixed(1))}m`;
}

export function formatRelativeTime(isoTimestamp: string, now: Date | number = Date.now()): string {
    const timestamp = Date.parse(isoTimestamp);
    if (Number.isNaN(timestamp)) {
        return 'unknown date';
    }

    const nowMs = typeof now === 'number' ? now : now.getTime();
    const diffMs = nowMs - timestamp;

    if (diffMs < 0) {
        return 'scheduled';
    }

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    return `${Math.floor(months / 12)}y ago`;
}

export function canonicalUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        parsed.hash = '';

        for (const key of [...parsed.searchParams.keys()]) {
            if (key.startsWith('utm_') || ['ref', 's', 't', 'si'].includes(key)) {
                parsed.searchParams.delete(key);
            }
        }

        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        const path = parsed.pathname.replace(/\/+$/, '');
        const search = parsed.searchParams.toString();

        return `${host}${path}${search ? `?${search}` : ''}`;
    } catch {
        return null;
    }
}

export function dedupeBuilds(items: AiBuild[]): AiBuild[] {
    const seen = new Set<string>();
    const result: AiBuild[] = [];

    for (const item of items) {
        const sourceKey = canonicalUrl(item.source.url);
        const buildKey = item.buildUrl ? canonicalUrl(item.buildUrl) : null;
        const keys = [
            item.id,
            sourceKey ? `url:${sourceKey}` : null,
            buildKey ? `url:${buildKey}` : null,
        ].filter(Boolean) as string[];

        if (keys.some((key) => seen.has(key))) {
            continue;
        }

        keys.forEach((key) => seen.add(key));
        result.push(item);
    }

    return result;
}

/**
 * Ranking signal for the "Trending" sort. Engagement is weighted by kind
 * (reposts > comments > likes) and decayed with age so week-old posts do not
 * sit on top forever. Curated picks get a small editorial boost so the gallery
 * still ranks sensibly before any live token is configured.
 */
export function buildPublishedAt(build: AiBuild): string {
    return build.source.postedAt || build.addedAt;
}

export function scoreBuild(build: AiBuild, now: Date | number = Date.now()): number {
    const nowMs = typeof now === 'number' ? now : now.getTime();
    const postedMs = Date.parse(buildPublishedAt(build));
    const ageDays = Number.isNaN(postedMs) ? 30 : Math.max(0, (nowMs - postedMs) / 86_400_000);

    const engagement =
        (build.metrics?.likes || 0) * 1 +
        (build.metrics?.reposts || 0) * 3 +
        (build.metrics?.comments || 0) * 2 +
        (build.metrics?.stars || 0) * 1.5;

    const editorial = build.provenance === 'curated' ? 30 + (build.highlight ? 15 : 0) : 0;

    return (engagement + editorial) / Math.pow(ageDays + 2, 0.6);
}

export function sortBuilds(items: AiBuild[], sort: BuildSort, now: Date | number = Date.now()): AiBuild[] {
    const copy = [...items];

    if (sort === 'az') {
        return copy.sort((left, right) => left.title.localeCompare(right.title, 'en', { sensitivity: 'base' }));
    }

    if (sort === 'trending') {
        return copy.sort((left, right) => {
            const delta = scoreBuild(right, now) - scoreBuild(left, now);
            if (delta !== 0) return delta;
            return buildPublishedAt(right).localeCompare(buildPublishedAt(left));
        });
    }

    return copy.sort((left, right) => {
        const delta = buildPublishedAt(right).localeCompare(buildPublishedAt(left));
        if (delta !== 0) return delta;
        return scoreBuild(right, now) - scoreBuild(left, now);
    });
}

function searchableText(build: AiBuild): string {
    return [
        build.title,
        build.summary,
        build.maker.name,
        build.maker.handle || '',
        categoryLabel(build.category),
        ...build.tags,
        ...build.models.flatMap((id) => [id, modelLabel(id), vendorOfModel(id) || '']),
        ...build.tools,
        build.language || '',
    ]
        .join(' ')
        .toLowerCase();
}

export function filterBuilds(items: AiBuild[], filters: BuildFilters = {}): AiBuild[] {
    const queryTokens = normalizeWhitespace(filters.query || '')
        .toLowerCase()
        .split(' ')
        .filter(Boolean);

    return items.filter((build) => {
        if (filters.category && filters.category !== 'all' && build.category !== filters.category) {
            return false;
        }

        if (filters.platform && filters.platform !== 'all' && build.source.platform !== filters.platform) {
            return false;
        }

        if (filters.provenance && filters.provenance !== 'all' && build.provenance !== filters.provenance) {
            return false;
        }

        if (filters.model && filters.model !== 'all' && !build.models.includes(filters.model)) {
            return false;
        }

        if (
            filters.vendor &&
            filters.vendor !== 'all' &&
            !build.models.some((id) => vendorOfModel(id) === filters.vendor)
        ) {
            return false;
        }

        if (queryTokens.length > 0) {
            const haystack = searchableText(build);
            if (!queryTokens.every((token) => haystack.includes(token))) {
                return false;
            }
        }

        return true;
    });
}

export function collectFacets(items: AiBuild[]): BuildFacetCounts {
    const facets: BuildFacetCounts = {
        categories: {},
        platforms: {},
        models: {},
        vendors: {},
    };

    for (const build of items) {
        facets.categories[build.category] = (facets.categories[build.category] || 0) + 1;
        facets.platforms[build.source.platform] = (facets.platforms[build.source.platform] || 0) + 1;

        for (const model of build.models) {
            facets.models[model] = (facets.models[model] || 0) + 1;
            const vendor = vendorOfModel(model);
            if (vendor) {
                facets.vendors[vendor] = (facets.vendors[vendor] || 0) + 1;
            }
        }
    }

    return facets;
}

/**
 * Turns a build into a ready-to-paste writing task for the Pryzmira desk.
 * Used by the "Write about this" action on every gallery card.
 */
export function buildToWritingTask(build: AiBuild): string {
    const modelNames = build.models.map(modelLabel);
    const modelLine =
        modelNames.length > 1
            ? `It was built with ${modelNames.slice(0, 3).join(', ')}.`
            : modelNames.length === 1
              ? `It was built with ${modelNames[0]}.`
              : '';

    return [
        `Write a short launch note for "${build.title}" by ${build.maker.name}.`,
        `What it is: ${truncate(build.summary, 180, '…')}`,
        modelLine,
        'Keep it concrete, name one specific benefit, and skip hype.',
    ]
        .filter(Boolean)
        .join(' ');
}

export function platformLabel(platform: BuildPlatform): string {
    switch (platform) {
        case 'x':
            return 'X (Twitter)';
        case 'github':
            return 'GitHub';
        case 'huggingface':
            return 'Hugging Face';
        case 'product-hunt':
            return 'Product Hunt';
        default:
            return 'Web';
    }
}

export function buildSourceLabel(platform: BuildPlatform): string {
    switch (platform) {
        case 'x':
            return 'X post';
        case 'github':
            return 'GitHub repo';
        case 'huggingface':
            return 'HF Space';
        case 'product-hunt':
            return 'Product Hunt';
        default:
            return 'Website';
    }
}

export function isBuildPlatform(value: string): value is BuildPlatform {
    return ['x', 'github', 'product-hunt', 'huggingface', 'web'].includes(value);
}

export function isBuildSort(value: string): value is BuildSort {
    return ['recent', 'trending', 'az'].includes(value);
}

export const ALL_CATEGORIES: BuildCategory[] = BUILD_CATEGORIES.map((category) => category.id);
