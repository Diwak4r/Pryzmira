import { NextResponse } from 'next/server';
import { fetchPulseItems, seedMockPulseData } from '@/lib/pulseFetcher';
import { deleteOldPulseItems, getPulseItems, getPulseStats, initPulseTables } from '@/lib/pulseStore';

export const dynamic = 'force-dynamic';

function getAuthorizationError(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export async function GET(request: Request) {
  const authError = getAuthorizationError(request);
  if (authError) {
    return authError;
  }

  try {
    await initPulseTables();
    const stats = await getPulseStats();
    const items = await getPulseItems({ limit: 20 });

    return NextResponse.json({
      items,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Pulse API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pulse data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = getAuthorizationError(request);
  if (authError) {
    return authError;
  }

  try {
    await initPulseTables();

    const stats = await getPulseStats();
    if (stats.total === 0) {
      await seedMockPulseData();
    }

    const { saved, errors } = await fetchPulseItems();
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
      { error: 'Failed to fetch pulse data' },
      { status: 500 }
    );
  }
}
