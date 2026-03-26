import { NextResponse } from 'next/server';
import { fetchPulseItems, seedMockPulseData } from '@/lib/pulseFetcher';
import { deleteOldPulseItems, getPulseItems, getPulseStats, initPulseTables } from '@/lib/pulseStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize tables on first run
    await initPulseTables();

    // Seed mock data if empty
    const stats = await getPulseStats();
    if (stats.total === 0) {
      await seedMockPulseData();
    }

    // Get latest pulse items
    const items = await getPulseItems({ limit: 20 });

    return NextResponse.json({
      items,
      stats: await getPulseStats(),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Pulse API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pulse data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Trigger pulse fetch
    const { saved, errors } = await fetchPulseItems();

    // Clean up old items (keep last 30 days)
    const deleted = await deleteOldPulseItems(30);

    return NextResponse.json({
      success: true,
      saved,
      errors,
      deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Pulse API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pulse data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
