export interface StackScoreBreakdown {
  freshnessScore: number;
  activityScore: number;
  streakScore: number;
  profileScore: number;
}

export interface StackScoreResult {
  score: number;
  breakdown: StackScoreBreakdown;
  label: string;
}

export interface StackScoreInput {
  tools?: string[];
  completedBriefs?: number;
  streakWeeks?: number;
  profileCompleteness?: number;
}

const FRESH_TOOLS = [
  'claude',
  'cursor',
  'windsurf',
  'perplexity',
  'gpt-4',
  'gpt-5',
  'gemini',
  'v0',
  'bolt',
  'midjourney',
  'runway',
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateStackScore(input: StackScoreInput): StackScoreResult {
  const tools = input.tools ?? [];
  const completedBriefs = input.completedBriefs ?? 0;
  const streakWeeks = input.streakWeeks ?? 0;
  const profileCompleteness = input.profileCompleteness ?? 65;

  const freshnessMatches = tools.filter((tool) =>
    FRESH_TOOLS.some((fresh) => tool.toLowerCase().includes(fresh))
  ).length;

  const freshnessScore = clamp(8 + freshnessMatches * 4, 8, 24);
  const activityScore = clamp(6 + completedBriefs * 3, 6, 22);
  const streakScore = clamp(4 + streakWeeks * 2, 4, 18);
  const profileScore = clamp(Math.round(profileCompleteness / 6), 6, 16);

  const score = clamp(50 + freshnessScore + activityScore + streakScore + profileScore - 30, 42, 99);

  let label = 'Emerging';
  if (score >= 85) label = 'Frontier';
  else if (score >= 74) label = 'Current';
  else if (score >= 62) label = 'Active';

  return {
    score,
    label,
    breakdown: {
      freshnessScore,
      activityScore,
      streakScore,
      profileScore,
    },
  };
}

export function getPreviewStackScore(): StackScoreResult {
  return calculateStackScore({
    tools: ['Claude', 'Cursor', 'Perplexity'],
    completedBriefs: 3,
    streakWeeks: 2,
    profileCompleteness: 78,
  });
}
