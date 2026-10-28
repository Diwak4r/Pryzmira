'use client';

import { useEffect, useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CopyButton({
    value,
    label = 'Copy',
    className,
    compact = false,
}: {
    value: string;
    label?: string;
    className?: string;
    compact?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = window.setTimeout(() => setCopied(false), 1500);
        return () => window.clearTimeout(timer);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied' : label}
            aria-label={copied ? 'Copied' : label}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground',
                compact ? 'h-7 px-2' : 'px-2.5 py-1.5',
                className
            )}
        >
            {copied ? <Check className="h-3 w-3 text-primary" /> : <ClipboardCopy className="h-3 w-3" />}
            {!compact && <span>{copied ? 'Copied' : label}</span>}
        </button>
    );
}
