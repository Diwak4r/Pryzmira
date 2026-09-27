import Link from 'next/link';
import { getFeed } from '@/lib/data';
import FeedScroller from '@/components/feed/FeedScroller';
import type { SortMode } from '@/lib/types';

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>;
}) {
    const params = await searchParams;
    const sort: SortMode = params.sort === 'trending' ? 'trending' : 'new';
    const artifacts = await getFeed({ sort });

    return (
        <div className="relative">
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center gap-2 p-3">
                {(['new', 'trending'] as const).map((mode) => (
                    <Link
                        key={mode}
                        href={mode === 'new' ? '/' : '/?sort=trending'}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                            sort === mode ? 'bg-white text-black' : 'bg-white/10 text-white'
                        }`}
                    >
                        {mode === 'new' ? 'Newest' : 'Trending'}
                    </Link>
                ))}
            </div>
            <FeedScroller artifacts={artifacts} />
        </div>
    );
}
