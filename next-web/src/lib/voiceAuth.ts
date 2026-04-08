import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ACCESS_COOKIE = 'pryzmira_voice_access_token';
const REFRESH_COOKIE = 'pryzmira_voice_refresh_token';
const PKCE_COOKIE = 'pryzmira_pkce_verifier';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const PKCE_MAX_AGE = 60 * 10; // 10 minutes
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

    return url.trim().replace(/\/$/, '');
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
            try {
                return new URL(value).origin;
            } catch {
                continue;
            }
        }
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('A trusted application URL is required in production.');
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

// --- Email + Password auth ---

export async function signUpWithPassword(
    email: string,
    password: string
): Promise<SupabaseSessionPayload> {
    return supabaseAuthRequest<SupabaseSessionPayload>('/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function signInWithPassword(
    email: string,
    password: string
): Promise<SupabaseSessionPayload> {
    return supabaseAuthRequest<SupabaseSessionPayload>(
        '/token?grant_type=password',
        {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }
    );
}

// --- Google OAuth (PKCE) ---

function base64url(buffer: Buffer): string {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generatePkce(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = base64url(randomBytes(48));
    const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest());
    return { codeVerifier, codeChallenge };
}

export function buildGoogleOAuthUrl(codeChallenge: string, redirectTo: string): string {
    const params = new URLSearchParams({
        provider: 'google',
        redirect_to: redirectTo,
        code_challenge: codeChallenge,
        code_challenge_method: 's256',
    });
    return `${getSupabaseUrl()}/auth/v1/authorize?${params.toString()}`;
}

export function buildOAuthCallbackUrl(requestUrl: string, nextPath = '/desk'): string {
    const callbackUrl = new URL('/auth/callback', getTrustedAppOrigin(requestUrl));
    callbackUrl.searchParams.set('next', sanitizeVoiceRedirectPath(nextPath));
    return callbackUrl.toString();
}

export async function exchangeOAuthCode(
    code: string,
    codeVerifier: string
): Promise<SupabaseSessionPayload> {
    return supabaseAuthRequest<SupabaseSessionPayload>(
        '/token?grant_type=pkce',
        {
            method: 'POST',
            body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
        }
    );
}

// --- Session management ---

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

export function setPkceCookie(response: NextResponse, codeVerifier: string): void {
    response.cookies.set(PKCE_COOKIE, codeVerifier, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: PKCE_MAX_AGE,
    });
}

export function clearPkceCookie(response: NextResponse): void {
    response.cookies.delete(PKCE_COOKIE);
}

export async function getPkceVerifier(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(PKCE_COOKIE)?.value || null;
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
