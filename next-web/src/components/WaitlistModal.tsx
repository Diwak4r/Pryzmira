'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface WaitlistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referralCode?: string;
}

interface WaitlistResponse {
    position: number;
    referralCode: string;
    referralUrl: string;
}

export function WaitlistModal({ open, onOpenChange, referralCode }: WaitlistModalProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<WaitlistResponse | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/waitlist/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    name: name.trim() || undefined,
                    referredBy: referralCode || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join waitlist');
            }

            setSuccess(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async () => {
        if (!success) return;

        try {
            await navigator.clipboard.writeText(success.referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setEmail('');
            setName('');
            setError('');
            setSuccess(null);
            setCopied(false);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Join Pryzmira Pro Waitlist</DialogTitle>
                            <DialogDescription className="text-base">
                                Get early access to Pro features: weekly strategy briefs, priority tool
                                access, and advanced workspace automation.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label htmlFor="waitlist-email" className="control-label">
                                    Email address
                                </label>
                                <Input
                                    id="waitlist-email"
                                    type="email"
                                    placeholder="name@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="waitlist-name" className="control-label">
                                    Name (optional)
                                </label>
                                <Input
                                    id="waitlist-name"
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="h-11 w-full"
                                disabled={isSubmitting || !email}
                            >
                                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Check className="h-8 w-8 text-primary" />
                            </div>
                            <DialogTitle className="text-center text-2xl">
                                You&apos;re on the list!
                            </DialogTitle>
                            <DialogDescription className="text-center text-base">
                                You&apos;re #{success.position} in line for Pryzmira Pro
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-4">
                            <div className="rounded-lg bg-muted/50 p-6 text-center">
                                <p className="mb-2 text-sm font-medium text-muted-foreground">
                                    Your Position
                                </p>
                                <p className="text-5xl font-bold text-primary">#{success.position}</p>
                            </div>

                            <div className="space-y-3 rounded-lg border border-border bg-background/50 p-4">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                        ↑
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Move up faster
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Share your link. Each signup moves you up 1 spot.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Your referral link
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            value={success.referralUrl}
                                            readOnly
                                            className="h-10 font-mono text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 shrink-0"
                                            onClick={handleCopy}
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleClose} className="h-11 w-full" variant="outline">
                                Close
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
