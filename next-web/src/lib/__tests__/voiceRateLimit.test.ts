import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkSignInRateLimit } from '@/lib/voiceRateLimit';

const START = new Date('2026-01-01T00:00:00.000Z');

function resetStore(): void {
    const store = (globalThis as unknown as { __pryzmiraVoiceRateLimitStore?: Map<string, number[]> })
        .__pryzmiraVoiceRateLimitStore;
    store?.clear();
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
    resetStore();
});

afterEach(() => {
    vi.useRealTimers();
    resetStore();
});

describe('checkSignInRateLimit', () => {
    it('allows five attempts per email and blocks the sixth', () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            expect(
                checkSignInRateLimit({ email: 'writer@example.com', ipAddress: '203.0.113.7' })
            ).toEqual({ allowed: true, retryAfterSeconds: 0 });
        }

        const blocked = checkSignInRateLimit({ email: 'writer@example.com', ipAddress: '203.0.113.7' });

        expect(blocked.allowed).toBe(false);
        expect(blocked.retryAfterSeconds).toBe(15 * 60);
        expect(blocked.message).toMatch(/too many sign-in attempts/i);
    });

    it('normalizes email casing and whitespace into the same bucket', () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            checkSignInRateLimit({ email: 'Writer@Example.com ', ipAddress: '198.51.100.1' });
        }

        expect(
            checkSignInRateLimit({ email: 'writer@example.com', ipAddress: '198.51.100.1' }).allowed
        ).toBe(false);
    });

    it('tracks different emails independently', () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            checkSignInRateLimit({ email: 'a@example.com', ipAddress: '198.51.100.2' });
        }

        expect(
            checkSignInRateLimit({ email: 'b@example.com', ipAddress: '198.51.100.2' }).allowed
        ).toBe(true);
    });

    it('blocks an IP after fifteen attempts across different emails', () => {
        for (let attempt = 0; attempt < 15; attempt += 1) {
            const decision = checkSignInRateLimit({
                email: `user${attempt}@example.com`,
                ipAddress: '198.51.100.50',
            });
            expect(decision.allowed).toBe(true);
        }

        const blocked = checkSignInRateLimit({ email: 'fresh@example.com', ipAddress: '198.51.100.50' });

        expect(blocked.allowed).toBe(false);
        expect(blocked.retryAfterSeconds).toBe(60 * 60);
    });

    it('reports a decreasing retry window', () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            checkSignInRateLimit({ email: 'clock@example.com', ipAddress: '192.0.2.9' });
        }

        vi.advanceTimersByTime(5 * 60 * 1000);

        const blocked = checkSignInRateLimit({ email: 'clock@example.com', ipAddress: '192.0.2.9' });

        expect(blocked.allowed).toBe(false);
        expect(blocked.retryAfterSeconds).toBe(10 * 60);
    });

    it('lets the user back in once the window has passed', () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            checkSignInRateLimit({ email: 'later@example.com', ipAddress: '192.0.2.20' });
        }

        vi.advanceTimersByTime(15 * 60 * 1000 + 1);

        expect(
            checkSignInRateLimit({ email: 'later@example.com', ipAddress: '192.0.2.20' }).allowed
        ).toBe(true);
    });

    it('stores hashed identifiers instead of raw emails or IPs', () => {
        checkSignInRateLimit({ email: 'secret@example.com', ipAddress: '203.0.113.99' });

        const store = (globalThis as unknown as { __pryzmiraVoiceRateLimitStore?: Map<string, number[]> })
            .__pryzmiraVoiceRateLimitStore;
        const keys = Array.from(store?.keys() || []);
        const serialized = keys.join('|');

        expect(keys.length).toBeGreaterThan(0);
        expect(serialized).not.toContain('secret@example.com');
        expect(serialized).not.toContain('203.0.113.99');
        for (const key of keys) {
            expect(key).toMatch(/^[a-z-]+:[a-f0-9]{64}$/);
        }
    });
});
