import { NextResponse } from 'next/server';
import { getStackScoreLeaderboard } from '@/lib/stackScoreStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leaderboard = await getStackScoreLeaderboard(10);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load leaderboard', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
