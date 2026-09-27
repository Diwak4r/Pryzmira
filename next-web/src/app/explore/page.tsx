import Link from 'next/link';
import { getAllTags, getFeed } from '@/lib/data';
import ArtifactGridCard from '@/components/feed/ArtifactGridCard';
import type { Platform, SortMode } from '@/lib/types';

const PLATFORMS: { value: Platform; label: string }[] = [
    { value: 'x', label: 'X' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'github', label: 'GitHub' },
];

function buildHref(params: URLSearchParams, key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (!value || next.get(key) === value) {
        next.delete(key);
    } else {
        next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `/explore?${qs}` : '/explore';
}

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ platform?: string; tag?: string; sort?: string }>;
}) {
    const raw = await searchParams;
    const platform = raw.platform as Platform | undefined;
    const tag = raw.tag;
    const sort: SortMode = raw.sort === 'trending' ? 'trending' : 'new';

    const [artifacts, tags] = await Promise.all([getFeed({ platform, tag, sort }), getAllTags()]);
    const params = new URLSearchParams(raw as Record<string, string>);

    return (
        <div className="wide-container pb-20 pt-8">
            <h1 className="text-2xl font-semibold tracking-tight">Explore builds</h1>
            <p className="mt-1 text-sm text-muted-foreground">Filter every build shared so far by platform, tag, or freshness.</p>

            <div className="mt-6 flex flex-wrap gap-2">
                {(['new', 'trending'] as const).map((mode) => (
                    <Link
                        key={mode}
                        href={buildHref(params, 'sort', mode === 'new' ? undefined : mode)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                            sort === mode ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                        }`}
                    >
                        {mode === 'new' ? 'Newest' : 'Trending'}
                    </Link>
                ))}
                <span className="mx-1 h-4 w-px bg-border" />
                {PLATFORMS.map((p) => (
                    <Link
                        key={p.value}
                        href={buildHref(params, 'platform', p.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                            platform === p.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                        }`}
                    >
                        {p.label}
                    </Link>
                ))}
            </div>

            {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((t) => (
                        <Link
                            key={t}
                            href={buildHref(params, 'tag', t)}
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                                tag === t ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                            }`}
                        >
                            #{t}
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {artifacts.map((artifact) => (
                    <ArtifactGridCard key={artifact.id} artifact={artifact} />
                ))}
            </div>

            {artifacts.length === 0 && (
                <p className="mt-16 text-center text-sm text-muted-foreground">Nothing matches these filters yet.</p>
            )}
        </div>
    );
}
