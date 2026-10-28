'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpen, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VoiceThinkingIndicator from '@/components/VoiceThinkingIndicator';
import {
    MAX_SAMPLE_CHARACTERS,
    MIN_SAMPLE_WORDS,
    countWords,
    type VoiceResponsePayload,
    type VoiceSavedGeneration,
} from '@/lib/voice';
import { WRITING_SAMPLE_PRESETS } from '@/lib/samples';
import { normalizeVoiceRequestError } from '@/lib/voiceRequestError';
import { pushVoiceHistory, setCurrentVoiceGeneration } from '@/lib/voiceSession';

const MAX_TASK_PREFILL_CHARS = 800;

export default function VoiceHome() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [sampleText, setSampleText] = useState('');
    const [writingTask, setWritingTask] = useState(() =>
        (searchParams.get('task') || '').slice(0, MAX_TASK_PREFILL_CHARS)
    );
    const [extraInstructions, setExtraInstructions] = useState(() =>
        (searchParams.get('instructions') || '').slice(0, MAX_TASK_PREFILL_CHARS)
    );
    const [activePreset, setActivePreset] = useState('');
    const [demoMode, setDemoMode] = useState<boolean | null>(null);
    const [error, setError] = useState('');

    const wordCount = useMemo(() => countWords(sampleText), [sampleText]);
    const sampleReady = wordCount >= MIN_SAMPLE_WORDS;
    const canSubmit = sampleReady && writingTask.trim().length > 0;
    const prefilledFromGallery = Boolean(searchParams.get('task'));

    useEffect(() => {
        let active = true;

        fetch('/api/voice/health', { cache: 'no-store' })
            .then((response) => response.json())
            .then((payload: { demoMode?: boolean }) => {
                if (active) {
                    setDemoMode(Boolean(payload.demoMode));
                }
            })
            .catch(() => {
                if (active) {
                    setDemoMode(null);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const applyPreset = (preset: (typeof WRITING_SAMPLE_PRESETS)[number]) => {
        setSampleText(preset.sampleText);
        setActivePreset(preset.id);
        setError('');

        if (!writingTask.trim()) {
            setWritingTask(preset.suggestedTask);
        }

        if (!extraInstructions.trim()) {
            setExtraInstructions(preset.suggestedInstructions);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;
        setError('');

        startTransition(async () => {
            try {
                const response = await fetch('/api/voice/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sampleText, writingTask, extraInstructions }),
                });

                const payload = (await response.json()) as VoiceResponsePayload & {
                    error?: string;
                    generationId?: string;
                };

                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to generate voice output.');
                }

                const generation: VoiceSavedGeneration = {
                    id: payload.generationId || crypto.randomUUID(),
                    profileId: null,
                    writingTask,
                    extraInstructions: extraInstructions || null,
                    outputText: payload.outputText,
                    preview: payload.preview,
                    createdAt: payload.createdAt,
                    persisted: false,
                    voiceInsights: payload.voiceInsights,
                    insightBullets: payload.insightBullets,
                    voiceContext: payload.voiceContext,
                    demo: payload.demo,
                    remainingQuota: payload.remainingQuota,
                    quotaLimit: payload.quotaLimit,
                };

                setCurrentVoiceGeneration(generation);
                pushVoiceHistory(generation);
                router.push('/desk');
            } catch (requestError) {
                setError(
                    normalizeVoiceRequestError(requestError, 'Unable to generate voice output.')
                );
            }
        });
    };

    return (
        <div className="page-container pb-20 pt-8 md:pt-16">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    Write in your voice
                </h1>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                    Paste something you have actually written - an email, a message, notes. Then tell us
                    what you need, and we will write it in your voice.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                        href="/guide"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                        <BookOpen className="h-3 w-3" />
                        Read the guide
                    </Link>
                    <Link
                        href="/builds"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                        <Layers className="h-3 w-3" />
                        Builds made with AI models
                    </Link>
                </div>
            </div>

            {demoMode && (
                <div className="mb-5 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                    <span className="font-medium">Demo mode.</span> No model key is configured, so you
                    will get a locally composed scaffold with bracketed placeholders. Nothing is sent to
                    a model. Add a key to generate for real -{' '}
                    <Link href="/guide#environment" className="underline underline-offset-2">
                        setup steps
                    </Link>
                    .
                </div>
            )}

            {prefilledFromGallery && (
                <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-foreground">
                    <span className="font-medium">Task loaded from the build gallery.</span> Add your own
                    writing sample below so the draft sounds like you.
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        event.preventDefault();
                        event.currentTarget.requestSubmit();
                    }
                }}
                className="space-y-5"
            >
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="sample-text" className="text-sm font-medium text-foreground">
                            Writing sample
                        </label>
                        <span
                            className={`font-mono text-xs tabular-nums ${
                                sampleReady ? 'text-primary' : 'text-muted-foreground'
                            }`}
                        >
                            {wordCount}/{MIN_SAMPLE_WORDS} words
                        </span>
                    </div>
                    <textarea
                        id="sample-text"
                        value={sampleText}
                        onChange={(e) => {
                            setSampleText(e.target.value.slice(0, MAX_SAMPLE_CHARACTERS));
                            setActivePreset('');
                        }}
                        placeholder="Paste something you wrote recently - a text message, an email, class notes, a social media post. The more natural, the better. At least 50 words."
                        rows={7}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[0.7rem] text-muted-foreground">No sample handy?</span>
                        {WRITING_SAMPLE_PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                title={preset.description}
                                className={`rounded-sm border px-1.5 py-0.5 text-[0.7rem] transition-colors ${
                                    activePreset === preset.id
                                        ? 'border-primary/40 bg-primary/10 text-foreground'
                                        : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    {wordCount > 0 && !sampleReady && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {MIN_SAMPLE_WORDS - wordCount} more words needed
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="writing-task" className="mb-1.5 block text-sm font-medium text-foreground">
                        What do you need written?
                    </label>
                    <textarea
                        id="writing-task"
                        value={writingTask}
                        onChange={(e) => setWritingTask(e.target.value)}
                        placeholder='What should we write? e.g., "An email asking my professor for more time on my assignment"'
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="extra-instructions" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                        Extra instructions <span className="text-muted-foreground/60">optional</span>
                    </label>
                    <textarea
                        id="extra-instructions"
                        value={extraInstructions}
                        onChange={(e) => setExtraInstructions(e.target.value)}
                        placeholder='Any preferences? e.g., "Keep it short", "Sound professional but not stiff"'
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground/60">
                        Nothing stored unless you sign in. Press{' '}
                        <kbd className="rounded border border-border px-1 font-mono text-[0.65rem]">Ctrl</kbd>{' '}
                        +{' '}
                        <kbd className="rounded border border-border px-1 font-mono text-[0.65rem]">Enter</kbd>{' '}
                        to generate.
                    </p>
                    <Button type="submit" disabled={isPending || !canSubmit} className="gap-2">
                        {isPending ? (
                            <>
                                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3.5 w-3.5" />
                                Generate
                            </>
                        )}
                    </Button>
                </div>

                {isPending && <VoiceThinkingIndicator mode="generate" />}

                {error && (
                    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                        <span className="flex-1">{error}</span>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            className="shrink-0 text-destructive/60 hover:text-destructive"
                            aria-label="Dismiss"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                )}
            </form>

            <div className="mt-10 border-t border-border pt-5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Not sure how to ask? The{' '}
                    <Link href="/guide#recipes" className="text-foreground underline underline-offset-2">
                        guide has six recipes
                    </Link>{' '}
                    with ready-made tasks and constraints.{' '}
                    <Link href="/guide#capabilities" className="text-foreground underline underline-offset-2">
                        See everything it can do
                    </Link>
                    .
                </p>
                <Link
                    href="/builds"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                    Browse what other people are building
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
