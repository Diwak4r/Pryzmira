import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Artifact } from '@/lib/types';
import { timeAgo, isFresh } from '@/lib/time';
import PlatformIcon, { platformLabel } from './PlatformIcon';

export default function ArtifactGridCard({ artifact }: { artifact: Artifact }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
            <div className="relative aspect-video bg-muted">
                {artifact.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={artifact.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        {artifact.releaseName}
                    </div>
                )}
                {isFresh(artifact.firstSeenAt) && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        New
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="text-sm font-medium leading-snug text-foreground">{artifact.title}</p>
                {artifact.promptText && (
                    <p className="line-clamp-2 font-mono text-xs text-muted-foreground">“{artifact.promptText}”</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <PlatformIcon platform={artifact.platform} className="h-3 w-3" />
                        {platformLabel(artifact.platform)} · {timeAgo(artifact.postedAt)}
                    </span>
                    <Link href={`/release/${artifact.releaseSlug}`} className="hover:text-foreground">
                        {artifact.releaseName}
                    </Link>
                </div>
                <a
                    href={artifact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    View source <ArrowUpRight className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
