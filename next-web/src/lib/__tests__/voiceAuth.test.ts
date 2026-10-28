import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    buildGoogleOAuthUrl,
    buildOAuthCallbackUrl,
    buildVoiceRedirectUrl,
    generatePkce,
    sanitizeVoiceRedirectPath,
} from '@/lib/voiceAuth';

const BASE64URL = /^[A-Za-z0-9_-]+$/;

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('sanitizeVoiceRedirectPath', () => {
    it('allows same-origin relative paths', () => {
        expect(sanitizeVoiceRedirectPath('/desk')).toBe('/desk');
        expect(sanitizeVoiceRedirectPath('/builds?model=claude')).toBe('/builds?model=claude');
    });

    it('rejects protocol-relative URLs that browsers treat as cross-origin', () => {
        expect(sanitizeVoiceRedirectPath('//evil.example')).toBe('/desk');
    });

    it('rejects absolute URLs', () => {
        expect(sanitizeVoiceRedirectPath('https://evil.example/steal')).toBe('/desk');
        expect(sanitizeVoiceRedirectPath('javascript:alert(1)')).toBe('/desk');
    });

    it('falls back for empty candidates', () => {
        expect(sanitizeVoiceRedirectPath(null)).toBe('/desk');
        expect(sanitizeVoiceRedirectPath(undefined)).toBe('/desk');
        expect(sanitizeVoiceRedirectPath('')).toBe('/desk');
    });

    it('honors a custom fallback', () => {
        expect(sanitizeVoiceRedirectPath('https://evil.example', '/builds')).toBe('/builds');
    });

    it('rejects paths with leading whitespace that could smuggle a scheme', () => {
        expect(sanitizeVoiceRedirectPath('  https://evil.example')).toBe('/desk');
    });
});

describe('buildVoiceRedirectUrl', () => {
    it('uses the request origin in non-production environments', () => {
        const url = buildVoiceRedirectUrl('http://localhost:3000/auth/callback', '/desk', 'success');

        expect(url.origin).toBe('http://localhost:3000');
        expect(url.pathname).toBe('/desk');
        expect(url.searchParams.get('auth')).toBe('success');
    });

    it('prefers the configured public app URL over the request origin', () => {
        vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://pryzmira.example');

        const url = buildVoiceRedirectUrl('http://0.0.0.0:3000/auth/callback', '/desk', 'error');

        expect(url.origin).toBe('https://pryzmira.example');
        expect(url.searchParams.get('auth')).toBe('error');
    });

    it('drops unsafe next paths', () => {
        const url = buildVoiceRedirectUrl(
            'http://localhost:3000/auth/callback',
            '//evil.example/phish',
            'success'
        );

        expect(url.origin).toBe('http://localhost:3000');
        expect(url.pathname).toBe('/desk');
    });
});

describe('generatePkce', () => {
    it('produces a verifier and a matching S256 challenge', () => {
        const { codeVerifier, codeChallenge } = generatePkce();
        const expectedChallenge = createHash('sha256')
            .update(codeVerifier)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        expect(codeVerifier).toMatch(BASE64URL);
        expect(codeChallenge).toMatch(BASE64URL);
        expect(codeChallenge).toBe(expectedChallenge);
        expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
        expect(codeVerifier.length).toBeLessThanOrEqual(128);
    });

    it('produces a fresh verifier on every call', () => {
        expect(generatePkce().codeVerifier).not.toBe(generatePkce().codeVerifier);
    });
});

describe('buildGoogleOAuthUrl', () => {
    it('builds a PKCE authorize URL against the Supabase project', () => {
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co/');

        const url = new URL(buildGoogleOAuthUrl('challenge-value', 'https://pryzmira.example/auth/callback'));

        expect(url.origin).toBe('https://project.supabase.co');
        expect(url.pathname).toBe('/auth/v1/authorize');
        expect(url.searchParams.get('provider')).toBe('google');
        expect(url.searchParams.get('code_challenge')).toBe('challenge-value');
        expect(url.searchParams.get('code_challenge_method')).toBe('s256');
        expect(url.searchParams.get('redirect_to')).toBe('https://pryzmira.example/auth/callback');
    });

    it('fails loudly when Supabase is not configured', () => {
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');

        expect(() => buildGoogleOAuthUrl('challenge', 'https://pryzmira.example/auth/callback')).toThrowError(
            /NEXT_PUBLIC_SUPABASE_URL is not configured/
        );
    });
});

describe('buildOAuthCallbackUrl', () => {
    it('includes a sanitized next path', () => {
        const callback = new URL(
            buildOAuthCallbackUrl('http://localhost:3000/api/voice/auth/oauth-start', '/desk')
        );

        expect(callback.pathname).toBe('/auth/callback');
        expect(callback.searchParams.get('next')).toBe('/desk');
    });

    it('sanitizes attacker-supplied next paths', () => {
        const callback = new URL(
            buildOAuthCallbackUrl(
                'http://localhost:3000/api/voice/auth/oauth-start',
                'https://evil.example'
            )
        );

        expect(callback.searchParams.get('next')).toBe('/desk');
    });
});
