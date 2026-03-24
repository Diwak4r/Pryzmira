'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setStatus('error');
            setMessage('Please enter your email address.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('idle');
        setIsLoading(true);

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }

            setStatus('success');
            setMessage('Welcome aboard! Check your inbox soon.');
            setEmail('');
        } catch (error) {
            setStatus('error');
            const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe. Please try again.';
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative overflow-hidden py-24">
            {/* Gradient mesh background */}
            <div className="absolute inset-0 bg-gradient-subtle" />
            <div className="floating-orb floating-orb-cyan w-80 h-80 -top-40 left-10 opacity-10" />
            <div className="floating-orb floating-orb-violet w-96 h-96 -bottom-40 right-10 opacity-10" />

            {/* Top gradient line */}
            <div className="gradient-line absolute top-0 left-0 right-0" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm text-sm font-medium text-muted-foreground mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            Free weekly newsletter
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="text-foreground">Stay Ahead of </span>
                            <span className="text-gradient">the Curve</span>
                        </h2>
                        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                            Join engineers and tech enthusiasts getting weekly insights on AI tools, learning resources, and industry trends. No spam, just value.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        {status === 'success' ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm max-w-md mx-auto"
                            >
                                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                <p className="text-emerald-400 font-bold text-lg">You&apos;re in!</p>
                                <p className="text-emerald-400/70 text-sm mt-1">Check your inbox for a welcome email.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <div className="flex-grow relative">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (status === 'error') setStatus('idle');
                                        }}
                                        className={`w-full h-12 bg-background/80 backdrop-blur-sm ${status === 'error' ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
                                        suppressHydrationWarning
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-12 px-6 bg-gradient-brand hover:opacity-90 transition-opacity text-white border-0"
                                >
                                    {isLoading ? 'Joining...' : 'Subscribe'}
                                    {!isLoading && <Send className="w-4 h-4 ml-2" />}
                                </Button>
                            </form>
                        )}

                        <AnimatePresence mode="wait">
                            {status === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-destructive"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <p className="text-xs text-muted-foreground/60 mt-4">
                            No spam. Unsubscribe anytime. We respect your inbox.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
