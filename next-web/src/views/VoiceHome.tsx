'use client';

import { useState, useTransition } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    MIN_SAMPLE_WORDS,
    countWords,
    type VoiceResponsePayload,
    type VoiceSavedGeneration,
} from '@/lib/voice';
import {
    pushVoiceHistory,
    setCurrentVoiceGeneration,
} from '@/lib/voiceSession';

const shellEase = [0.22, 1, 0.36, 1] as const;

export default function VoiceHome() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();
    const [isPending, startTransition] = useTransition();
    const [sampleText, setSampleText] = useState('');
    const [writingTask, setWritingTask] = useState('');
    const [extraInstructions, setExtraInstructions] = useState('');
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const wordCount = countWords(sampleText);
    const sampleReady = wordCount >= MIN_SAMPLE_WORDS;
    const canSubmit = sampleReady && writingTask.trim().length > 0;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!canSubmit) return;

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
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to generate voice output.'
                );
            }
        });
    };

    const fadeUp = shouldReduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.5, ease: shellEase },
          };

    return (
        <div className="pb-24">
            {/* Hero — editorial, type-forward */}
            <section className="page-shell">
                <motion.div
                    {...fadeUp}
                    className="mx-auto max-w-3xl pt-8 md:pt-14"
                >
                    <p className="utility-kicker">Voice intake</p>

                    <h1 className="mt-5 text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.08] text-display">
                        Write anything —{' '}
                        <span className="text-muted-foreground">exactly like you.</span>
                    </h1>

                    <p className="mt-5 max-w-xl text-[1.05rem] leading-[1.8] text-muted-foreground">
                        Paste one real writing sample. Describe what you need written.
                        Pryzmira builds a voice profile first, then generates — so the
                        output sounds human and sounds like you.
                    </p>
                </motion.div>
            </section>

            {/* Form — the writing surface */}
            <section className="page-shell mt-12 md:mt-16">
                <motion.div
                    {...(shouldReduceMotion
                        ? {}
                        : {
                              initial: { opacity: 0, y: 24 },
                              animate: { opacity: 1, y: 0 },
                              transition: { duration: 0.55, ease: shellEase, delay: 0.08 },
                          })}
                    className="mx-auto max-w-3xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-0">
                        {/* Sample text field */}
                        <div
                            className={`rounded-t-[1.4rem] border border-b-0 border-border/70 bg-card/60 p-5 md:p-7 transition-colors duration-200 ${
                                focusedField === 'sample'
                                    ? 'border-primary/30 bg-card/80'
                                    : ''
                            }`}
                        >
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <label
                                    htmlFor="sample-text"
                                    className="control-label"
                                >
                                    Your writing sample
                                </label>
                                <span
                                    className={`font-mono text-xs tabular-nums transition-colors ${
                                        sampleReady
                                            ? 'text-primary'
                                            : wordCount > 0
                                              ? 'text-muted-foreground'
                                              : 'text-muted-foreground/50'
                                    }`}
                                >
                                    {wordCount} / {MIN_SAMPLE_WORDS} words
                                </span>
                            </div>
                            <textarea
                                id="sample-text"
                                value={sampleText}
                                onChange={(e) => setSampleText(e.target.value)}
                                onFocus={() => setFocusedField('sample')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Paste at least 50 words of your real writing — emails, notes, posts, messages, anything natural."
                                rows={8}
                                className="w-full resize-none bg-transparent text-[0.94rem] leading-[1.85] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                                required
                            />
                            {wordCount > 0 && !sampleReady && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {MIN_SAMPLE_WORDS - wordCount} more words needed for
                                    accurate voice analysis.
                                </p>
                            )}
                        </div>

                        {/* Writing task field */}
                        <div
                            className={`border border-b-0 border-border/70 bg-card/60 p-5 md:p-7 transition-colors duration-200 ${
                                focusedField === 'task'
                                    ? 'border-primary/30 bg-card/80'
                                    : ''
                            }`}
                        >
                            <label
                                htmlFor="writing-task"
                                className="control-label mb-3 block"
                            >
                                What do you need written?
                            </label>
                            <textarea
                                id="writing-task"
                                value={writingTask}
                                onChange={(e) => setWritingTask(e.target.value)}
                                onFocus={() => setFocusedField('task')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Example: Write an email asking my professor for a two-day deadline extension."
                                rows={4}
                                className="w-full resize-none bg-transparent text-[0.94rem] leading-[1.85] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                                required
                            />
                        </div>

                        {/* Extra instructions — collapsed feel */}
                        <div
                            className={`border border-border/70 bg-card/40 p-5 md:p-7 transition-colors duration-200 ${
                                focusedField === 'extra'
                                    ? 'border-primary/30 bg-card/60'
                                    : ''
                            }`}
                        >
                            <label
                                htmlFor="extra-instructions"
                                className="control-label mb-3 block"
                            >
                                Extra instructions{' '}
                                <span className="normal-case tracking-normal text-muted-foreground/50">
                                    — optional
                                </span>
                            </label>
                            <textarea
                                id="extra-instructions"
                                value={extraInstructions}
                                onChange={(e) => setExtraInstructions(e.target.value)}
                                onFocus={() => setFocusedField('extra')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Constraints like length, tone shift, or what must be included."
                                rows={2}
                                className="w-full resize-none bg-transparent text-[0.94rem] leading-[1.85] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                            />
                        </div>

                        {/* Submit bar */}
                        <div className="rounded-b-[1.4rem] border border-t-0 border-border/70 bg-card/30 px-5 py-4 md:px-7 md:py-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[0.8rem] leading-relaxed text-muted-foreground/60">
                                    Anonymous — nothing stored unless you sign in and save.
                                </p>
                                <Button
                                    type="submit"
                                    disabled={isPending || !canSubmit}
                                    className="group relative rounded-full px-7 py-6 text-sm font-semibold"
                                >
                                    {isPending ? (
                                        <>
                                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Analyzing voice…
                                        </>
                                    ) : (
                                        <>
                                            <Pen className="h-3.5 w-3.5" />
                                            Generate in my voice
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Progress bar during generation */}
                            {isPending && (
                                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                                    <motion.div
                                        className="h-full rounded-full bg-primary"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 12, ease: 'easeOut' }}
                                    />
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 rounded-[1rem] border border-destructive/30 bg-destructive/8 px-5 py-3.5 text-sm text-destructive"
                        >
                            {error}
                        </motion.div>
                    )}
                </motion.div>
            </section>

            {/* How it works — minimal, not cards */}
            <section className="page-shell mt-20 md:mt-28">
                <motion.div
                    {...(shouldReduceMotion
                        ? {}
                        : {
                              initial: { opacity: 0 },
                              whileInView: { opacity: 1 },
                              viewport: { once: true, margin: '-80px' },
                              transition: { duration: 0.6, ease: shellEase },
                          })}
                    className="mx-auto max-w-3xl"
                >
                    <div className="ink-rule mb-10" />

                    <div className="grid gap-10 md:grid-cols-3">
                        <div>
                            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                                01
                            </span>
                            <h3 className="mt-2 text-[0.95rem] font-semibold leading-snug text-foreground">
                                Voice analysis first
                            </h3>
                            <p className="mt-2 text-[0.85rem] leading-[1.75] text-muted-foreground">
                                Your sample is analyzed for tone, rhythm, vocabulary
                                habits, transitions, and language mixing before any
                                generation begins.
                            </p>
                        </div>
                        <div>
                            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                                02
                            </span>
                            <h3 className="mt-2 text-[0.95rem] font-semibold leading-snug text-foreground">
                                Draft in your voice
                            </h3>
                            <p className="mt-2 text-[0.85rem] leading-[1.75] text-muted-foreground">
                                Generation follows the voice profile. No generic AI
                                tone, no invented facts, no copy-pasting from your
                                sample.
                            </p>
                        </div>
                        <div>
                            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                                03
                            </span>
                            <h3 className="mt-2 text-[0.95rem] font-semibold leading-snug text-foreground">
                                Refine, don&apos;t restart
                            </h3>
                            <p className="mt-2 text-[0.85rem] leading-[1.75] text-muted-foreground">
                                Shorter, warmer, more formal — refine from the same
                                voice context. The profile persists across edits.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
