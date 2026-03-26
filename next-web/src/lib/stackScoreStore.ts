import { calculateStackScore, getPreviewStackScore, type StackScoreResult } from '@/lib/stackScore';

export interface StoredStackScore extends StackScoreResult {
  userId: string;
  updatedAt: string;
}

export async function getStackScoreForUser(userId?: string): Promise<StoredStackScore> {
  const preview = getPreviewStackScore();

  if (!userId) {
    return {
      ...preview,
      userId: 'preview',
      updatedAt: new Date().toISOString(),
    };
  }

  const computed = calculateStackScore({
    tools: ['Claude', 'Cursor', 'Perplexity', 'Runway'],
    completedBriefs: 4,
    streakWeeks: 3,
    profileCompleteness: 82,
  });

  return {
    ...computed,
    userId,
    updatedAt: new Date().toISOString(),
  };
}

export async function getStackScoreLeaderboard(limit = 10): Promise<StoredStackScore[]> {
  const seed = [
    { userId: 'builder-1', tools: ['Claude', 'Cursor', 'Perplexity', 'Runway'], completedBriefs: 5, streakWeeks: 5, profileCompleteness: 92 },
    { userId: 'builder-2', tools: ['GPT-5', 'v0', 'Midjourney'], completedBriefs: 4, streakWeeks: 4, profileCompleteness: 85 },
    { userId: 'builder-3', tools: ['Claude', 'Bolt', 'Perplexity'], completedBriefs: 3, streakWeeks: 2, profileCompleteness: 80 },
    { userId: 'builder-4', tools: ['Gemini', 'Cursor'], completedBriefs: 2, streakWeeks: 1, profileCompleteness: 72 },
  ];

  return seed
    .map((item) => ({
      ...calculateStackScore(item),
      userId: item.userId,
      updatedAt: new Date().toISOString(),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
