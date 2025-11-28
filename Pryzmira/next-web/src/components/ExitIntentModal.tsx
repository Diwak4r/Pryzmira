'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export default function ExitIntentModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('idle');
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

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
            setMessage('Welcome aboard!');
            setEmail('');

            // Auto close after success
            setTimeout(() => setIsVisible(false), 3000);
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY < 10 && !hasShown) {
                const alreadyShown = sessionStorage.getItem('exitIntentShown');
                if (!alreadyShown) {
                    setIsVisible(true);
                    setHasShown(true);
                    sessionStorage.setItem('exitIntentShown', 'true');
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [hasShown]);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsVisible(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-surface border border-border rounded-t-2xl md:rounded-2xl shadow-2xl z-[101] overflow-hidden"
                    >
                        <div className="p-8 relative">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary">Wait! Don&apos;t miss out.</h3>
                            </div>

                            <p className="text-text-secondary mb-6 leading-relaxed">
                                Join <span className="text-primary font-bold">10,000+ engineers</span> getting weekly AI insights and exclusive course previews.
                            </p>

                            <div className="flex flex-col gap-3">
                                {status === 'success' ? (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                        <p className="text-emerald-500 font-bold mb-1">Welcome aboard!</p>
                                        <p className="text-sm text-emerald-500/80">Check your inbox for your first guide.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? 'Joining...' : 'Get AI Insights Weekly'}
                                        </button>
                                        {status === 'error' && (
                                            <p className="text-xs text-red-500 text-center">{message}</p>
                                        )}
                                    </form>
                                )}
                            </div>

                            <p className="text-xs text-text-secondary text-center mt-4">
                                No spam. Unsubscribe anytime.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
