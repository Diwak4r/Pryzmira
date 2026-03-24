import { NextResponse } from 'next/server';
import { sanitizeStrategyPremiumLeadInput } from '@/lib/strategy';
import { captureStrategyPremiumLead } from '@/lib/strategyStore';

function isConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message.toLowerCase().includes('not configured');
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = sanitizeStrategyPremiumLeadInput(body);

        if (!input) {
            return NextResponse.json(
                {
                    error:
                        'Invalid premium request. Provide a valid profileId, surface, and offer.',
                },
                { status: 400 }
            );
        }

        const result = await captureStrategyPremiumLead(input);

        return NextResponse.json(result);
    } catch (error) {
        if (isConfigurationError(error)) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Storage is not configured.' },
                { status: 503 }
            );
        }

        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(
            { error: 'Unable to capture premium interest right now.' },
            { status: 500 }
        );
    }
}
