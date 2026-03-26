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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const stats = await getStrategyGrowthStats();
        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('[Platform Stats API] Error loading stats:', error);
        console.error('[Platform Stats API] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
            postgresUrl: process.env.POSTGRES_URL ? 'configured' : 'missing',
            postgresUrlNonPooling: process.env.POSTGRES_URL_NON_POOLING ? 'configured' : 'missing',
            nodeEnv: process.env.NODE_ENV,
        });

        if (isConfigurationError(error)) {
            console.log('[Platform Stats API] Configuration error detected, returning empty stats');
            return NextResponse.json(emptyStats);
        }

        return NextResponse.json(
            { error: 'Unable to load platform stats right now.' },
            { status: 500 }
        );
    }
}
