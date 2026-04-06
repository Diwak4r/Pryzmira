'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    MIN_SAMPLE_WORDS,
    countWords,
    type VoiceResponsePayload,
    type VoiceSavedGeneration,
} from '@/lib/voice';
import { normalizeVoiceRequestError } from '@/lib/voiceRequestError';
import {
    pushVoiceHistory,
    setCurrentVoiceGeneration,
} from '@/lib/voiceSession';

export default function VoiceHome() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [sampleText, setSampleText] = useState('');
    const [writingTask, setWritingTask] = useState('');
    const [extraInstructions, setExtraInstructions] = useState('');
    const [error, setError] = useState('');

    const wordCount = useMemo(() => countWords(sampleText), [sampleText]);
    const sampleReady = wordCount >= MIN_SAMPLE_WORDS;
    const canSubmit = sampleReady && writingTask.trim().length > 0;

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
            <div className="mb-10">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    Write in your voice
                </h1>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                    Paste something you&apos;ve actually written — an email, a message, notes. Then tell us what you need, and we&apos;ll write it in your voice.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                            {wordCount}/{MIN_SAMPLE_WORDS}
                        </span>
                    </div>
                    <textarea
                        id="sample-text"
                        value={sampleText}
                        onChange={(e) => setSampleText(e.target.value)}
                        placeholder="Paste something you wrote recently — a text message, an email, class notes, a social media post. The more natural, the better. At least 50 words."
                        rows={7}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
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
                        Nothing stored unless you sign in.
                    </p>
                    <Button
                        type="submit"
                        disabled={isPending || !canSubmit}
                        className="gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Generate
                                <ArrowRight className="h-3.5 w-3.5" />
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                        <span className="flex-1">{error}</span>
                        <button type="button" onClick={() => setError('')} className="shrink-0 rounded-sm text-destructive/60 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" aria-label="Dismiss">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
