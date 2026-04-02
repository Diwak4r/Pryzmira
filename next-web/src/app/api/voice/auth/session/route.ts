import { NextResponse } from 'next/server';
import { getAuthenticatedVoiceUser } from '@/lib/voiceAuth';

export async function GET() {
    const user = await getAuthenticatedVoiceUser();

    return NextResponse.json({
        authenticated: Boolean(user),
        user: user
            ? {
                  id: user.id,
                  email: user.email || null,
              }
            : null,
    });
}
