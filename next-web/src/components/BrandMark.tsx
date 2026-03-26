'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type BrandMarkProps = {
    className?: string;
    iconClassName?: string;
    labelClassName?: string;
    compact?: boolean;
};

export default function BrandMark({
    className,
    iconClassName,
    labelClassName,
    compact = false,
}: BrandMarkProps) {
    const gradientId = useId();

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span
                className={cn(
                    'relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[0.95rem] border border-border/75 bg-background/88 shadow-[0_14px_28px_hsl(var(--foreground)/0.12)]',
                    iconClassName
                )}
                aria-hidden="true"
            >
                <svg viewBox="0 0 64 64" className="h-7 w-7">
                    <defs>
                        <linearGradient id={gradientId} x1="10%" y1="10%" x2="90%" y2="90%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--brand-warm))" />
                        </linearGradient>
                    </defs>
                    <path d="M13 14H27V50H13V14Z" fill="hsl(var(--foreground) / 0.08)" />
                    <path
                        d="M16 14H28V32H36.4L47.5 14H59L46.8 33.2C51.7 35 55 39.4 55 45.4C55 52.6 49 58 41.1 58H28V46.8H39.5C43.3 46.8 45.6 44.6 45.6 41.5C45.6 38.3 43.3 36 39.5 36H28V58H16V14Z"
                        fill={`url(#${gradientId})`}
                    />
                    <path
                        d="M36 14H49.3L40.7 28H32L36 14Z"
                        fill="hsl(var(--background) / 0.9)"
                    />
                </svg>
            </span>

            {!compact ? (
                <span className={cn('flex min-w-0 flex-col', labelClassName)}>
                    <span className="truncate text-base font-semibold tracking-[-0.035em] text-foreground">
                        Pryzmira
                    </span>
                    <span className="truncate font-mono text-[0.66rem] uppercase tracking-[0.24em] text-muted-foreground">
                        AI operating desk
                    </span>
                </span>
            ) : null}
        </div>
    );
}
