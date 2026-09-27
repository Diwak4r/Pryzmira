/**
 * In-memory sliding-window limiter. Good enough for a single-region side
 * project; resets on cold start and doesn't share state across serverless
 * instances. Swap for an Upstash/KV-backed limiter if abuse becomes real.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
        hits.set(key, timestamps);
        return true;
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    return false;
}

export function requestIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || 'unknown';
}
