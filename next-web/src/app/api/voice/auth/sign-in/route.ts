import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import {
    applySupabaseSessionToResponse,
    signInWithPassword,
    signUpWithPassword,
} from '@/lib/voiceAuth';
import { checkSignInRateLimit } from '@/lib/voiceRateLimit';

function normalizeAuthError(mode: 'signin' | 'signup', message: string): { error: string; status: number } {
    const normalized = message.toLowerCase();

    if (normalized.includes('rate limit')) {
        return {
            error: 'Too many authentication attempts. Please wait and try again.',
            status: 429,
        };
    }

    if (mode === 'signup' && normalized.includes('already registered')) {
        return {
            error: 'This email is already registered. Sign in instead.',
            status: 409,
        };
    }

    if (normalized.includes('email not confirmed')) {
        return {
            error: 'Check your email and confirm your account before signing in.',
            status: 403,
        };
    }

    if (
        normalized.includes('invalid login credentials') ||
        normalized.includes('invalid grant') ||
        normalized.includes('invalid email or password')
    ) {
        return {
            error: 'Invalid email or password.',
            status: 401,
        };
    }

    return {
        error: mode === 'signup' ? 'Unable to create account right now.' : 'Authentication failed.',
        status: 401,
    };
}

export async function POST(request: Request) {
    let mode: 'signin' | 'signup' = 'signin';

    try {
        const body = (await request.json()) as {
            email?: string;
            password?: string;
            mode?: 'signin' | 'signup';
        };

        const email = body.email?.trim().toLowerCase();
        const password = body.password;
        mode = body.mode || 'signin';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }

        if (!password || password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters.' },
                { status: 400 }
            );
        }

        const requestHeaders = await headers();
        const forwardedFor =
            requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || 'unknown';
        const ipAddress = forwardedFor.split(',')[0]?.trim() || 'unknown';
        const rateLimit = checkSignInRateLimit({ email, ipAddress });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: rateLimit.message },
                {
                    status: 429,
                    headers: { 'Retry-After': `${rateLimit.retryAfterSeconds}` },
                }
            );
        }

        const session =
            mode === 'signup'
                ? await signUpWithPassword(email, password)
                : await signInWithPassword(email, password);

        // When email confirmation is enabled, signup returns user without session tokens
        if (!session.access_token) {
            return NextResponse.json({
                ok: true,
                needsConfirmation: true,
                user: null,
            });
        }

        const response = NextResponse.json({
            ok: true,
            user: { id: session.user.id, email: session.user.email },
        });

        await applySupabaseSessionToResponse(response, session);
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed.';
        const normalized = normalizeAuthError(mode, message);
        return NextResponse.json({ error: normalized.error }, { status: normalized.status });
    }
}
