'use client';

import { useEffect, useState } from 'react';

type LeaderboardItem = {
  userId: string;
  score: number;
  label: string;
};

export function StackLeaderboard() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    fetch('/api/stack-score/leaderboard')
      .then((res) => res.json())
      .then((data) => setItems(data.leaderboard ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="control-frame p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="control-label">Leaderboard</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">Builders staying current</h3>
        </div>
        <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Top 10</div>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Leaderboard loading...</p>
        ) : (
          items.slice(0, 5).map((item, index) => (
            <div key={item.userId} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/45 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="mono-value text-sm text-muted-foreground">#{index + 1}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.userId}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
              <div className="mono-value text-lg text-foreground">{item.score}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
