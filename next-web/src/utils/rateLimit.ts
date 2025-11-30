import { NextResponse } from 'next/server';

interface RateLimitStore {
    [key: string]: {
        count: number;
        lastReset: number;
    };
}

const store: RateLimitStore = {};

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

export function rateLimit(ip: string) {
    const now = Date.now();
    const record = store[ip];

    if (!record) {
        store[ip] = {
            count: 1,
            lastReset: now,
        };
        return { success: true };
    }

    if (now - record.lastReset > WINDOW_SIZE) {
        record.count = 1;
        record.lastReset = now;
        return { success: true };
    }

    if (record.count >= MAX_REQUESTS) {
        return { success: false };
    }

    record.count++;
    return { success: true };
}
