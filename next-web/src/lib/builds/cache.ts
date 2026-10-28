export interface TtlCache<T> {
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): void;
    clear(): void;
    size(): number;
}

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

/**
 * Tiny in-memory TTL cache used to keep live source calls off the critical
 * path. It is intentionally process-local: a cold start costs one upstream
 * request, which is fine for a gallery that refreshes every few minutes.
 */
export function createTtlCache<T>(options: {
    ttlMs: number;
    now?: () => number;
    maxEntries?: number;
}): TtlCache<T> {
    const now = options.now || (() => Date.now());
    const maxEntries = Math.max(1, options.maxEntries ?? 16);
    const entries = new Map<string, CacheEntry<T>>();

    return {
        get(key) {
            const entry = entries.get(key);
            if (!entry) {
                return undefined;
            }

            if (entry.expiresAt <= now()) {
                entries.delete(key);
                return undefined;
            }

            return entry.value;
        },
        set(key, value) {
            if (entries.size >= maxEntries && !entries.has(key)) {
                const oldestKey = entries.keys().next().value;
                if (oldestKey !== undefined) {
                    entries.delete(oldestKey);
                }
            }

            entries.set(key, {
                value,
                expiresAt: now() + options.ttlMs,
            });
        },
        delete(key) {
            entries.delete(key);
        },
        clear() {
            entries.clear();
        },
        size() {
            return entries.size;
        },
    };
}
