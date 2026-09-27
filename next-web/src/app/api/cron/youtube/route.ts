import { NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { isAuthorizedCron, queueSubmission } from '@/lib/ingest';

export const maxDuration = 30;

// YouTube Data API v3 free daily quota (search.list costs 100 units of ~10,000/day) — set YOUTUBE_API_KEY to enable.
const QUERIES = ['new AI model demo', 'AI model release test', 'AI coding agent demo'];

interface YoutubeItem {
    id: { videoId: string };
    snippet: { title: string; channelTitle: string; publishedAt: string; thumbnails?: { high?: { url: string } } };
}

export async function GET(request: Request) {
    if (!isAuthorizedCron(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ skipped: 'YOUTUBE_API_KEY not set.' });
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({ skipped: 'Supabase not configured.' });
    }

    const client = getServerSupabase();
    if (!client) return NextResponse.json({ skipped: 'Supabase client unavailable.' });

    const results: Record<string, string> = {};

    for (const query of QUERIES) {
        try {
            const params = new URLSearchParams({
                key: apiKey,
                q: query,
                part: 'snippet',
                type: 'video',
                order: 'date',
                maxResults: '10',
            });
            const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
            if (!res.ok) {
                results[query] = `fetch failed: ${res.status}`;
                continue;
            }

            const json = await res.json();
            const items: YoutubeItem[] = json?.items ?? [];
            let inserted = 0;

            for (const item of items) {
                const url = `https://www.youtube.com/watch?v=${item.id.videoId}`;
                const outcome = await queueSubmission(client, {
                    url,
                    note: `auto-ingested from YouTube (query: ${query})`,
                    preview: {
                        platform: 'youtube',
                        mediaKind: 'video',
                        title: item.snippet.title,
                        creatorHandle: item.snippet.channelTitle,
                        thumbnailUrl: item.snippet.thumbnails?.high?.url,
                        postedAt: item.snippet.publishedAt,
                        sourceUrl: url,
                    },
                });
                if (outcome === 'inserted') inserted += 1;
            }

            results[query] = `${inserted} queued`;
        } catch (error) {
            results[query] = error instanceof Error ? error.message : 'unknown error';
        }
    }

    return NextResponse.json({ results });
}
