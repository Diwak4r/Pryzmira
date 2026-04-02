import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ACCESS_COOKIE = 'pryzmira_voice_access_token';
const REFRESH_COOKIE = 'pryzmira_voice_refresh_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const APP_URL_ENV_KEYS = [
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SITE_URL',
    'SITE_URL',
] as const;

interface SupabaseUser {
    id: string;
    email?: string;
}

interface SupabaseSessionPayload {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    user: SupabaseUser;
}

function getSupabaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
    }

    return url.replace(/\/$/, '');
}

function getSupabaseAnonKey(): string {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
        throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.');
    }

    return key;
}

function getTrustedAppOrigin(requestUrl?: string): string {
    for (const key of APP_URL_ENV_KEYS) {
        const value = process.env[key];
        if (value) {
            return new URL(value).origin;
        }
    }

    if (requestUrl) {
        return new URL(requestUrl).origin;
    }

    throw new Error('A trusted application URL is not configured.');
}

export function sanitizeVoiceRedirectPath(
    candidate: string | null | undefined,
    fallback = '/desk'
): string {
    if (!candidate) {
        return fallback;
    }

    const normalized = candidate.trim();
    if (!normalized.startsWith('/') || normalized.startsWith('//')) {
        return fallback;
    }

    return normalized;
}

export function buildVoiceCallbackUrl(requestUrl: string, nextPath = '/desk'): string {
    const callbackUrl = new URL('/auth/callback', getTrustedAppOrigin(requestUrl));
    callbackUrl.searchParams.set('next', sanitizeVoiceRedirectPath(nextPath));
    return callbackUrl.toString();
}

export function buildVoiceRedirectUrl(
    requestUrl: string,
    nextPath: string | null | undefined,
    authStatus: 'success' | 'error'
): URL {
    const redirectUrl = new URL(
        sanitizeVoiceRedirectPath(nextPath),
        getTrustedAppOrigin(requestUrl)
    );
    redirectUrl.searchParams.set('auth', authStatus);
    return redirectUrl;
}

async function supabaseAuthRequest<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${getSupabaseUrl()}/auth/v1${path}`, {
        ...init,
        headers: {
            apikey: getSupabaseAnonKey(),
            Authorization: `Bearer ${getSupabaseAnonKey()}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
        throw new Error(
            typeof payload.msg === 'string'
                ? payload.msg
                : typeof payload.error_description === 'string'
                  ? payload.error_description
                  : 'Supabase auth request failed.'
        );
    }

    return payload as T;
}

export async function sendMagicLinkEmail(email: string, redirectTo: string): Promise<void> {
    await supabaseAuthRequest('/otp', {
        method: 'POST',
        body: JSON.stringify({
            email,
            create_user: true,
            email_redirect_to: redirectTo,
        }),
    });
}

export async function verifyMagicLinkToken(tokenHash: string, type: string): Promise<SupabaseSessionPayload> {
    return supabaseAuthRequest<SupabaseSessionPayload>('/verify', {
        method: 'POST',
        body: JSON.stringify({
            token_hash: tokenHash,
            type,
        }),
    });
}

async function refreshSession(refreshToken: string): Promise<SupabaseSessionPayload> {
    const response = await fetch(`${getSupabaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
            apikey: getSupabaseAnonKey(),
            Authorization: `Bearer ${getSupabaseAnonKey()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
        cache: 'no-store',
    });

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
        throw new Error(
            typeof payload.error_description === 'string'
                ? payload.error_description
                : 'Unable to refresh Supabase session.'
        );
    }

    return payload as unknown as SupabaseSessionPayload;
}

async function fetchUser(accessToken: string): Promise<SupabaseUser> {
    const response = await fetch(`${getSupabaseUrl()}/auth/v1/user`, {
        headers: {
            apikey: getSupabaseAnonKey(),
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Unable to load Supabase user.');
    }

    return (await response.json()) as SupabaseUser;
}

export async function applySupabaseSessionToResponse(
    response: NextResponse,
    session: SupabaseSessionPayload
): Promise<void> {
    response.cookies.set(ACCESS_COOKIE, session.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    });
    response.cookies.set(REFRESH_COOKIE, session.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    });
}

export function clearSupabaseSessionFromResponse(response: NextResponse): void {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
}

export async function getAuthenticatedVoiceUser(): Promise<SupabaseUser | null> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
        const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

        if (!accessToken) {
            return null;
        }

        try {
            return await fetchUser(accessToken);
        } catch {
            if (!refreshToken) {
                return null;
            }

            const nextSession = await refreshSession(refreshToken);
            cookieStore.set(ACCESS_COOKIE, nextSession.access_token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: COOKIE_MAX_AGE,
            });
            cookieStore.set(REFRESH_COOKIE, nextSession.refresh_token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: COOKIE_MAX_AGE,
            });

            return nextSession.user || (await fetchUser(nextSession.access_token));
        }
    } catch {
        return null;
    }
}
