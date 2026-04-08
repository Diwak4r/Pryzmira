import { NextResponse } from 'next/server';
import {
    buildGoogleOAuthUrl,
    buildOAuthCallbackUrl,
    generatePkce,
    setPkceCookie,
} from '@/lib/voiceAuth';

export async function GET(request: Request) {
    try {
        const { codeVerifier, codeChallenge } = generatePkce();
        const callbackUrl = buildOAuthCallbackUrl(request.url, '/desk');
        const oauthUrl = buildGoogleOAuthUrl(codeChallenge, callbackUrl);

        const response = NextResponse.json({ url: oauthUrl });
        setPkceCookie(response, codeVerifier);
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to start Google sign-in.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
