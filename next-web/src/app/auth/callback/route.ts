import { NextResponse } from 'next/server';
import {
    applySupabaseSessionToResponse,
    buildVoiceRedirectUrl,
    clearPkceCookie,
    exchangeOAuthCode,
    getPkceVerifier,
} from '@/lib/voiceAuth';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') || '/desk';

    if (!code) {
        return NextResponse.redirect(buildVoiceRedirectUrl(request.url, '/desk', 'error'));
    }

    try {
        const codeVerifier = await getPkceVerifier();
        if (!codeVerifier) {
            return NextResponse.redirect(buildVoiceRedirectUrl(request.url, '/desk', 'error'));
        }

        const session = await exchangeOAuthCode(code, codeVerifier);
        const response = NextResponse.redirect(
            buildVoiceRedirectUrl(request.url, next, 'success')
        );
        await applySupabaseSessionToResponse(response, session);
        clearPkceCookie(response);
        return response;
    } catch {
        return NextResponse.redirect(buildVoiceRedirectUrl(request.url, '/desk', 'error'));
    }
}
