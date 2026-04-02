import { NextResponse } from 'next/server';
import {
    applySupabaseSessionToResponse,
    buildVoiceRedirectUrl,
    verifyMagicLinkToken,
} from '@/lib/voiceAuth';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const tokenHash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type') || 'email';
    const next = url.searchParams.get('next') || '/desk';

    if (!tokenHash) {
        return NextResponse.redirect(buildVoiceRedirectUrl(request.url, '/desk', 'error'));
    }

    try {
        const session = await verifyMagicLinkToken(tokenHash, type);
        const response = NextResponse.redirect(buildVoiceRedirectUrl(request.url, next, 'success'));
        await applySupabaseSessionToResponse(response, session);
        return response;
    } catch {
        return NextResponse.redirect(buildVoiceRedirectUrl(request.url, '/desk', 'error'));
    }
}
