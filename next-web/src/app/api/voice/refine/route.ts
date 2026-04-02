import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthenticatedVoiceUser } from '@/lib/voiceAuth';
import {
    isVoiceEngineFailure,
    VOICE_ENGINE_UNAVAILABLE_MESSAGE,
} from '@/lib/voiceRequestError';
import { buildRefinedVoiceResponse, createTransientGenerationId } from '@/lib/voiceService';
import { enforceVoiceQuota, hashAnonymousSubject } from '@/lib/voiceStorage';
import { validateRefineInput } from '@/lib/voice';

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            voiceContext: unknown;
            previousOutput: string;
            refineInstruction: string;
        };
        const input = validateRefineInput(body as never);
        const user = await getAuthenticatedVoiceUser();
        const requestHeaders = await headers();
        const forwardedFor = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || 'unknown';
        const userAgent = requestHeaders.get('user-agent') || 'unknown';
        const subjectKey = user
            ? user.id
            : hashAnonymousSubject(forwardedFor.split(',')[0]?.trim() || 'unknown', userAgent);
        const quota = await enforceVoiceQuota({
            subjectKey,
            subjectType: user ? 'user' : 'anonymous',
        });
        const payload = await buildRefinedVoiceResponse({
            ...input,
            ...quota,
            isAuthenticated: Boolean(user),
        });

        return NextResponse.json({
            ...payload,
            generationId: createTransientGenerationId(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to refine voice output.';
        const clientMessage =
            message.toLowerCase().includes('configured') || isVoiceEngineFailure(message)
                ? VOICE_ENGINE_UNAVAILABLE_MESSAGE
                : message;
        const normalized = message.toLowerCase();
        console.error('Voice refine failed', error);
        const status = normalized.includes('quota')
            ? 429
            : normalized.includes('configured')
              ? 500
              : isVoiceEngineFailure(message)
                ? 502
              : 400;
        return NextResponse.json({ error: clientMessage }, { status });
    }
}
