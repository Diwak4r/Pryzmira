'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ArrowRight,
    Check,
    ChevronDown,
    ClipboardCopy,
    Download,
    LogOut,
    RefreshCw,
    Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    getCurrentVoiceGeneration,
    getPendingVoiceSave,
    getVoiceHistory,
    pushVoiceHistory,
    setCurrentVoiceGeneration,
    setPendingVoiceSave,
    subscribeToVoiceSession,
} from '@/lib/voiceSession';
import type {
    VoiceAnalysis,
    VoiceResponsePayload,
    VoiceSavedGeneration,
} from '@/lib/voice';

const QUICK_REFINE_ACTIONS = [
    'Make it shorter.',
    'Make it warmer.',
    'Make it more formal.',
    'Add more personality.',
];

const ANALYSIS_FIELDS: { key: keyof VoiceAnalysis; label: string }[] = [
    { key: 'tone', label: 'Tone' },
    { key: 'sentenceRhythm', label: 'Rhythm' },
    { key: 'vocabularyHabits', label: 'Vocabulary' },
    { key: 'transitions', label: 'Transitions' },
    { key: 'languageMixing', label: 'Language' },
    { key: 'closingStyle', label: 'Closing' },
];

interface AuthSessionPayload {
    authenticated: boolean;
    user: { id: string; email: string | null } | null;
}

const shellEase = [0.22, 1, 0.36, 1] as const;

