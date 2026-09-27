'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LinkPreview } from '@/lib/types';

type Step = 'idle' | 'fetching' | 'preview' | 'submitting' | 'done';

export default function SubmitForm() {
    const [url, setUrl] = useState('');
    const [note, setNote] = useState('');
    const [preview, setPreview] = useState<LinkPreview | null>(null);
    const [step, setStep] = useState<Step>('idle');
    const [error, setError] = useState<string | null>(null);
    const [resultNote, setResultNote] = useState<string | null>(null);

    async function handleFetchPreview() {
        setError(null);
        setStep('fetching');
        try {
            const res = await fetch('/api/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Could not fetch a preview.');
            setPreview(json.preview);
            setStep('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
            setStep('idle');
        }
    }

    async function handleSubmit() {
        setError(null);
        setStep('submitting');
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, note, preview, honeypot: '' }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Could not submit that link.');
            setResultNote(json.note || null);
            setStep('done');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
            setStep('preview');
        }
    }

    if (step === 'done') {
        return (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-sm font-medium">Thanks — sent to the review queue.</p>
                {resultNote && <p className="mt-2 text-xs text-muted-foreground">{resultNote}</p>}
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                        setUrl('');
                        setNote('');
                        setPreview(null);
                        setResultNote(null);
                        setStep('idle');
                    }}
                >
                    Submit another
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <Label htmlFor="url">Link to the post, video, or repo</Label>
                <div className="mt-1.5 flex gap-2">
                    <Input
                        id="url"
                        placeholder="https://x.com/... or reddit.com/... or youtube.com/..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setPreview(null);
                            setStep('idle');
                        }}
                    />
                    <Button onClick={handleFetchPreview} disabled={!url || step === 'fetching'}>
                        {step === 'fetching' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                    </Button>
                </div>
                {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
            </div>

            {preview && (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Detected: {preview.platform} · {preview.mediaKind}
                        </p>
                        <p className="mt-1 text-sm font-medium">{preview.title}</p>
                        {preview.creatorHandle && (
                            <p className="text-xs text-muted-foreground">by {preview.creatorHandle}</p>
                        )}
                    </div>

                    {preview.promptText && (
                        <div className="rounded-md bg-muted p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Prompt found
                            </p>
                            <p className="mt-1 font-mono text-xs">{preview.promptText}</p>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="note">Anything else worth knowing? (optional)</Label>
                        <Input
                            id="note"
                            className="mt-1.5"
                            placeholder="e.g. this is the first working demo I've seen"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={280}
                        />
                    </div>

                    <Button onClick={handleSubmit} disabled={step === 'submitting'} className="w-full">
                        {step === 'submitting' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Submit for review <Send className="h-3.5 w-3.5" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
