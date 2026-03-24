import { NextResponse } from 'next/server';
import { aiTools } from '@/data/mockData';

const clickStore = new Map<string, { clicks: number; lastClick: number }>();

function normalizeUrl(value: string): string | null {
    try {
        const parsed = new URL(value);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }

        const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
        return `${parsed.protocol}//${parsed.host}${pathname}${parsed.search}`;
    } catch {
        return null;
    }
}

function getToolDestination(tool: (typeof aiTools)[number]): string {
    if ('affiliateUrl' in tool && typeof tool.affiliateUrl === 'string') {
        return tool.affiliateUrl;
    }

    return tool.url;
}

const toolUrlMap = new Map(
    aiTools
        .map((tool) => [tool.id, normalizeUrl(getToolDestination(tool))] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
);

const allowedToolUrls = new Set(toolUrlMap.values());

function getAllowedTarget(toolId: string | null, url: string): string | null {
    const configuredUrl = toolId ? toolUrlMap.get(toolId) : null;
    if (configuredUrl) {
        return configuredUrl;
    }

    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl || !allowedToolUrls.has(normalizedUrl)) {
        return null;
    }

    return normalizedUrl;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const toolId = searchParams.get('id');
    const ref = searchParams.get('ref');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const target = getAllowedTarget(toolId, url);
    if (!target) {
        return NextResponse.json({ error: 'Unknown tool destination' }, { status: 400 });
    }

    const key = toolId || target;
    const existing = clickStore.get(key) || { clicks: 0, lastClick: 0 };
    clickStore.set(key, { clicks: existing.clicks + 1, lastClick: Date.now() });

    console.log(
        `[Affiliate] Click: tool=${toolId || 'unknown'} ref=${ref || 'none'} url=${target} total=${existing.clicks + 1}`
    );

    const finalUrl = new URL(target);
    if (ref) {
        finalUrl.searchParams.set('ref', ref);
    }

    return NextResponse.redirect(finalUrl, 307);
}

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
