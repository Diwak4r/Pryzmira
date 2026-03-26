import { NextResponse } from 'next/server';
import type { StrategyGrowthStats } from '@/lib/strategy';
import { getStrategyGrowthStats } from '@/lib/strategyStore';

const emptyStats: StrategyGrowthStats = {
    briefsThisWeek: 0,
    buildersThisWeek: 0,
    totalBuilders: 0,
    waitlistCount: 0,
};

function isConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message.toLowerCase().includes('not configured');
}

export async function GET() {
    try {
        const stats = await getStrategyGrowthStats();
        return NextResponse.json(stats);
    } catch (error) {
        if (isConfigurationError(error)) {
            return NextResponse.json(emptyStats);
        }

        return NextResponse.json(
            { error: 'Unable to load platform stats right now.' },
            { status: 500 }
        );
    }
}
