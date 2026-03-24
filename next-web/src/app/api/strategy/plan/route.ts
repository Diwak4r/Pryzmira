import { NextResponse } from 'next/server';
import {
    buildStrategyBrief,
    buildStrategyPlan,
    sanitizeStrategyProfileInput,
} from '@/lib/strategy';
import {
    getLatestStrategyBrief,
    getStrategyProfileByEmail,
    getStrategyProfileById,
    saveStrategyBrief,
    upsertStrategyProfile,
} from '@/lib/strategyStore';

function isConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message.toLowerCase().includes('not configured');
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = sanitizeStrategyProfileInput(body);

        if (!input) {
            return NextResponse.json(
                {
                    error:
                        'Invalid strategy request. Provide a valid name, email, goal, experience level, weekly hours, and monetization path.',
                },
                { status: 400 }
            );
        }

        const profile = await upsertStrategyProfile(input);
        const plan = buildStrategyPlan(profile);
        const draftBrief = buildStrategyBrief(profile, plan);
        const brief = await saveStrategyBrief(
            profile.id,
            draftBrief.subject,
            draftBrief.preview,
            draftBrief.plan
        );

        return NextResponse.json({
            profile,
            brief,
        });
    } catch (error) {
        if (isConfigurationError(error)) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Storage is not configured.' },
                { status: 503 }
            );
        }

        console.error('[Strategy] Failed to create strategy brief:', error);
        return NextResponse.json(
            { error: 'Unable to generate strategy right now.' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const email = searchParams.get('email');

    if (!profileId && !email) {
        return NextResponse.json(
            { error: 'Provide profileId or email to load a strategy brief.' },
            { status: 400 }
        );
    }

    try {
        const profile = profileId
            ? await getStrategyProfileById(profileId)
            : await getStrategyProfileByEmail(email || '');

        if (!profile) {
            return NextResponse.json({ error: 'Strategy profile not found.' }, { status: 404 });
        }

        let brief = await getLatestStrategyBrief(profile.id);

        if (!brief) {
            const plan = buildStrategyPlan(profile);
            const draftBrief = buildStrategyBrief(profile, plan);
            brief = await saveStrategyBrief(
                profile.id,
                draftBrief.subject,
                draftBrief.preview,
                draftBrief.plan
            );
        }

        return NextResponse.json({
            profile,
            brief,
        });
    } catch (error) {
        if (isConfigurationError(error)) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Storage is not configured.' },
                { status: 503 }
            );
        }

        console.error('[Strategy] Failed to load strategy brief:', error);
        return NextResponse.json(
            { error: 'Unable to load strategy right now.' },
            { status: 500 }
        );
    }
}
