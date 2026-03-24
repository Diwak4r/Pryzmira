import { createHmac, timingSafeEqual } from 'node:crypto';

const STRATEGY_TOKEN_VERSION = 'v1';
const DEFAULT_TOKEN_LIFETIME_DAYS = 45;

function base64UrlEncode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function getStrategyAccessSecret(): string {
    const secret =
        process.env.STRATEGY_ACCESS_SECRET ||
        process.env.CRON_SECRET ||
        process.env.POSTGRES_URL_NON_POOLING ||
        process.env.POSTGRES_URL;

    if (secret) {
        return secret;
    }

    if (process.env.NODE_ENV !== 'production') {
        return 'pryzmira-local-strategy-secret';
    }

    throw new Error(
        'Strategy access is not configured. Add STRATEGY_ACCESS_SECRET or CRON_SECRET for signed workspace links.'
    );
}

function signPayload(payload: string): string {
    return createHmac('sha256', getStrategyAccessSecret()).update(payload).digest('base64url');
}

export function createStrategyResumeToken(
    profileId: string,
    expiresInDays = DEFAULT_TOKEN_LIFETIME_DAYS
): string {
    const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
    const payload = `${STRATEGY_TOKEN_VERSION}:${profileId}:${expiresAt}`;
    const signature = signPayload(payload);

    return `${base64UrlEncode(payload)}.${signature}`;
}

export function getStrategyResumeUrl(profileId: string, siteUrl: string): string {
    const token = createStrategyResumeToken(profileId);
    return `${siteUrl.replace(/\/$/, '')}/desk?token=${encodeURIComponent(token)}`;
}

export function verifyStrategyResumeToken(token: string): string | null {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
        return null;
    }

    const [encodedPayload, signature] = token.split('.', 2);

    if (!encodedPayload || !signature) {
        return null;
    }

    try {
        const payload = base64UrlDecode(encodedPayload);
        const expectedSignature = signPayload(payload);
        const provided = Buffer.from(signature, 'utf8');
        const expected = Buffer.from(expectedSignature, 'utf8');

        if (
            provided.length !== expected.length ||
            !timingSafeEqual(provided, expected)
        ) {
            return null;
        }

        const [version, profileId, expiresAtValue] = payload.split(':');
        const expiresAt = Number(expiresAtValue);

        if (
            version !== STRATEGY_TOKEN_VERSION ||
            !profileId ||
            !Number.isFinite(expiresAt) ||
            expiresAt < Date.now()
        ) {
            return null;
        }

        return profileId;
    } catch {
        return null;
    }
}
