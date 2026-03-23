import { NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS) return false;
    record.count++;
    return true;
}

// Simple in-memory cache (5 min TTL)
const cache = new Map<string, { data: unknown; expires: number }>();

export async function GET(request: Request) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const TAVILY_KEY = process.env.TAVILY_API_KEY;
    if (!TAVILY_KEY) {
        return NextResponse.json({ error: 'Tavily API not configured' }, { status: 503 });
    }

    // Check cache
    const cacheKey = `tavily:${query.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
        return NextResponse.json(cached.data);
    }

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: TAVILY_KEY,
                query: `${query} AI tool`,
                search_depth: 'basic',
                include_answer: true,
                max_results: 8,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('[Tavily] API error:', err);
            return NextResponse.json({ error: 'Search service error' }, { status: 502 });
        }

        const data = await response.json();

        const results = {
            answer: data.answer || null,
            results: (data.results || []).map((r: { title: string; url: string; content: string }) => ({
                title: r.title,
                url: r.url,
                snippet: r.content?.slice(0, 200),
            })),
            query,
        };

        // Cache for 5 min
        cache.set(cacheKey, { data: results, expires: Date.now() + 5 * 60 * 1000 });

        return NextResponse.json(results);
    } catch (error) {
        console.error('[Tavily] Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
