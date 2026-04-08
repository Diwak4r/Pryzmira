import { createHash } from 'node:crypto';

interface RateLimitWindow {
    maxAttempts: number;
    windowMs: number;
    message: string;
}

interface RateLimitDecision {
    allowed: boolean;
    retryAfterSeconds: number;
    message?: string;
}

type RateLimitStore = Map<string, number[]>;

const RATE_LIMIT_STORE_KEY = '__pryzmiraVoiceRateLimitStore';

const SIGN_IN_EMAIL_WINDOW: RateLimitWindow = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
};

const SIGN_IN_IP_WINDOW: RateLimitWindow = {
    maxAttempts: 15,
    windowMs: 60 * 60 * 1000,
    message: 'Too many sign-in attempts. Please wait a little while and try again.',
};

function getRateLimitStore(): RateLimitStore {
    const globalStore = globalThis as typeof globalThis & {
        __pryzmiraVoiceRateLimitStore?: RateLimitStore;
    };

    if (!globalStore[RATE_LIMIT_STORE_KEY]) {
        globalStore[RATE_LIMIT_STORE_KEY] = new Map<string, number[]>();
    }

    return globalStore[RATE_LIMIT_STORE_KEY];
}

function hashIdentifier(value: string): string {
    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function buildBucketKey(scope: string, identifier: string): string {
    return `${scope}:${hashIdentifier(identifier)}`;
}

function getFreshAttempts(key: string, windowMs: number, now: number): number[] {
    const store = getRateLimitStore();
    const attempts = store.get(key) || [];
    const freshAttempts = attempts.filter((timestamp) => now - timestamp < windowMs);

    if (freshAttempts.length > 0) {
        store.set(key, freshAttempts);
    } else {
        store.delete(key);
    }

    return freshAttempts;
}

function recordAttempt(key: string, timestamp: number): void {
    const store = getRateLimitStore();
    const attempts = store.get(key) || [];
    attempts.push(timestamp);
    store.set(key, attempts);
}

function applyRateLimit(key: string, window: RateLimitWindow, now: number): RateLimitDecision {
    const attempts = getFreshAttempts(key, window.windowMs, now);
    if (attempts.length >= window.maxAttempts) {
        const retryAfterMs = Math.max(window.windowMs - (now - attempts[0]), 1000);
        return {
            allowed: false,
            retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
            message: window.message,
        };
    }

    recordAttempt(key, now);
    return {
        allowed: true,
        retryAfterSeconds: 0,
    };
}

export function checkSignInRateLimit(input: {
    email: string;
    ipAddress: string;
}): RateLimitDecision {
    const now = Date.now();
    const emailDecision = applyRateLimit(
        buildBucketKey('sign-in-email', input.email),
        SIGN_IN_EMAIL_WINDOW,
        now
    );
    if (!emailDecision.allowed) {
        return emailDecision;
    }

    return applyRateLimit(
        buildBucketKey('sign-in-ip', input.ipAddress),
        SIGN_IN_IP_WINDOW,
        now
    );
}
