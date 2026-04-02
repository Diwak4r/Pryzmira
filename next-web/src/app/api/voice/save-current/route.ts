import { NextResponse } from 'next/server';
import { getAuthenticatedVoiceUser } from '@/lib/voiceAuth';
import { saveVoiceProfileAndGeneration } from '@/lib/voiceStorage';
import { createPreview, sanitizeExtraInstructions, sanitizeWritingTask, type VoiceContext } from '@/lib/voice';

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedVoiceUser();
        if (!user) {
            return NextResponse.json({ error: 'Sign in is required before saving.' }, { status: 401 });
        }

        const body = (await request.json()) as {
            voiceContext: VoiceContext | null;
            latestOutput: string;
            writingTask: string;
            extraInstructions?: string;
        };

        if (!body.voiceContext) {
            return NextResponse.json({ error: 'Voice context is missing.' }, { status: 400 });
        }

        const writingTask = sanitizeWritingTask(body.writingTask);
        const latestOutput = body.latestOutput?.trim();
        if (!writingTask || !latestOutput) {
            return NextResponse.json(
                { error: 'A writing task and generated output are required before saving.' },
                { status: 400 }
            );
        }

        const saved = await saveVoiceProfileAndGeneration({
            userId: user.id,
            voiceContext: body.voiceContext,
            latestOutput,
            writingTask,
            extraInstructions: sanitizeExtraInstructions(body.extraInstructions),
            preview: createPreview(latestOutput),
        });

        return NextResponse.json({
            ok: true,
            profileId: saved.profile.id,
            generationId: saved.generation.id,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save the current voice profile.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
