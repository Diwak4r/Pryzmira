import { NextResponse } from 'next/server';
import { clearSupabaseSessionFromResponse } from '@/lib/voiceAuth';

export async function POST() {
    const response = NextResponse.json({ ok: true });
    clearSupabaseSessionFromResponse(response);
    return response;
}
