import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthenticatedVoiceUser } from '@/lib/voiceAuth';
import { buildVoiceResponse, createTransientGenerationId } from '@/lib/voiceService';
import { enforceVoiceQuota, hashAnonymousSubject } from '@/lib/voiceStorage';
import { validateGenerateInput } from '@/lib/voice';

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            sampleText: string;
            writingTask: string;
            extraInstructions?: string;
        };
        const input = validateGenerateInput(body);
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
        const payload = await buildVoiceResponse({
            ...input,
            ...quota,
            isAuthenticated: Boolean(user),
        });

        return NextResponse.json({
            ...payload,
            generationId: createTransientGenerationId(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to generate voice output.';
        const normalized = message.toLowerCase();
        const status = normalized.includes('quota')
            ? 429
            : normalized.includes('configured')
              ? 500
              : 400;
        return NextResponse.json({ error: message }, { status });
    }
}
