import { NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 10;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_ATTEMPTS) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Too many attempts. Try again later.' },
            { status: 429 }
        );
    }

    try {
        const { password } = await request.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        const vaultPassword = process.env.VAULT_PASSWORD;

        if (!vaultPassword) {
            console.error('[Vault] VAULT_PASSWORD env var not set');
            return NextResponse.json({ error: 'Vault not configured' }, { status: 503 });
        }

        if (password === vaultPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Access Denied' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
