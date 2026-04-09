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
import VoiceThinkingIndicator from '@/components/VoiceThinkingIndicator';
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
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [authOpen, setAuthOpen] = useState(false);
    const [authError, setAuthError] = useState('');
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
        setPendingVoiceSave(false);
        startSaving(async () => {
            try { await persist(gen); }
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
        if (!auth.authenticated) { setAuthOpen(true); return; }
        setError('');
        startSaving(async () => {
            try { await persist(gen); }
            catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); }
        });
    };

    const handlePasswordAuth = () => {
        setAuthError('');
        setPendingVoiceSave(true);
        startSaving(async () => {
            try {
                const r = await fetch('/api/voice/auth/sign-in', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authEmail, password: authPassword, mode: authMode }),
                });
                const p = (await r.json()) as { error?: string; user?: { id: string; email: string } };
                if (!r.ok) throw new Error(p.error || 'Authentication failed.');
                setAuth({ authenticated: true, user: p.user || null });
                setAuthOpen(false);
                setAuthEmail('');
                setAuthPassword('');
                setAuthError('');
            } catch (e) { setAuthError(e instanceof Error ? e.message : 'Authentication failed.'); }
        });
    };

    const handleGoogleSignIn = async () => {
        try {
            setPendingVoiceSave(true);
            const r = await fetch('/api/voice/auth/oauth-start');
            const p = (await r.json()) as { url?: string; error?: string };
            if (!r.ok || !p.url) throw new Error(p.error || 'Unable to start Google sign-in.');
            window.location.href = p.url;
        } catch (e) { setAuthError(e instanceof Error ? e.message : 'Unable to start Google sign-in.'); }
    };

    const handleSignOut = () => {
        startSaving(async () => {
            await fetch('/api/voice/auth/sign-out', { method: 'POST' });
            setAuth({ authenticated: false, user: null });
            setSavedHistory([]);
        });
    };

    const analysis = gen?.voiceContext?.analysis;

    const renderAuthDialog = () => (
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {authMode === 'signin' ? 'Sign in' : 'Create account'}
                    </DialogTitle>
                    <DialogDescription>
                        {authMode === 'signin'
                            ? 'Sign in to save your voice profile permanently.'
                            : 'Create an account to save your voice profile.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="auth-email">Email</Label>
                        <Input
                            id="auth-email"
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="auth-password">Password</Label>
                        <Input
                            id="auth-password"
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            onKeyDown={(e) => { if (e.key === 'Enter' && authEmail && authPassword.length >= 8) handlePasswordAuth(); }}
                        />
                    </div>
                    <Button
                        onClick={handlePasswordAuth}
                        disabled={isSaving || !authEmail || authPassword.length < 8}
                        className="w-full"
                        size="sm"
                    >
                        {isSaving
                            ? 'Please wait...'
                            : authMode === 'signin'
                                ? 'Sign in'
                                : 'Create account'}
                    </Button>
                    {authError && (
                        <p className="text-xs text-destructive">{authError}</p>
                    )}
                    <p className="text-center text-xs text-muted-foreground">
                        {authMode === 'signin' ? (
                            <>
                                New here?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                                    className="font-medium text-foreground hover:underline"
                                >
                                    Create account
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                                    className="font-medium text-foreground hover:underline"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );

    // Empty state
    if (!gen) {
        return (
            <>
                {renderAuthDialog()}
                <div className="page-container pb-20 pt-12 md:pt-20">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight">Your voice desk</h1>
                        {auth.authenticated && (
                            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs">
                                <LogOut className="h-3.5 w-3.5" />
                                Sign out
                            </Button>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {auth.authenticated
                            ? `Signed in as ${auth.user?.email}. Your history is below.`
                            : `Once you generate a draft from the home page, it'll appear here. You can refine it, copy it, save it, or start over.`}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Button asChild className="gap-2" size="sm">
                            <Link href="/">
                                Start writing
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        {!auth.authenticated && (
                            <Button variant="outline" onClick={() => setAuthOpen(true)} size="sm">
                                Sign in
                            </Button>
                        )}
                    </div>

                    {/* Show History in empty state if they have any saved items */}
                    {auth.authenticated && history.length > 0 && (
                        <div className="mt-12">
                            <h2 className="mb-4 text-sm font-medium text-foreground">Saved History ({history.length})</h2>
                            <div className="overflow-hidden rounded-md border border-border bg-card">
                                {history.map((entry) => (
                                    <button
                                        key={entry.id}
                                        type="button"
                                        onClick={() => { setCurrentVoiceGeneration(entry); setGen(entry); }}
                                        className="block w-full border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-accent"
                                    >
                                        <p className="text-sm font-medium text-foreground">{entry.writingTask}</p>
                                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{entry.outputText}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {authStatus === 'success' && (
                        <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
                            Signed in successfully.
                        </div>
                    )}
                    {authStatus === 'error' && (
                        <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                            Sign-in could not be completed. Please try again.
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            {renderAuthDialog()}

            <div className="wide-container pb-20 pt-6 md:pt-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Voice desk</span>
                            {auth.authenticated && (
                                <>
                                    <span className="text-border">/</span>
                                    <span>{auth.user?.email || 'Signed in'}</span>
                                </>
                            )}
                        </div>
                        <h1 className="mt-1 break-words text-xl font-semibold tracking-tight md:text-2xl">
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
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
                        {ANALYSIS_FIELDS.map(({ key, label }) => (
                            <div key={key} className="bg-card px-3 py-2.5">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-1 break-words text-xs leading-snug text-foreground">
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
                            className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            Voice insights
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${insightsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {insightsOpen && (
                            <div className="rounded-b-md border border-t-0 border-border bg-card px-3 py-3">
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
                {isPending && <VoiceThinkingIndicator mode="refine" className="mt-6" />}

                <div className={`${isPending ? 'mt-4' : 'mt-6'} rounded-md border border-border bg-card`}>
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
                            className="rounded-md border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground disabled:opacity-40"
                        >
                            {action.replace('.', '')}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleRefine('Regenerate the same task from scratch while keeping the same voice.')}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground disabled:opacity-40"
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
                        className="min-h-[44px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
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
                    <span className="w-full text-center mt-2 text-xs sm:w-auto sm:text-left sm:ml-auto sm:mt-0 text-muted-foreground/40">
                        $5/mo unlimited - coming soon
                    </span>
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => setHistoryOpen(!historyOpen)}
                            aria-expanded={historyOpen}
                            className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            History ({history.length})
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {historyOpen && (
                            <div className="max-h-64 overflow-y-auto rounded-b-md border border-t-0 border-border">
                                {history.map((entry) => (
                                    <button
                                        key={entry.id}
                                        type="button"
                                        onClick={() => { setCurrentVoiceGeneration(entry); setGen(entry); }}
                                        className={`block w-full border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-accent ${
                                            entry.id === gen.id ? 'bg-accent' : ''
                                        }`}
                                    >
                                        <p className="text-xs font-medium text-foreground">{entry.writingTask}</p>
                                        <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground">
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
                    <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                        <span className="flex-1">{error}</span>
                        <button type="button" onClick={() => setError('')} className="shrink-0 text-destructive/60 hover:text-destructive" aria-label="Dismiss">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                )}
                {authStatus === 'success' && (
                    <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
                        Signed in successfully. Saving your profile now.
                    </div>
                )}
                {authStatus === 'error' && (
                    <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                        Sign-in could not be completed. Please try again.
                    </div>
                )}
            </div>
        </>
    );
}
