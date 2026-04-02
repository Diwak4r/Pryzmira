import { NextResponse } from 'next/server';
import { getAuthenticatedVoiceUser } from '@/lib/voiceAuth';
import { getVoiceHistoryForUser } from '@/lib/voiceStorage';

export async function GET() {
    try {
        const user = await getAuthenticatedVoiceUser();
        if (!user) {
            return NextResponse.json({ history: [] });
        }

        const history = await getVoiceHistoryForUser(user.id);
        return NextResponse.json({ history });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load saved history.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
