'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            setStatus('error');
            setMessage('Enter an email address to receive the weekly workspace brief.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
            setMessage('You are in. Expect one sharp workspace brief each week.');
            setEmail('');
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
        <section className="border-t border-border/70 py-20">
            <div className="page-shell">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-120px' }}
                    transition={{ duration: 0.5 }}
                    className="paper-panel poster-shadow grid gap-10 rounded-[2rem] px-6 py-8 md:grid-cols-[1.25fr_1fr] md:px-10 md:py-10"
                >
                    <div className="space-y-5">
                        <p className="section-kicker">Weekly workspace brief</p>
                        <h2 className="max-w-2xl text-4xl text-display text-balance md:text-6xl">
                            One clear AI brief each week, built to keep people moving.
                        </h2>
                        <p className="max-w-xl text-base leading-8 text-muted-foreground">
                            Pryzmira sends a compact operator note with sharper next steps, useful AI
                            tools, and learning depth worth reopening.
                        </p>
                    </div>

                    <div className="space-y-5 rounded-[1.6rem] border border-border bg-background/70 p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Join the list
                            </p>
                            <div className="ink-rule" />
                        </div>

                        {status === 'success' ? (
                            <div className="space-y-3 rounded-[1.4rem] bg-primary/8 p-5 text-primary">
                                <CheckCircle2 className="h-6 w-6" />
                                <p className="text-lg font-semibold">{message}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="name@email.com"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        if (status === 'error') {
                                            setStatus('idle');
                                        }
                                    }}
                                    className="h-12 rounded-full border-border bg-card px-5"
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-full text-sm font-semibold"
                                >
                                    {isLoading ? 'Joining...' : 'Get the weekly brief'}
                                    {!isLoading && <ArrowUpRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </form>
                        )}

                        <AnimatePresence mode="wait">
                            {status === 'error' && (
                                <motion.div
                                    key="newsletter-error"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="flex items-center gap-2 text-sm text-destructive"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <p className="text-sm leading-6 text-muted-foreground">
                            Less noise, better direction, and a cadence people can actually keep.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
