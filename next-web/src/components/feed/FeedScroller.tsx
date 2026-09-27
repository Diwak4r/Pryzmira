'use client';

import type { Artifact } from '@/lib/types';
import FeedCard from './FeedCard';

const TRENDING_THRESHOLD = 400;

export default function FeedScroller({ artifacts }: { artifacts: Artifact[] }) {
    if (artifacts.length === 0) {
        return (
            <div className="flex h-[calc(100dvh-3rem)] items-center justify-center px-6 text-center">
                <p className="max-w-xs text-sm text-muted-foreground">
                    Nothing here yet. Be the first — drop a link on the submit page.
                </p>
            </div>
        );
    }

    return (
        <div className="feed-scroller h-[calc(100dvh-3rem)] snap-y snap-mandatory overflow-y-scroll overscroll-y-contain">
            {artifacts.map((artifact) => (
                <FeedCard key={artifact.id} artifact={artifact} trending={artifact.engagementScore >= TRENDING_THRESHOLD} />
            ))}
        </div>
    );
}
