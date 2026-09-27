import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { isRateLimited, requestIp } from '@/lib/rateLimit';
import type { LinkPreview } from '@/lib/types';

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
    const ip = requestIp(request);
    if (isRateLimited(`submit:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
        return NextResponse.json({ error: 'Too many submissions from you in the last hour — try again later.' }, { status: 429 });
    }

    let body: { url?: string; note?: string; preview?: LinkPreview; honeypot?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    // Hidden form field real users never fill in — if it's set, silently accept and drop.
    if (body.honeypot) {
        return NextResponse.json({ ok: true });
    }

    if (!body.url || typeof body.url !== 'string') {
        return NextResponse.json({ error: 'A url is required.' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({
            ok: true,
            note: 'No database configured yet — this submission was validated but not stored. Set up Supabase to persist it.',
        });
    }

    const client = getServerSupabase();
    if (!client) {
        return NextResponse.json({ error: 'Submissions are temporarily unavailable.' }, { status: 503 });
    }

    const ipHash = createHash('sha256').update(ip).digest('hex');

    const { data: existing } = await client.from('submissions').select('id').eq('url', body.url).maybeSingle();
    if (existing) {
        return NextResponse.json({ ok: true, note: 'That link has already been submitted — thanks anyway!' });
    }

    const { error } = await client.from('submissions').insert({
        url: body.url,
        note: body.note?.slice(0, 500) || null,
        status: 'pending',
        ip_hash: ipHash,
        preview_json: body.preview ?? null,
    });

    if (error) {
        return NextResponse.json({ error: 'Could not save that submission — try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
