/**
 * Shared types for the Pryzmira build gallery.
 *
 * A "build" is something a person shipped with (or on top of) an AI model.
 * Items arrive from one of two places:
 *  - `live`    : fetched from X / GitHub at request time (cached briefly)
 *  - `curated` : hand-picked by the Pryzmira team so the gallery always works
 *                without API keys
 */

export type BuildCategory =
    | 'app'
    | 'agent'
    | 'devtool'
    | 'creative'
    | 'research'
    | 'game'
    | 'other';

export type BuildPlatform = 'x' | 'github' | 'product-hunt' | 'huggingface' | 'web';

export type BuildProvenance = 'curated' | 'live';

export type BuildSort = 'recent' | 'trending' | 'az';

export type ModelAbility = 'text' | 'code' | 'image' | 'video' | 'audio' | 'reasoning';

export interface BuildMaker {
    /** Display name of the person or team. */
    name: string;
    /** Handle without the leading @. Optional when it is not public. */
    handle?: string;
    avatarUrl?: string;
    verified?: boolean;
}

export interface BuildMetrics {
    likes?: number;
    reposts?: number;
    comments?: number;
    stars?: number;
}

export interface BuildSourceLink {
    platform: BuildPlatform;
    /** Canonical URL for the post or project page. */
    url: string;
    /**
     * ISO timestamp for when the build was published or posted.
     * Live items always set this. Curated entries leave it undefined rather
     * than invent a launch date for someone else's project.
     */
    postedAt?: string;
    /** Human label, e.g. "X post" or "GitHub repo". */
    label?: string;
}

export interface AiBuild {
    /** Stable id, e.g. `x:1234567890` or `curated:lovable`. */
    id: string;
    title: string;
    summary: string;
    maker: BuildMaker;
    /** Catalog model ids, e.g. `claude-sonnet-4-5`. */
    models: string[];
    /** Catalog tool ids, e.g. `cursor`, `nextjs`. */
    tools: string[];
    category: BuildCategory;
    tags: string[];
    source: BuildSourceLink;
    /** Direct link to the build itself, when the source is a post about it. */
    buildUrl?: string;
    metrics?: BuildMetrics;
    provenance: BuildProvenance;
    /** ISO timestamp for when this item entered the Pryzmira catalog. */
    addedAt: string;
    /** Short editorial note explaining why this build is worth a look. */
    highlight?: string;
    /** Primary implementation language, when known. */
    language?: string;
}

export interface BuildFilters {
    query?: string;
    category?: BuildCategory | 'all';
    model?: string | 'all';
    vendor?: string | 'all';
    platform?: BuildPlatform | 'all';
    provenance?: BuildProvenance | 'all';
}

export interface BuildFacetCounts {
    categories: Record<string, number>;
    platforms: Record<string, number>;
    models: Record<string, number>;
    vendors: Record<string, number>;
}

export interface SourceStatus {
    platform: BuildPlatform;
    status: 'live' | 'skipped' | 'error';
    count: number;
    /** Human-readable explanation, e.g. "X_BEARER_TOKEN not set". */
    detail?: string;
}

export interface BuildFeedMeta {
    generatedAt: string;
    /** Every item the feed produced before filtering. */
    available: number;
    /** Items after filtering (set by the API route). */
    total: number;
    counts: {
        curated: number;
        live: number;
    };
    sources: SourceStatus[];
    /** True when no live source could be reached, so curated picks are shown. */
    curatedOnly: boolean;
}

export interface BuildFeed {
    items: AiBuild[];
    meta: BuildFeedMeta;
}

/** Shape returned by `GET /api/builds`. */
export interface BuildFeedResponse {
    items: AiBuild[];
    meta: BuildFeedMeta;
    facets: BuildFacetCounts;
    filters?: BuildFilters;
    sort?: BuildSort;
}
