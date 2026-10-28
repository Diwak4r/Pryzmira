'use client';

import Link from 'next/link';
import {
    ArrowUpRight,
    ExternalLink,
    Heart,
    MessageCircle,
    Repeat2,
    Sparkles,
    Star,
} from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { modelLabel, toolLabel, vendorOfModel } from '@/lib/builds/catalog';
import {
    buildActionLabel,
    buildToWritingTask,
    categoryLabel,
    formatCompactNumber,
    formatRelativeTime,
} from '@/lib/builds/normalize';
import type { AiBuild } from '@/lib/builds/types';

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
}

function Metric({
    icon: Icon,
    value,
    label,
}: {
    icon: typeof Heart;
    value?: number;
    label: string;
}) {
    if (!value || value <= 0) {
        return null;
    }

    return (
        <span className="inline-flex items-center gap-1" title={`${value} ${label}`}>
            <Icon className="h-3 w-3" aria-hidden />
            <span className="tabular-nums">{formatCompactNumber(value)}</span>
        </span>
    );
}

export default function BuildCard({ build }: { build: AiBuild }) {
    const task = buildToWritingTask(build);
    const primaryHref = build.buildUrl || build.source.url;
    const primaryLabel = buildActionLabel(build);

    return (
        <article className="group flex h-full flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/30">
            <div className="flex items-center justify-between gap-2">
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                    {categoryLabel(build.category)}
                </span>
                {build.provenance === 'live' ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        live
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        curated
                    </span>
                )}
            </div>

            <h3 className="mt-2 text-[0.95rem] font-semibold leading-snug text-foreground">
                <a
                    href={primaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                >
                    {build.title}
                </a>
            </h3>

            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {build.summary}
            </p>

            {build.highlight && (
                <p className="mt-2 border-l-2 border-primary/30 pl-2 text-[0.7rem] leading-relaxed text-muted-foreground/90">
                    {build.highlight}
                </p>
            )}

            {(build.models.length > 0 || build.tools.length > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-1">
                    {build.models.slice(0, 3).map((model) => (
                        <span
                            key={model}
                            title={vendorOfModel(model)}
                            className="rounded-sm border border-primary/25 bg-primary/5 px-1.5 py-0.5 font-mono text-[0.62rem] text-foreground"
                        >
                            {modelLabel(model)}
                        </span>
                    ))}
                    {build.tools.slice(0, 2).map((tool) => (
                        <span
                            key={tool}
                            className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground"
                        >
                            {toolLabel(tool)}
                        </span>
                    ))}
                    {build.models.length + build.tools.length > 5 && (
                        <span className="font-mono text-[0.62rem] text-muted-foreground/70">
                            +{build.models.length + build.tools.length - 5}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-auto pt-4">
                <div className="flex items-center justify-between gap-2 border-t border-border pt-3 text-[0.7rem] text-muted-foreground">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[0.55rem] text-foreground">
                            {initials(build.maker.name)}
                        </span>
                        <span className="truncate">
                            {build.maker.name}
                            {build.maker.handle && (
                                <span className="text-muted-foreground/60"> @{build.maker.handle}</span>
                            )}
                        </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                        <Metric icon={Heart} value={build.metrics?.likes} label="likes" />
                        <Metric icon={Repeat2} value={build.metrics?.reposts} label="reposts" />
                        <Metric icon={MessageCircle} value={build.metrics?.comments} label="replies" />
                        <Metric icon={Star} value={build.metrics?.stars} label="stars" />
                        <span className="text-muted-foreground/60">
                            {build.provenance === 'live' && build.source.postedAt
                                ? formatRelativeTime(build.source.postedAt)
                                : 'curated pick'}
                        </span>
                    </span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5">
                    <a
                        href={primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[0.7rem] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                        {primaryLabel}
                        <ExternalLink className="h-2.5 w-2.5" aria-hidden />
                    </a>
                    {build.buildUrl && build.buildUrl !== build.source.url && (
                        <a
                            href={build.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 items-center rounded-md px-1.5 text-[0.7rem] text-muted-foreground hover:text-foreground"
                            title="Original source"
                        >
                            {build.source.platform === 'x' ? 'Post' : 'Source'}
                        </a>
                    )}
                    <Link
                        href={`/?task=${encodeURIComponent(task)}`}
                        className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-[0.7rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Write about it
                        <ArrowUpRight className="h-2.5 w-2.5" aria-hidden />
                    </Link>
                    <CopyButton value={task} label="Copy prompt" compact className="ml-auto h-7 w-7 justify-center p-0" />
                </div>
            </div>
        </article>
    );
}
