'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Bookmark, BookmarkCheck } from 'lucide-react';
import {
    isToolSaved,
    subscribeToPersonalDataUpdates,
    toggleSavedTool,
} from '@/lib/personalDesk';
import { saveRecentTool } from '@/lib/recentlyViewed';

interface Tool {
    id: string;
    name: string;
    category: string;
    description: string;
    url: string;
    tags: string[];
    pricing: string;
    image: string;
    featured?: boolean;
    affiliateUrl?: string;
}

export default function ToolCard({ tool }: { tool: Tool }) {
    const [imgSrc, setImgSrc] = useState(tool.image);
    const [saved, setSaved] = useState(false);

    const visitUrl =
        tool.affiliateUrl ||
        `/api/tools/click?url=${encodeURIComponent(tool.url)}&id=${encodeURIComponent(tool.id)}`;

    useEffect(() => {
        const syncSavedState = () => {
            setSaved(isToolSaved(tool.id));
        };

        syncSavedState();
        return subscribeToPersonalDataUpdates(syncSavedState);
    }, [tool.id]);

    const handleSave = () => {
        toggleSavedTool({
            id: tool.id,
            name: tool.name,
            category: tool.category,
            url: tool.url,
            description: tool.description,
            pricing: tool.pricing,
        });
    };

    return (
        <article className="paper-panel hover-rise group flex h-full flex-col overflow-hidden rounded-[1.8rem]">
            <div className="relative flex items-start justify-between gap-4 border-b border-border/70 p-5">
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[1.2rem] border border-border bg-card">
                        <Image
                            src={imgSrc}
                            alt={tool.name}
                            fill
                            className={`${
                                tool.image.includes('s2/favicons')
                                    ? 'object-contain bg-white p-3'
                                    : 'object-cover'
                            }`}
                            sizes="64px"
                            onError={() => setImgSrc('/logo.png')}
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {tool.category}
                        </p>
                        <h3 className="text-2xl font-semibold leading-tight text-foreground">
                            {tool.name}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border bg-background/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {tool.pricing}
                    </span>
                    <button
                        type="button"
                        onClick={handleSave}
                        aria-label={saved ? 'Remove tool from desk' : 'Save tool to desk'}
                        className="rounded-full border border-border bg-background/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {saved ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                            <Bookmark className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="flex-1 text-sm leading-7 text-muted-foreground">
                    {tool.description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {tool.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="ink-rule" />

                <a
                    href={visitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="editorial-link text-sm text-foreground"
                    onClick={() =>
                        saveRecentTool({
                            id: tool.id,
                            name: tool.name,
                            category: tool.category,
                            url: tool.url,
                        })
                    }
                >
                    Visit tool
                    <ArrowUpRight className="h-4 w-4" />
                </a>
            </div>
        </article>
    );
}
