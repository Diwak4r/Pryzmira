import { NextResponse } from 'next/server';
import {
    buildStrategyBrief,
    buildStrategyPlan,
    type StrategyWorkspaceResponse,
    sanitizeStrategyProfileInput,
} from '@/lib/strategy';
import { getSiteUrl } from '@/lib/siteUrl';
import { getStrategyResumeUrl, verifyStrategyResumeToken } from '@/lib/strategyAccess';
import {
    captureStrategyPremiumLead,
    getLatestStrategyBrief,
    getStrategyProfileByEmail,
    getStrategyProfileById,
    saveStrategyBrief,
    upsertStrategyProfile,
} from '@/lib/strategyStore';

function isConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message.toLowerCase().includes('not configured');
}

function buildWorkspaceResponse(
    profile: StrategyWorkspaceResponse['profile'],
    brief: StrategyWorkspaceResponse['brief'],
    request: Request
): StrategyWorkspaceResponse {
    return {
        profile,
        brief,
        resumeUrl: getStrategyResumeUrl(profile.id, getSiteUrl(request)),
    };
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
        const savedBrief = await saveStrategyBrief(
            profile.id,
            draftBrief.subject,
            draftBrief.preview,
            draftBrief.plan
        );
        const result =
            input.premiumInterest
                ? await captureStrategyPremiumLead({
                      profileId: profile.id,
                      surface: 'home',
                      offer: 'pro_waitlist',
                  })
                : null;

        const nextProfile = result?.profile ?? profile;

        return NextResponse.json(buildWorkspaceResponse(nextProfile, savedBrief, request));
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
    const token = searchParams.get('token');
    const tokenProfileId = token ? verifyStrategyResumeToken(token) : null;
    const profileId = searchParams.get('profileId') || tokenProfileId;
    const email = searchParams.get('email');

    if (!profileId && !email) {
        return NextResponse.json(
            { error: 'Provide profileId, token, or email to load a strategy brief.' },
            { status: 400 }
        );
    }

    if (token && !tokenProfileId) {
        return NextResponse.json({ error: 'Workspace link is invalid or expired.' }, { status: 400 });
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

        return NextResponse.json(buildWorkspaceResponse(profile, brief, request));
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
