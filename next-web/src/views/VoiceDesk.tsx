'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
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
import { normalizeVoiceRequestError } from '@/lib/voiceRequestError';

const QUICK_REFINE = [
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

interface AuthSession {
    authenticated: boolean;
    user: { id: string; email: string | null } | null;
}

export default function VoiceDesk() {
    const searchParams = useSearchParams();
    const [gen, setGen] = useState<VoiceSavedGeneration | null>(null);
    const [sessionHistory, setSessionHistory] = useState<VoiceSavedGeneration[]>([]);
    const [savedHistory, setSavedHistory] = useState<VoiceSavedGeneration[]>([]);
    const [auth, setAuth] = useState<AuthSession>({ authenticated: false, user: null });
    const [customRefine, setCustomRefine] = useState('');
    const [mlEmail, setMlEmail] = useState('');
    const [mlOpen, setMlOpen] = useState(false);
    const [mlMsg, setMlMsg] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const [insightsOpen, setInsightsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const authStatus = searchParams.get('auth');

    useEffect(() => {
        const sync = () => {
            setGen(getCurrentVoiceGeneration());
            setSessionHistory(getVoiceHistory());
        };
        sync();
        return subscribeToVoiceSession(sync);
    }, []);

    useEffect(() => {
        let c = false;
        const load = async () => {
            try {
                const [authRes, historyRes] = await Promise.all([
                    fetch('/api/voice/auth/session', { cache: 'no-store' }),
                    fetch('/api/voice/history', { cache: 'no-store' }),
                ]);
                const s = (await authRes.json()) as AuthSession;
                if (c) return;
                setAuth(s);
                if (s.authenticated) {
                    const p = (await historyRes.json()) as { history?: VoiceSavedGeneration[] };
                    if (!c) setSavedHistory(Array.isArray(p.history) ? p.history : []);
                } else {
                    setSavedHistory([]);
                }
            } catch {
                if (!c) { setSavedHistory([]); setAuth({ authenticated: false, user: null }); }
            }
        };
        void load();
        return () => { c = true; };
    }, [authStatus]);

    const reloadSaved = useCallback(async () => {
        const r = await fetch('/api/voice/history', { cache: 'no-store' });
        const p = (await r.json()) as { history?: VoiceSavedGeneration[] };
        setSavedHistory(Array.isArray(p.history) ? p.history : []);
    }, []);

    const persist = useCallback(async (g: VoiceSavedGeneration) => {
        const r = await fetch('/api/voice/save-current', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voiceContext: g.voiceContext,
                latestOutput: g.outputText,
                writingTask: g.writingTask,
                extraInstructions: g.extraInstructions || '',
            }),
        });
        const p = (await r.json()) as { error?: string; profileId?: string };
        if (!r.ok) throw new Error(p.error || 'Unable to save.');
        const next: VoiceSavedGeneration = { ...g, profileId: p.profileId || g.profileId, persisted: true };
        setCurrentVoiceGeneration(next);
        setGen(next);
        setSessionHistory(pushVoiceHistory(next));
        await reloadSaved();
    }, [reloadSaved]);

    useEffect(() => {
        if (!auth.authenticated || !gen || !getPendingVoiceSave()) return;
        startSaving(async () => {
            try { await persist(gen); setPendingVoiceSave(false); }
            catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); }
        });
    }, [auth.authenticated, gen, persist]);

    const history = useMemo(() => {
        const map = new Map<string, VoiceSavedGeneration>();
        sessionHistory.forEach((e) => map.set(e.id, e));
        savedHistory.forEach((e) => map.set(e.id, e));
        return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [savedHistory, sessionHistory]);

    const handleRefine = useCallback((instruction: string) => {
        if (!gen || !instruction.trim()) return;
        setError('');
        startTransition(async () => {
            try {
                const r = await fetch('/api/voice/refine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        voiceContext: gen.voiceContext,
                        previousOutput: gen.outputText,
                        refineInstruction: instruction,
                    }),
                });
                const p = (await r.json()) as VoiceResponsePayload & { error?: string; generationId?: string };
                if (!r.ok) throw new Error(p.error || 'Unable to refine.');
                const next: VoiceSavedGeneration = {
                    id: p.generationId || crypto.randomUUID(),
                    profileId: gen.profileId || null,
                    writingTask: gen.writingTask,
                    extraInstructions: gen.extraInstructions || null,
                    outputText: p.outputText,
                    preview: p.preview,
                    createdAt: p.createdAt,
                    persisted: false,
                    voiceInsights: p.voiceInsights,
                    insightBullets: p.insightBullets,
                    voiceContext: p.voiceContext,
                };
                setCurrentVoiceGeneration(next);
                setGen(next);
                setSessionHistory(pushVoiceHistory(next));
                setCustomRefine('');
            } catch (e) {
                setError(normalizeVoiceRequestError(e, 'Unable to refine.'));
            }
        });
    }, [gen]);

    const handleCopy = async () => {
        if (!gen) return;
        await navigator.clipboard.writeText(gen.outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
    };

    const handleDownload = () => {
        if (!gen) return;
        const blob = new Blob([gen.outputText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pryzmira-output.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSave = () => {
        if (!gen) return;
        if (!auth.authenticated) { setMlOpen(true); return; }
        setError('');
        startSaving(async () => {
            try { await persist(gen); setPendingVoiceSave(false); }
            catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); }
        });
    };

    const handleMagicLink = () => {
        setError(''); setMlMsg(''); setPendingVoiceSave(true);
        startSaving(async () => {
            try {
                const r = await fetch('/api/voice/auth/magic-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: mlEmail }),
                });
                const p = (await r.json()) as { error?: string };
                if (!r.ok) throw new Error(p.error || 'Unable to send link.');
                setMlMsg('Check your email for the magic link.');
            } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send link.'); }
        });
    };

    const handleSignOut = () => {
        startSaving(async () => {
            await fetch('/api/voice/auth/sign-out', { method: 'POST' });
            setAuth({ authenticated: false, user: null });
            setSavedHistory([]);
        });
    };

    const analysis = gen?.voiceContext?.analysis;

    // Empty state
    if (!gen) {
        return (
            <div className="page-container pb-20 pt-12 md:pt-20">
                <h1 className="text-2xl font-semibold tracking-tight">No generation yet</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Go to the home page and generate a voice draft first.
                </p>
                <Button asChild className="mt-6 gap-2" size="sm">
                    <Link href="/">
                        Voice intake
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <Dialog open={mlOpen} onOpenChange={setMlOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save voice profile</DialogTitle>
                        <DialogDescription>
                            Sign in with a magic link to save permanently.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ml-email">Email</Label>
                            <Input
                                id="ml-email"
                                type="email"
                                value={mlEmail}
                                onChange={(e) => setMlEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <Button onClick={handleMagicLink} disabled={isSaving} className="w-full" size="sm">
                            {isSaving ? 'Sending...' : 'Send magic link'}
                        </Button>
                        {mlMsg && <p className="text-xs text-muted-foreground">{mlMsg}</p>}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="wide-container pb-20 pt-6 md:pt-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Voice desk</span>
                            {auth.authenticated && (
                                <>
                                    <span className="text-border">/</span>
                                    <span>{auth.user?.email || 'Signed in'}</span>
                                </>
                            )}
                        </div>
                        <h1 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
                            {gen.writingTask}
                        </h1>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                            {copied ? <Check className="h-3 w-3 text-primary" /> : <ClipboardCopy className="h-3 w-3" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
                            <Download className="h-3 w-3" />
                            .txt
                        </Button>
                    </div>
                </div>

                {/* Voice analysis */}
                {analysis && (
                    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
                        {ANALYSIS_FIELDS.map(({ key, label }) => (
                            <div key={key} className="bg-card px-3 py-2.5">
                                <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-1 text-xs leading-snug text-foreground">
                                    {analysis[key] || '\u2014'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Insights toggle */}
                {gen.voiceInsights && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setInsightsOpen(!insightsOpen)}
                            aria-expanded={insightsOpen}
                            aria-controls="voice-insights-content"
                            className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Voice insights
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${insightsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {insightsOpen && (
                            <div id="voice-insights-content" className="rounded-b-md border border-t-0 border-border bg-card px-3 py-3">
                                <p className="text-sm leading-relaxed text-muted-foreground">{gen.voiceInsights}</p>
                                {gen.insightBullets.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {gen.insightBullets.map((b, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                                                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Output */}
                <div className="mt-6 rounded-md border border-border bg-card">
                    <div className="border-b border-border px-4 py-2">
                        <p className="text-xs font-medium text-muted-foreground">Output</p>
                    </div>
                    <div className="px-4 py-5">
                        <div className="whitespace-pre-wrap text-sm leading-[1.8] text-foreground">
                            {gen.outputText}
                        </div>
                    </div>
                </div>

                {/* Refine */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {QUICK_REFINE.map((action) => (
                        <button
                            key={action}
                            type="button"
                            onClick={() => handleRefine(action)}
                            disabled={isPending}
                            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                        >
                            {action.replace('.', '')}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleRefine('Regenerate the same task from scratch while keeping the same voice.')}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                    </button>
                </div>

                <div className="mt-2 flex gap-2">
                    <input
                        type="text"
                        value={customRefine}
                        onChange={(e) => setCustomRefine(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && customRefine.trim()) handleRefine(customRefine); }}
                        placeholder="Custom refine..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button
                        onClick={() => handleRefine(customRefine)}
                        disabled={isPending || !customRefine.trim()}
                        size="sm"
                    >
                        {isPending ? 'Refining...' : 'Apply'}
                    </Button>
                </div>

                {/* Actions row */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? 'Saving...' : 'Save profile'}
                    </Button>
                    {auth.authenticated && (
                        <Button variant="outline" onClick={handleSignOut} size="sm" className="gap-1.5">
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                        </Button>
                    )}
                    <Button variant="outline" asChild size="sm">
                        <Link href="/">New draft</Link>
                    </Button>
                    <span className="ml-auto text-xs text-muted-foreground/40">
                        $5/mo unlimited — coming soon
                    </span>
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => setHistoryOpen(!historyOpen)}
                            aria-expanded={historyOpen}
                            aria-controls="history-content"
                            className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            History ({history.length})
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {historyOpen && (
                            <div id="history-content" className="max-h-64 overflow-y-auto rounded-b-md border border-t-0 border-border">
                                {history.map((entry) => (
                                    <button
                                        key={entry.id}
                                        type="button"
                                        onClick={() => { setCurrentVoiceGeneration(entry); setGen(entry); }}
                                        className={`block w-full border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                                            entry.id === gen.id ? 'bg-accent' : ''
                                        }`}
                                    >
                                        <p className="text-xs font-medium text-foreground">{entry.writingTask}</p>
                                        <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                                            {entry.persisted ? 'saved' : 'session'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Banners */}
                {error && (
                    <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                        {error}
                    </div>
                )}
                {authStatus === 'success' && (
                    <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
                        Magic link accepted. Saving your profile now.
                    </div>
                )}
                {authStatus === 'error' && (
                    <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                        Magic link could not be verified. Request a new one.
                    </div>
                )}
            </div>
        </>
    );
}
