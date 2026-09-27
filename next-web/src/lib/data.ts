import { getServerSupabase, isSupabaseConfigured } from './supabaseClient';
import { seedArtifacts, seedReleases } from './seed-data';
import type { Artifact, Category, FeedFilters, Platform, Release } from './types';

/**
 * Data access layer. Reads from Supabase when configured (production),
 * otherwise falls back to in-memory seed data so the app runs locally with
 * zero setup. Swap happens transparently — pages never import Supabase
 * directly.
 */

interface ArtifactRow {
    id: string;
    release_id: string;
    release_slug: string;
    release_name: string;
    platform: Platform;
    media_kind: Artifact['mediaKind'];
    source_url: string;
    video_url: string | null;
    thumbnail_url: string | null;
    title: string;
    prompt_text: string | null;
    creator_handle: string | null;
    creator_name: string | null;
    posted_at: string;
    first_seen_at: string;
    engagement_score: number | null;
    tags: string[] | null;
    category: Category;
    status: 'approved' | 'pending' | 'rejected';
}

function rowToArtifact(row: ArtifactRow): Artifact {
    return {
        id: row.id,
        releaseId: row.release_id,
        releaseSlug: row.release_slug,
        releaseName: row.release_name,
        platform: row.platform,
        mediaKind: row.media_kind,
        sourceUrl: row.source_url,
        videoUrl: row.video_url ?? undefined,
        thumbnailUrl: row.thumbnail_url ?? undefined,
        title: row.title,
        promptText: row.prompt_text ?? undefined,
        creatorHandle: row.creator_handle ?? undefined,
        creatorName: row.creator_name ?? undefined,
        postedAt: row.posted_at,
        firstSeenAt: row.first_seen_at,
        engagementScore: row.engagement_score ?? 0,
        tags: row.tags ?? [],
    };
}

function applyFilters(items: Artifact[], filters?: FeedFilters, categoryByRelease?: Map<string, Category>): Artifact[] {
    let result = items;

    if (filters?.platform) {
        result = result.filter((a) => a.platform === filters.platform);
    }

    if (filters?.tag) {
        result = result.filter((a) => a.tags.includes(filters.tag as string));
    }

    if (filters?.category && categoryByRelease) {
        result = result.filter((a) => categoryByRelease.get(a.releaseId) === filters.category);
    }

    if (filters?.sort === 'trending') {
        result = [...result].sort((a, b) => b.engagementScore - a.engagementScore);
    } else {
        result = [...result].sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
    }

    return result;
}

export async function getReleases(): Promise<Release[]> {
    const client = getServerSupabase();

    if (!client) {
        return [...seedReleases].sort((a, b) => Date.parse(b.releasedAt) - Date.parse(a.releasedAt));
    }

    const { data, error } = await client
        .from('releases')
        .select('id, slug, name, company, category, released_at')
        .order('released_at', { ascending: false });

    if (error || !data) return seedReleases;

    return data.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        company: r.company,
        category: r.category,
        releasedAt: r.released_at,
    }));
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
    const releases = await getReleases();
    return releases.find((r) => r.slug === slug) ?? null;
}

export async function getFeed(filters?: FeedFilters): Promise<Artifact[]> {
    if (!isSupabaseConfigured()) {
        const releases = await getReleases();
        const categoryByRelease = new Map(releases.map((r) => [r.id, r.category]));
        return applyFilters(seedArtifacts, filters, categoryByRelease);
    }

    const client = getServerSupabase();
    if (!client) return [];

    let query = client.from('artifacts').select('*').eq('status', 'approved');

    if (filters?.platform) query = query.eq('platform', filters.platform);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.tag) query = query.contains('tags', [filters.tag]);

    query = query.order(filters?.sort === 'trending' ? 'engagement_score' : 'posted_at', { ascending: false });

    const { data, error } = await query.limit(100);
    if (error || !data) return [];

    return (data as ArtifactRow[]).map(rowToArtifact);
}

export async function getArtifactsByReleaseSlug(slug: string): Promise<Artifact[]> {
    const feed = await getFeed();
    return feed.filter((a) => a.releaseSlug === slug);
}

export async function getAllTags(): Promise<string[]> {
    const feed = await getFeed();
    const tags = new Set<string>();
    feed.forEach((a) => a.tags.forEach((t) => tags.add(t)));
    return [...tags].sort();
}
