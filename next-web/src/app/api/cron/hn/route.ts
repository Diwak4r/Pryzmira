import { NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { isAuthorizedCron, queueSubmission } from '@/lib/ingest';

export const maxDuration = 30;

// Free, no-key search over Hacker News — https://hn.algolia.com/api
const QUERIES = ['GPT', 'Gemini', 'Claude', 'Llama', 'Sora', 'Grok', 'demo release'];

interface HnHit {
    objectID: string;
    title: string;
    url: string | null;
    author: string;
    created_at: string;
    points: number | null;
}

export async function GET(request: Request) {
    if (!isAuthorizedCron(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({ skipped: 'Supabase not configured.' });
    }

    const client = getServerSupabase();
    if (!client) return NextResponse.json({ skipped: 'Supabase client unavailable.' });

    const results: Record<string, string> = {};

    for (const query of QUERIES) {
        try {
            const res = await fetch(
                `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`,
            );
            if (!res.ok) {
                results[query] = `fetch failed: ${res.status}`;
                continue;
            }

            const json = await res.json();
            const hits: HnHit[] = json?.hits ?? [];
            let inserted = 0;

            for (const hit of hits) {
                const url = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
                const outcome = await queueSubmission(client, {
                    url,
                    note: `auto-ingested from Hacker News (query: ${query})`,
                    preview: {
                        platform: 'article',
                        mediaKind: 'link',
                        title: hit.title,
                        creatorHandle: hit.author,
                        postedAt: hit.created_at,
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
