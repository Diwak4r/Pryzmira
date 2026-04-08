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
            voiceContext?: unknown;
            previousOutput?: unknown;
            refineInstruction?: unknown;
        };
        const input = validateRefineInput(body);
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
        const normalized = message.toLowerCase();
        const quotaServiceUnavailable = normalized.includes('quota service is temporarily unavailable');
        const clientMessage =
            normalized.includes('configured') || isVoiceEngineFailure(message)
                ? VOICE_ENGINE_UNAVAILABLE_MESSAGE
                : message;
        console.error('Voice refine failed', error);
        const status = quotaServiceUnavailable
            ? 503
            : normalized.includes('quota')
            ? 429
            : normalized.includes('configured')
              ? 500
              : isVoiceEngineFailure(message)
                ? 502
              : 400;
        return NextResponse.json({ error: clientMessage }, { status });
    }
}
