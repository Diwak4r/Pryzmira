import { NextResponse } from 'next/server';
import { getStackScoreForUser } from '@/lib/stackScoreStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const score = await getStackScoreForUser();
    return NextResponse.json(score);
  } catch (error) {
    console.error('[Stack Score API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load stack score' },
      { status: 500 }
    );
  }
}
