'use client';

import { useEffect, useMemo, useState } from 'react';

type VoiceThinkingMode = 'generate' | 'refine';

const MODE_MESSAGES: Record<VoiceThinkingMode, string[]> = {
    generate: [
        'Reading your sample and learning your rhythm.',
        'Mapping your wording habits and transitions.',
        'Drafting in your voice with simple English.',
        'Final pass to remove generic phrasing.',
    ],
    refine: [
        'Re-checking your current draft.',
        'Applying your refine instruction.',
        'Keeping the same voice, improving clarity.',
        'Smoothing tone and sentence flow.',
    ],
};

function getMergedClassName(baseClassName: string, className?: string): string {
    return className ? `${baseClassName} ${className}` : baseClassName;
}

export default function VoiceThinkingIndicator({
    mode,
    className,
}: {
    mode: VoiceThinkingMode;
    className?: string;
}) {
    const messages = useMemo(() => MODE_MESSAGES[mode], [mode]);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setMessageIndex((previous) => (previous + 1) % messages.length);
        }, 1650);

        return () => window.clearInterval(timer);
    }, [messages]);

    return (
        <div
            className={getMergedClassName(
                'rounded-md border border-primary/30 bg-primary/5 px-3 py-3',
                className
            )}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((dotIndex) => (
                        <span
                            key={dotIndex}
                            className="h-2 w-2 rounded-full bg-primary/80 animate-bounce"
                            style={{
                                animationDelay: `${dotIndex * 120}ms`,
                                animationDuration: '900ms',
                            }}
                        />
                    ))}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Thinking...</p>
                    <p className="truncate text-xs text-muted-foreground">{messages[messageIndex]}</p>
                </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/15">
                <div className="voice-scan-bar h-full w-2/5 rounded-full bg-primary/70" />
            </div>
        </div>
    );
}
