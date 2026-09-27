'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Flame, Volume2, VolumeX } from 'lucide-react';
import type { Artifact } from '@/lib/types';
import { timeAgo, isFresh } from '@/lib/time';
import PlatformIcon, { platformLabel } from './PlatformIcon';

const GRADIENTS = [
    'from-indigo-900/70 via-slate-900 to-black',
    'from-fuchsia-900/70 via-slate-900 to-black',
    'from-rose-900/70 via-slate-900 to-black',
    'from-amber-900/70 via-slate-900 to-black',
    'from-emerald-900/70 via-slate-900 to-black',
    'from-cyan-900/70 via-slate-900 to-black',
];

function gradientFor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return GRADIENTS[hash % GRADIENTS.length];
}

export default function FeedCard({ artifact, trending = false }: { artifact: Artifact; trending?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        if (!video || !container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                    video.play().catch(() => {
                        // Autoplay can be blocked before the first user gesture — safe to ignore.
                    });
                } else {
                    video.pause();
                }
            },
            { threshold: [0, 0.6, 1] },
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const fresh = isFresh(artifact.firstSeenAt);
    const gradient = gradientFor(artifact.releaseSlug);

    return (
        <div
            ref={containerRef}
            className="relative flex h-full w-full shrink-0 snap-start snap-always items-center justify-center overflow-hidden bg-black"
        >
            <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />

            {artifact.videoUrl ? (
                <video
                    ref={videoRef}
                    src={artifact.videoUrl}
                    poster={artifact.thumbnailUrl}
                    className="absolute inset-0 h-full w-full object-cover"
                    loop
                    muted={muted}
                    playsInline
                    preload="metadata"
                />
            ) : artifact.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artifact.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
            ) : null}

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {artifact.releaseName}
                </span>
                <div className="flex items-center gap-2">
                    {trending && (
                        <span className="flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                            <Flame className="h-3 w-3" /> Trending
                        </span>
                    )}
                    {fresh && (
                        <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> New
                        </span>
                    )}
                    {artifact.videoUrl && (
                        <button
                            onClick={() => setMuted((m) => !m)}
                            aria-label={muted ? 'Unmute' : 'Mute'}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
                        >
                            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16">
                <p className="text-base font-semibold leading-snug text-white sm:text-lg">{artifact.title}</p>

                {artifact.promptText && (
                    <div className="mt-3 rounded-lg border border-white/15 bg-white/5 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Prompt</p>
                        <p className="mt-1 line-clamp-3 font-mono text-xs leading-relaxed text-white/90">
                            {artifact.promptText}
                        </p>
                    </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                        <PlatformIcon platform={artifact.platform} className="h-3.5 w-3.5" />
                        {platformLabel(artifact.platform)}
                    </span>
                    {artifact.creatorHandle && <span className="font-medium text-white/90">{artifact.creatorHandle}</span>}
                    <span>{timeAgo(artifact.postedAt)}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {artifact.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <a
                        href={artifact.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black"
                    >
                        View source <ArrowUpRight className="h-3 w-3" />
                    </a>
                </div>

                <Link
                    href={`/release/${artifact.releaseSlug}`}
                    className="mt-3 inline-block text-xs text-white/50 underline-offset-2 hover:text-white/80 hover:underline"
                >
                    More {artifact.releaseName} builds →
                </Link>
            </div>
        </div>
    );
}
