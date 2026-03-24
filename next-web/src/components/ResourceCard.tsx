'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    ArrowUpRight,
    BookOpen,
    Bookmark,
    BookmarkCheck,
    ExternalLink,
    GraduationCap,
    Map,
    Youtube,
} from 'lucide-react';
import {
    isResourceSaved,
    subscribeToPersonalDataUpdates,
    toggleSavedResource,
} from '@/lib/personalDesk';

interface Resource {
    id: string;
    title: string;
    description: string;
    type: string;
    link: string;
    image: string;
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'YouTube Channel':
            return <Youtube className="h-4 w-4" />;
        case 'Course':
            return <GraduationCap className="h-4 w-4" />;
        case 'Guide':
            return <Map className="h-4 w-4" />;
        case 'Platform':
        case 'Book':
            return <BookOpen className="h-4 w-4" />;
        default:
            return <ExternalLink className="h-4 w-4" />;
    }
}

export default function ResourceCard({ resource }: { resource: Resource }) {
    const [imgSrc, setImgSrc] = useState(resource.image);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const syncSavedState = () => {
            setSaved(isResourceSaved(resource.id));
        };

        syncSavedState();
        return subscribeToPersonalDataUpdates(syncSavedState);
    }, [resource.id]);

    const handleSave = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        toggleSavedResource({
            id: resource.id,
            title: resource.title,
            type: resource.type,
            link: resource.link,
            description: resource.description,
        });
    };

    return (
        <a
            href={resource.link}
            target="_blank"
            rel="noreferrer"
            className="group block h-full"
        >
            <article className="paper-panel hover-rise flex h-full flex-col overflow-hidden rounded-[1.8rem]">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-border/70 bg-card">
                    <Image
                        src={imgSrc}
                        alt={resource.title}
                        fill
                        className={`${
                            resource.image.includes('logo.clearbit.com') ||
                            resource.image.includes('ui-avatars.com')
                                ? 'object-contain bg-white p-8'
                                : 'object-cover'
                        } transition-transform duration-500 group-hover:scale-105`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        onError={() => setImgSrc('/logo.png')}
                    />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                            {getTypeIcon(resource.type)}
                            {resource.type}
                        </span>
                        <button
                            type="button"
                            onClick={handleSave}
                            aria-label={saved ? 'Remove resource from desk' : 'Save resource to desk'}
                            className="rounded-full border border-border bg-background/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {saved ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                            ) : (
                                <Bookmark className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-semibold leading-tight text-foreground">
                            {resource.title}
                        </h3>
                        <p className="text-sm leading-7 text-muted-foreground">
                            {resource.description}
                        </p>
                    </div>
                    <div className="mt-auto">
                        <div className="ink-rule" />
                        <div className="editorial-link mt-4 text-sm text-foreground">
                            Open resource
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </article>
        </a>
    );
}
