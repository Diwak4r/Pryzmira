import type { LinkPreview, Platform } from './types';

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

export function detectPlatform(url: string): Platform {
    const host = safeHost(url);
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    if (host.includes('reddit.com')) return 'reddit';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('github.com')) return 'github';
    return 'article';
}

function safeHost(url: string): string {
    try {
        return new URL(url).host.toLowerCase();
    } catch {
        return '';
    }
}

/** Pulls a "Prompt: ..." style line out of freeform post text, if present. */
function extractPrompt(text: string | undefined | null): string | undefined {
    if (!text) return undefined;
    const match = text.match(/prompt\s*[:\-]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
    return match?.[1]?.trim() || undefined;
}

async function previewX(url: string): Promise<LinkPreview> {
    // Free, unauthenticated tweet-resolution API (same trick "paste a tweet"
    // sites use) — no X API budget required. See lib/linkPreview.ts callers
    // for the fallback path if this endpoint is ever unreachable.
    const match = url.match(/status(?:es)?\/(\d+)/);
    if (!match) throw new Error('Could not find a status id in that X/Twitter URL.');

    const res = await fetchWithTimeout(`https://api.fxtwitter.com/status/${match[1]}`);
    if (!res.ok) throw new Error('Could not fetch that post from X.');

    const json = await res.json();
    const tweet = json?.tweet;
    if (!tweet) throw new Error('That X post could not be resolved.');

    const video = tweet.media?.videos?.[0] ?? tweet.media?.all?.find((m: { type?: string }) => m.type === 'video');
    const photo = tweet.media?.photos?.[0];

    return {
        platform: 'x',
        mediaKind: video ? 'video' : photo ? 'image' : 'thread',
        title: (tweet.text as string)?.split('\n')[0]?.slice(0, 140) || 'Untitled post',
        creatorHandle: tweet.author?.screen_name ? `@${tweet.author.screen_name}` : undefined,
        creatorName: tweet.author?.name,
        promptText: extractPrompt(tweet.text),
        videoUrl: video?.url,
        thumbnailUrl: photo?.url ?? video?.thumbnail_url ?? tweet.author?.avatar_url,
        postedAt: tweet.created_at ? new Date(tweet.created_at).toISOString() : undefined,
        sourceUrl: url,
    };
}

async function previewReddit(url: string): Promise<LinkPreview> {
    const clean = url.split('?')[0].replace(/\/$/, '');
    const res = await fetchWithTimeout(`${clean}.json`, {
        headers: { 'User-Agent': 'prismira/1.0 (link preview)' },
    });
    if (!res.ok) throw new Error('Could not fetch that Reddit post.');

    const json = await res.json();
    const post = json?.[0]?.data?.children?.[0]?.data;
    if (!post) throw new Error('That Reddit post could not be resolved.');

    const isVideo = Boolean(post.is_video);
    const videoUrl = isVideo ? post.media?.reddit_video?.fallback_url : undefined;
    const isImage = /\.(png|jpe?g|gif)$/i.test(post.url ?? '');

    return {
        platform: 'reddit',
        mediaKind: isVideo ? 'video' : isImage ? 'image' : 'thread',
        title: post.title || 'Untitled post',
        creatorHandle: post.author ? `u/${post.author}` : undefined,
        promptText: extractPrompt(post.selftext),
        videoUrl,
        thumbnailUrl: isImage ? post.url : post.thumbnail?.startsWith('http') ? post.thumbnail : undefined,
        postedAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : undefined,
        sourceUrl: url,
    };
}

async function previewYoutube(url: string): Promise<LinkPreview> {
    const res = await fetchWithTimeout(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) throw new Error('Could not fetch that YouTube video.');

    const json = await res.json();

    return {
        platform: 'youtube',
        mediaKind: 'video',
        title: json.title || 'Untitled video',
        creatorHandle: json.author_name,
        thumbnailUrl: json.thumbnail_url,
        sourceUrl: url,
    };
}

async function previewGeneric(url: string, platform: Platform): Promise<LinkPreview> {
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'prismira/1.0 (link preview)' } });
    if (!res.ok) throw new Error('Could not fetch that page.');

    const html = await res.text();
    const meta = (prop: string) =>
        html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1] ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'))?.[1];

    return {
        platform,
        mediaKind: platform === 'github' ? 'code' : 'link',
        title: meta('og:title') || html.match(/<title>([^<]+)<\/title>/i)?.[1] || url,
        thumbnailUrl: meta('og:image'),
        sourceUrl: url,
    };
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
    const platform = detectPlatform(url);

    switch (platform) {
        case 'x':
            return previewX(url);
        case 'reddit':
            return previewReddit(url);
        case 'youtube':
            return previewYoutube(url);
        default:
            return previewGeneric(url, platform);
    }
}
