import { NextResponse } from 'next/server';

// In-memory click tracking (replace with database for production)
const clickStore = new Map<string, { clicks: number; lastClick: number }>();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const toolId = searchParams.get('id');
    const ref = searchParams.get('ref'); // affiliate reference

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Validate URL to prevent open redirect
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Track the click
    const key = toolId || url;
    const existing = clickStore.get(key) || { clicks: 0, lastClick: 0 };
    clickStore.set(key, { clicks: existing.clicks + 1, lastClick: Date.now() });

    console.log(`[Affiliate] Click: tool=${toolId || 'unknown'} ref=${ref || 'none'} url=${url} total=${existing.clicks + 1}`);

    // Build the final URL with affiliate parameters if applicable
    let finalUrl = url;
    if (ref) {
        const targetUrl = new URL(url);
        targetUrl.searchParams.set('ref', ref);
        finalUrl = targetUrl.toString();
    }

    // Redirect to the tool
    return NextResponse.redirect(finalUrl, 307);
}

// Admin endpoint: get click stats
export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = Array.from(clickStore.entries()).map(([key, value]) => ({
        tool: key,
        clicks: value.clicks,
        lastClick: new Date(value.lastClick).toISOString(),
    }));

    stats.sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({ totalTools: stats.length, stats });
}
