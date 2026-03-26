'use client';

import { useEffect, useState } from 'react';

type StackScoreResponse = {
  score: number;
  label: string;
  breakdown: {
    freshnessScore: number;
    activityScore: number;
    streakScore: number;
    profileScore: number;
  };
};

export function StackScoreCard() {
  const [data, setData] = useState<StackScoreResponse | null>(null);

  useEffect(() => {
    fetch('/api/stack-score')
      .then((res) => res.json())
      .then(setData)
      .catch(() => null);
  }, []);

  if (!data) {
    return <div className="control-frame p-5 text-sm text-muted-foreground">Loading stack score...</div>;
  }

  return (
    <div className="control-frame p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="control-label">AI Stack Score</p>
          <h3 className="mt-3 text-4xl font-semibold text-foreground mono-value">{data.score}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{data.label} builder profile</p>
        </div>
        <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary">
          Weekly signal
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/45 p-3">
          <p className="control-label">Freshness</p>
          <p className="mt-2 mono-value text-xl">{data.breakdown.freshnessScore}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/45 p-3">
          <p className="control-label">Activity</p>
          <p className="mt-2 mono-value text-xl">{data.breakdown.activityScore}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/45 p-3">
          <p className="control-label">Streak</p>
          <p className="mt-2 mono-value text-xl">{data.breakdown.streakScore}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/45 p-3">
          <p className="control-label">Profile</p>
          <p className="mt-2 mono-value text-xl">{data.breakdown.profileScore}</p>
        </div>
      </div>
    </div>
  );
}
