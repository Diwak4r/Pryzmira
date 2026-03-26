import { NextResponse } from 'next/server';
import { getPulseItems, getPulseStats, initPulseTables } from '@/lib/pulseStore';
import { seedMockPulseData } from '@/lib/pulseFetcher';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    await initPulseTables();
    const stats = await getPulseStats();

    if (stats.total === 0) {
      await seedMockPulseData();
    }

    const items = await getPulseItems({ limit: 8 });
    const latestStats = await getPulseStats();

    return NextResponse.json({
      items,
      stats: latestStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Pulse Route] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load pulse feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