export default function VoiceDesk() {
    const searchParams = useSearchParams();
    const shouldReduceMotion = useReducedMotion();
    const [currentGeneration, setCurrentGenerationState] = useState<VoiceSavedGeneration | null>(null);
    const [sessionHistory, setSessionHistory] = useState<VoiceSavedGeneration[]>([]);
    const [savedHistory, setSavedHistory] = useState<VoiceSavedGeneration[]>([]);
    const [authState, setAuthState] = useState<AuthSessionPayload>({
        authenticated: false,
        user: null,
    });
    const [customRefineInstruction, setCustomRefineInstruction] = useState('');
    const [magicLinkEmail, setMagicLinkEmail] = useState('');
    const [magicLinkOpen, setMagicLinkOpen] = useState(false);
    const [magicLinkMessage, setMagicLinkMessage] = useState('');
    const [error, setError] = useState('');
    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
    const [isPending, startTransition] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const [insightsOpen, setInsightsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [confettiShown, setConfettiShown] = useState(false);

    const authStatus = searchParams.get('auth');

    // Sync from session storage
    useEffect(() => {
        const sync = () => {
            setCurrentGenerationState(getCurrentVoiceGeneration());
            setSessionHistory(getVoiceHistory());
        };
        sync();
        return subscribeToVoiceSession(sync);
    }, []);

    // Load auth + saved history
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch('/api/voice/auth/session', { cache: 'no-store' });
                const session = (await res.json()) as AuthSessionPayload;
                if (cancelled) return;
                setAuthState(session);
                if (!session.authenticated) { setSavedHistory([]); return; }
                const hRes = await fetch('/api/voice/history', { cache: 'no-store' });
                const hPayload = (await hRes.json()) as { history?: VoiceSavedGeneration[] };
                if (!cancelled) setSavedHistory(Array.isArray(hPayload.history) ? hPayload.history : []);
            } catch {
                if (!cancelled) { setSavedHistory([]); setAuthState({ authenticated: false, user: null }); }
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [authStatus]);

    const reloadSavedHistory = useCallback(async () => {
        const res = await fetch('/api/voice/history', { cache: 'no-store' });
        const payload = (await res.json()) as { history?: VoiceSavedGeneration[] };
        setSavedHistory(Array.isArray(payload.history) ? payload.history : []);
    }, []);

    const persistGeneration = useCallback(async (gen: VoiceSavedGeneration) => {
        const res = await fetch('/api/voice/save-current', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voiceContext: gen.voiceContext,
                latestOutput: gen.outputText,
                writingTask: gen.writingTask,
                extraInstructions: gen.extraInstructions || '',
            }),
        });
        const payload = (await res.json()) as { error?: string; profileId?: string };
        if (!res.ok) throw new Error(payload.error || 'Unable to save.');
        const next: VoiceSavedGeneration = { ...gen, profileId: payload.profileId || gen.profileId, persisted: true };
        setCurrentVoiceGeneration(next);
        setCurrentGenerationState(next);
        setSessionHistory(pushVoiceHistory(next));
        await reloadSavedHistory();
    }, [reloadSavedHistory]);

    // Auto-save pending
    useEffect(() => {
        if (!authState.authenticated || !currentGeneration || !getPendingVoiceSave()) return;
        startSaving(async () => {
            try {
                await persistGeneration(currentGeneration);
                setPendingVoiceSave(false);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to save voice profile.');
            }
        });
    }, [authState.authenticated, currentGeneration, persistGeneration]);

    // Confetti on first generation
    useEffect(() => {
        if (!currentGeneration) return;
        const key = 'pryzmira_voice_confetti_shown';
        if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
            setConfettiShown(true);
            sessionStorage.setItem(key, '1');
            const t = setTimeout(() => setConfettiShown(false), 2800);
            return () => clearTimeout(t);
        }
    }, [currentGeneration]);

    const combinedHistory = useMemo(() => {
        const map = new Map<string, VoiceSavedGeneration>();
        sessionHistory.forEach((e) => map.set(e.id, e));
        savedHistory.forEach((e) => map.set(e.id, e));
        return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [savedHistory, sessionHistory]);

    const handleRefine = (instruction: string) => {
        if (!currentGeneration || !instruction.trim()) return;
        setError('');
        startTransition(async () => {
            try {
                const res = await fetch('/api/voice/refine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        voiceContext: currentGeneration.voiceContext,
                        previousOutput: currentGeneration.outputText,
                        refineInstruction: instruction,
                    }),
                });
                const payload = (await res.json()) as VoiceResponsePayload & { error?: string; generationId?: string };
                if (!res.ok) throw new Error(payload.error || 'Unable to refine.');
                const next: VoiceSavedGeneration = {
                    id: payload.generationId || crypto.randomUUID(),
                    profileId: currentGeneration.profileId || null,
                    writingTask: currentGeneration.writingTask,
                    extraInstructions: currentGeneration.extraInstructions || null,
                    outputText: payload.outputText,
                    preview: payload.preview,
                    createdAt: payload.createdAt,
                    persisted: false,
                    voiceInsights: payload.voiceInsights,
                    insightBullets: payload.insightBullets,
                    voiceContext: payload.voiceContext,
                };
                setCurrentVoiceGeneration(next);
                setCurrentGenerationState(next);
                setSessionHistory(pushVoiceHistory(next));
                setCustomRefineInstruction('');
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to refine.');
            }
        });
    };

    const handleMagicLink = () => {
        setError('');
        setMagicLinkMessage('');
        setPendingVoiceSave(true);
        startSaving(async () => {
            try {
                const res = await fetch('/api/voice/auth/magic-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: magicLinkEmail }),
                });
                const payload = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(payload.error || 'Unable to send magic link.');
                setMagicLinkMessage('Magic link sent. Open it, then return to this desk.');
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to send magic link.');
            }
        });
    };

    const handleSave = () => {
        if (!currentGeneration) return;
        if (!authState.authenticated) { setMagicLinkOpen(true); return; }
        setError('');
        startSaving(async () => {
            try {
                await persistGeneration(currentGeneration);
                setPendingVoiceSave(false);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to save.');
            }
        });
    };

    const handleSignOut = () => {
        startSaving(async () => {
            await fetch('/api/voice/auth/sign-out', { method: 'POST' });
            setAuthState({ authenticated: false, user: null });
            setSavedHistory([]);
        });
    };

    const handleCopy = async () => {
        if (!currentGeneration) return;
        await navigator.clipboard.writeText(currentGeneration.outputText);
        setCopyState('copied');
        setTimeout(() => setCopyState('idle'), 1400);
    };

    const handleDownload = () => {
        if (!currentGeneration) return;
        const blob = new Blob([currentGeneration.outputText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pryzmira-voice-output.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const analysis = currentGeneration?.voiceContext?.analysis;

    // — Empty state —
    if (!currentGeneration) {
        return (
            <div className="pb-24">
                <section className="page-shell">
                    <div className="mx-auto max-w-2xl pt-12 md:pt-20 text-center">
                        <p className="utility-kicker mx-auto">Voice desk</p>
                        <h1 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] leading-[1.1] text-display">
                            No generation yet.
                        </h1>
                        <p className="mt-4 mx-auto max-w-md text-[0.95rem] leading-[1.8] text-muted-foreground">
                            Generate a voice draft from the home page first. Your output,
                            voice profile, and history will appear here.
                        </p>
                        <div className="mt-8">
                            <Button asChild className="group rounded-full px-7 py-6 text-sm font-semibold">
                                <Link href="/">
                                    Go to voice intake
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // — Full desk —
    return (
        <>
            {/* Confetti overlay */}
            <AnimatePresence>
                {confettiShown && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
                        aria-hidden
                    >
                        <motion.p
                            initial={shouldReduceMotion ? {} : { scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{ duration: 0.4, ease: shellEase }}
                            className="text-display text-5xl md:text-7xl text-primary select-none"
                        >
                            First draft
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Magic link dialog */}
            <Dialog open={magicLinkOpen} onOpenChange={setMagicLinkOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save this voice profile</DialogTitle>
                        <DialogDescription>
                            Sign in with a magic link. Once verified, Pryzmira saves
                            the current profile and draft permanently.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="magic-link-email">Email</Label>
                            <Input
                                id="magic-link-email"
                                type="email"
                                value={magicLinkEmail}
                                onChange={(e) => setMagicLinkEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <Button onClick={handleMagicLink} disabled={isSaving} className="w-full rounded-full">
                            {isSaving ? 'Sending…' : 'Send magic link'}
                        </Button>
                        {magicLinkMessage && (
                            <p className="text-sm text-muted-foreground">{magicLinkMessage}</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="pb-24">
                {/* Header strip */}
                <section className="page-shell">
                    <div className="mx-auto max-w-4xl pt-6 md:pt-10">
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="utility-kicker">Voice desk</p>
                            {authState.authenticated ? (
                                <span className="brand-chip">
                                    <span className="brand-chip-dot" />
                                    {authState.user?.email || 'Signed in'}
                                </span>
                            ) : (
                                <span className="brand-chip">Anonymous session</span>
                            )}
                        </div>

                        <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.15] text-display">
                            {currentGeneration.writingTask}
                        </h1>
                    </div>
                </section>

                {/* Voice analysis rail */}
                {analysis && (
                    <section className="page-shell mt-8">
                        <div className="mx-auto max-w-4xl">
                            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.1rem] border border-border/70 bg-border/40 md:grid-cols-3 lg:grid-cols-6">
                                {ANALYSIS_FIELDS.map(({ key, label }) => (
                                    <div
                                        key={key}
                                        className="bg-card/80 px-4 py-3.5"
                                    >
                                        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                                            {label}
                                        </p>
                                        <p className="mt-1.5 text-[0.82rem] leading-snug text-foreground">
                                            {analysis[key] || '—'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Voice insights — expandable */}
                {currentGeneration.voiceInsights && (
                    <section className="page-shell mt-4">
                        <div className="mx-auto max-w-4xl">
                            <button
                                type="button"
                                onClick={() => setInsightsOpen(!insightsOpen)}
                                className="flex w-full items-center justify-between rounded-[0.9rem] border border-border/60 bg-card/40 px-5 py-3 text-left transition-colors hover:bg-card/60"
                            >
                                <span className="control-label">Voice insights</span>
                                <ChevronDown
                                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                        insightsOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <AnimatePresence initial={false}>
                                {insightsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: shellEase }}
                                        className="overflow-hidden"
                                    >
                                        <div className="rounded-b-[0.9rem] border border-t-0 border-border/60 bg-card/30 px-5 py-4">
                                            <p className="text-[0.88rem] leading-[1.8] text-muted-foreground">
                                                {currentGeneration.voiceInsights}
                                            </p>
                                            {currentGeneration.insightBullets.length > 0 && (
                                                <ul className="mt-3 space-y-1.5">
                                                    {currentGeneration.insightBullets.map((bullet, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-2.5 text-[0.85rem] leading-[1.7] text-muted-foreground"
                                                        >
                                                            <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-primary" />
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                {/* Main output */}
                <section className="page-shell mt-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="rounded-[1.3rem] border border-border/70 bg-card/60">
                            {/* Output toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-3 md:px-7">
                                <p className="control-label">Output</p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        {copyState === 'copied' ? (
                                            <Check className="h-3 w-3 text-primary" />
                                        ) : (
                                            <ClipboardCopy className="h-3 w-3" />
                                        )}
                                        {copyState === 'copied' ? 'Copied' : 'Copy'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDownload}
                                        className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        <Download className="h-3 w-3" />
                                        .txt
                                    </Button>
                                </div>
                            </div>

                            {/* The writing */}
                            <div className="px-5 py-6 md:px-7 md:py-8">
                                <div className="prose-voice max-w-none whitespace-pre-wrap text-[0.95rem] leading-[1.9] text-foreground">
                                    {currentGeneration.outputText}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Refine strip */}
                <section className="page-shell mt-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2">
                            {QUICK_REFINE_ACTIONS.map((action) => (
                                <button
                                    key={action}
                                    type="button"
                                    onClick={() => handleRefine(action)}
                                    disabled={isPending}
                                    className="filter-chip hover:border-primary/30 hover:text-foreground disabled:opacity-50"
                                >
                                    {action.replace('.', '')}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() =>
                                    handleRefine('Regenerate the same task from scratch while keeping the same voice.')
                                }
                                disabled={isPending}
                                className="filter-chip hover:border-primary/30 hover:text-foreground disabled:opacity-50"
                            >
                                <RefreshCw className="mr-1.5 inline h-3 w-3" />
                                Regenerate
                            </button>
                        </div>

                        {/* Custom refine */}
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={customRefineInstruction}
                                onChange={(e) => setCustomRefineInstruction(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customRefineInstruction.trim()) {
                                        handleRefine(customRefineInstruction);
                                    }
                                }}
                                placeholder="Custom refine instruction…"
                                className="flex-1 rounded-full border border-border/70 bg-card/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-ring/20"
                            />
                            <Button
                                onClick={() => handleRefine(customRefineInstruction)}
                                disabled={isPending || !customRefineInstruction.trim()}
                                className="rounded-full px-5 text-sm font-medium"
                            >
                                {isPending ? 'Refining…' : 'Apply'}
                            </Button>
                        </div>

                        {/* Pending bar */}
                        {isPending && (
                            <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    className="h-full rounded-full bg-primary"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '80%' }}
                                    transition={{ duration: 8, ease: 'easeOut' }}
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Actions + History */}
                <section className="page-shell mt-10">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid gap-6 lg:grid-cols-[1fr_0.44fr]">
                            {/* Actions */}
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="rounded-full px-6 text-sm font-medium"
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                        {isSaving ? 'Saving…' : 'Save voice profile'}
                                    </Button>
                                    {authState.authenticated && (
                                        <Button
                                            variant="outline"
                                            onClick={handleSignOut}
                                            className="rounded-full px-5 text-sm font-medium"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Sign out
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="rounded-full px-5 text-sm font-medium"
                                    >
                                        <Link href="/">New draft</Link>
                                    </Button>
                                </div>

                                {/* Stripe placeholder */}
                                <div className="rounded-[0.9rem] border border-border/50 border-dashed bg-card/20 px-5 py-3">
                                    <p className="text-[0.78rem] text-muted-foreground/50">
                                        Unlimited voice profiles — $5/mo.{' '}
                                        <span className="font-medium text-muted-foreground/70">Coming soon.</span>
                                    </p>
                                </div>
                            </div>

                            {/* History sidebar */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setHistoryOpen(!historyOpen)}
                                    className="flex w-full items-center justify-between rounded-t-[0.9rem] border border-border/60 bg-card/40 px-4 py-3 text-left transition-colors hover:bg-card/60"
                                >
                                    <span className="control-label">
                                        History{' '}
                                        <span className="font-mono text-[0.62rem] normal-case tracking-normal text-muted-foreground/50">
                                            ({combinedHistory.length})
                                        </span>
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                            historyOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                <AnimatePresence initial={false}>
                                    {historyOpen && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.25, ease: shellEase }}
                                            className="overflow-hidden"
                                        >
                                            <div className="max-h-80 space-y-0 overflow-y-auto rounded-b-[0.9rem] border border-t-0 border-border/60 scrollbar-hide">
                                                {combinedHistory.length === 0 ? (
                                                    <div className="px-4 py-5 text-[0.82rem] text-muted-foreground">
                                                        No history yet.
                                                    </div>
                                                ) : (
                                                    combinedHistory.map((entry) => (
                                                        <button
                                                            key={entry.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setCurrentVoiceGeneration(entry);
                                                                setCurrentGenerationState(entry);
                                                            }}
                                                            className={`block w-full border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-card/50 last:border-b-0 ${
                                                                entry.id === currentGeneration.id
                                                                    ? 'bg-primary/5'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <p className="text-[0.82rem] font-medium leading-snug text-foreground">
                                                                {entry.writingTask}
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground/50">
                                                                    {entry.persisted ? 'saved' : 'session'}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error / success banners */}
                <section className="page-shell mt-4">
                    <div className="mx-auto max-w-4xl">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-[0.9rem] border border-destructive/30 bg-destructive/8 px-5 py-3 text-sm text-destructive"
                            >
                                {error}
                            </motion.div>
                        )}
                        {authStatus === 'success' && (
                            <div className="rounded-[0.9rem] border border-primary/25 bg-primary/6 px-5 py-3 text-sm text-foreground">
                                Magic link accepted. Saving your voice profile now.
                            </div>
                        )}
                        {authStatus === 'error' && (
                            <div className="rounded-[0.9rem] border border-destructive/30 bg-destructive/8 px-5 py-3 text-sm text-destructive">
                                Magic link could not be verified. Request a new one.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
