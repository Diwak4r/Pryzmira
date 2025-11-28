'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

        // Simulate API call
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
            setMessage('Thanks for subscribing! Check your inbox soon.');
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
        <section className="py-20 relative overflow-hidden border-t border-border">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">Stay Ahead of the Curve</h2>
                    <p className="text-text-secondary mb-8 text-lg">
                        Join 10,000+ learners getting weekly insights on AI, Tech, and Finance.
                        No spam, just value.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative">
                        <div className="flex-grow relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (status === 'error') setStatus('idle');
                                }}
                                className={`w-full bg-surface border border-border px-6 py-4 rounded-xl outline-none transition-all placeholder:text-text-secondary text-text-primary ${status === 'error' ? 'border-red-500 focus:border-red-500' : 'focus:border-text-primary'
                                    }`}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-4 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                            {!isLoading && <Send className="w-4 h-4" />}
                        </button>
                    </form>

                    <AnimatePresence mode="wait">
                        {status !== 'idle' && (
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${status === 'success' ? 'text-emerald-500' : 'text-red-500'
                                    }`}
                            >
                                {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
