import { NextResponse } from 'next/server';
import { getPulseItems, getPulseStats, initPulseTables } from '@/lib/pulseStore';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    await initPulseTables();
    const stats = await getPulseStats();
    const items = await getPulseItems({ limit: 8 });

    return NextResponse.json({
      items,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Pulse Route] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load pulse feed' },
      { status: 500 }
    );
  }
}
