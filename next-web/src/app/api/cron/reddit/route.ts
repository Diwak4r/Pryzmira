import { NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { isAuthorizedCron, queueSubmission } from '@/lib/ingest';
import { fetchLinkPreview } from '@/lib/linkPreview';

export const maxDuration = 60;

// Free, no-auth JSON listing endpoints — respect Reddit's rate limits with a small subreddit list and the cron's own cadence.
const SUBREDDITS = ['LocalLLaMA', 'singularity', 'StableDiffusion', 'ChatGPT', 'aivideo', 'OpenAI'];

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

    for (const subreddit of SUBREDDITS) {
        try {
            const res = await fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=15`, {
                headers: { 'User-Agent': 'prismira-ingest/1.0 (+https://github.com/Diwak4r/Pryzmira)' },
            });
            if (!res.ok) {
                results[subreddit] = `fetch failed: ${res.status}`;
                continue;
            }

            const json = await res.json();
            const posts = json?.data?.children ?? [];
            let inserted = 0;

            for (const { data: post } of posts) {
                if (!post?.permalink) continue;
                const url = `https://www.reddit.com${post.permalink}`;

                try {
                    const preview = await fetchLinkPreview(url);
                    const outcome = await queueSubmission(client, {
                        url,
                        note: `auto-ingested from r/${subreddit}`,
                        preview,
                    });
                    if (outcome === 'inserted') inserted += 1;
                } catch {
                    // Skip posts we can't build a preview for (removed, non-media, etc).
                }
            }

            results[subreddit] = `${inserted} queued`;
        } catch (error) {
            results[subreddit] = error instanceof Error ? error.message : 'unknown error';
        }
    }

    return NextResponse.json({ results });
}
