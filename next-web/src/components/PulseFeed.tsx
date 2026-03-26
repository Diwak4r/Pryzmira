'use client';

import { useEffect, useMemo, useState } from 'react';

type PulseItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: 'models' | 'tools' | 'business' | 'research' | 'trends';
  publishedAt: string;
  heat: number;
  tags: string[];
};

type PulseResponse = {
  items: PulseItem[];
  stats?: {
    total: number;
    last24h: number;
    last7d: number;
    byCategory: Record<string, number>;
  };
  lastUpdated?: string;
};

const categoryStyles: Record<PulseItem['category'], string> = {
  models: 'bg-primary/12 text-primary border-primary/20',
  tools: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  business: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  research: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  trends: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PulseFeed() {
  const [data, setData] = useState<PulseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pulse')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json || !Array.isArray(json.items)) {
          return null;
        }
        return json as PulseResponse;
      })
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(() => data?.items ?? [], [data]);
  const stats = data?.stats;

  return (
    <div className="control-frame p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="control-label">AI Pulse</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">What moved in AI this cycle</h3>
        </div>
        <div className="text-right">
          <p className="mono-value text-xl text-foreground">{stats?.last24h ?? 0}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">last 24h</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading pulse feed...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pulse items yet.</p>
        ) : (
          items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-[1.35rem] border border-border/70 bg-background/40 p-4 transition-colors hover:border-primary/22 hover:bg-background/72"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${categoryStyles[item.category]}`}>
                  {item.category}
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.source}</span>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{timeAgo(item.publishedAt)}</span>
                <span className="ml-auto mono-value text-xs text-foreground">Heat {item.heat}</span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-foreground">{item.title}</h4>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.summary}</p>
            </a>
          ))
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span>{stats?.total ?? 0} tracked items</span>
        <span>{data?.lastUpdated ? `updated ${timeAgo(data.lastUpdated)}` : 'live feed'}</span>
      </div>
    </div>
  );
}
