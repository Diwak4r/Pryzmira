'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const shellEase = [0.22, 1, 0.36, 1] as const;

export default function ExitIntentModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const [canTrigger, setCanTrigger] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const handleMouseMove = (event: MouseEvent) => {
                if (event.clientY > 100) {
                    setCanTrigger(true);
                    document.removeEventListener('mousemove', handleMouseMove);
                }
            };

            document.addEventListener('mousemove', handleMouseMove);
        }, 3000);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleMouseLeave = (event: MouseEvent) => {
            if (event.clientY > 0 || hasShown || !canTrigger || !document.hasFocus()) {
                return;
            }

            const alreadyShown = sessionStorage.getItem('exitIntentShown');
            if (alreadyShown) {
                return;
            }

            setIsVisible(true);
            setHasShown(true);
            sessionStorage.setItem('exitIntentShown', 'true');
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [canTrigger, hasShown]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('error');
            setMessage('Use a valid email address.');
            return;
        }

        setIsLoading(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || 'Subscription failed');
            }

            setStatus('success');
            setMessage('The weekly note is on its way.');
            setEmail('');
            window.setTimeout(() => setIsVisible(false), 2200);
        } catch (error) {
            setStatus('error');
            setMessage(
                error instanceof Error ? error.message : 'Subscription failed. Try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isVisible} onOpenChange={setIsVisible}>
            <DialogContent className="shell-surface overflow-hidden rounded-[1.5rem] border-border bg-background/96 p-0 sm:max-w-[560px]">
                <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
                    <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-accent/35 via-background/92 to-background/84 p-6 md:border-b-0 md:border-r md:p-8">
                        <div className="ambient-orb ambient-orb-primary absolute -left-10 top-0 h-36 w-36 opacity-80" />
                        <div className="ambient-orb ambient-orb-secondary absolute bottom-[-2rem] right-[-1rem] h-32 w-32 opacity-70" />

                        <div className="relative flex h-full flex-col justify-between gap-8">
                            <div className="space-y-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/16 bg-primary/10 text-primary shadow-[0_10px_30px_hsl(var(--primary)/0.16)]">
                                    <Sparkles className="h-5 w-5" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                        Before you go
                                    </p>
                                    <h2 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-foreground md:text-[2rem]">
                                        Get the weekly note.
                                    </h2>
                                    <p className="text-sm leading-7 text-muted-foreground">
                                        One concise email with standout tools, courses, and
                                        references worth keeping.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                                <span className="rounded-full border border-border/70 bg-background/72 px-3 py-1.5">
                                    Weekly
                                </span>
                                <span className="rounded-full border border-border/70 bg-background/72 px-3 py-1.5">
                                    No spam
                                </span>
                                <span className="rounded-full border border-border/70 bg-background/72 px-3 py-1.5">
                                    Unsubscribe anytime
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <DialogHeader className="text-left">
                            <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                                Stay in the loop
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-7 text-muted-foreground">
                                Keep Pryzmira close and come back to sharper curation each week.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6">
                            <AnimatePresence initial={false} mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                                        transition={
                                            shouldReduceMotion
                                                ? { duration: 0 }
                                                : { duration: 0.24, ease: shellEase }
                                        }
                                        className="rounded-[1.25rem] border border-primary/15 bg-primary/10 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground">
                                                    You are in.
                                                </p>
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmit}
                                        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                                        transition={
                                            shouldReduceMotion
                                                ? { duration: 0 }
                                                : { duration: 0.24, ease: shellEase }
                                        }
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="exit-intent-email"
                                                className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
                                            >
                                                Email address
                                            </label>
                                            <Input
                                                id="exit-intent-email"
                                                type="email"
                                                placeholder="name@email.com"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                disabled={isLoading}
                                                className="h-12 rounded-full border-border bg-background/80 px-5 shadow-[inset_0_1px_0_hsl(var(--background)/0.9)]"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full rounded-full border border-primary/20 bg-primary text-primary-foreground shadow-[0_12px_30px_hsl(var(--primary)/0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_hsl(var(--primary)/0.28)]"
                                        >
                                            {isLoading ? 'Joining...' : 'Get the weekly note'}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <AnimatePresence initial={false}>
                                {status === 'error' ? (
                                    <motion.p
                                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                                        transition={
                                            shouldReduceMotion
                                                ? { duration: 0 }
                                                : { duration: 0.18, ease: shellEase }
                                        }
                                        className="pt-3 text-sm text-destructive"
                                        aria-live="polite"
                                    >
                                        {message}
                                    </motion.p>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
