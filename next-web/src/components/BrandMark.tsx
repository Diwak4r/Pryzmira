'use client';

import { cn } from '@/lib/utils';

type BrandMarkProps = {
    className?: string;
    compact?: boolean;
};

export default function BrandMark({ className, compact = false }: BrandMarkProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
                aria-hidden="true"
            >
                P
            </span>
            {!compact && (
                <span className="text-sm font-semibold tracking-tight text-foreground">
                    Pryzmira
                </span>
            )}
        </div>
    );
}
