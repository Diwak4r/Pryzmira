import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { buildVoiceCallbackUrl, sendMagicLinkEmail } from '@/lib/voiceAuth';
import { checkMagicLinkRateLimit } from '@/lib/voiceRateLimit';

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as { email?: string };
        const email = body.email?.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }

        const requestHeaders = await headers();
        const forwardedFor = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || 'unknown';
        const ipAddress = forwardedFor.split(',')[0]?.trim() || 'unknown';
        const rateLimit = checkMagicLinkRateLimit({ email, ipAddress });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: rateLimit.message },
                {
                    status: 429,
                    headers: {
                        'Retry-After': `${rateLimit.retryAfterSeconds}`,
                    },
                }
            );
        }

        await sendMagicLinkEmail(email, buildVoiceCallbackUrl(request.url, '/desk'));

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send magic link.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
