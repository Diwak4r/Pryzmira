'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    const [canTrigger, setCanTrigger] = useState(false);

    useEffect(() => {
        // Only allow triggering after 3 seconds and if mouse has moved down
        const timer = setTimeout(() => {
            const handleMouseMove = (e: MouseEvent) => {
                // Ensure user has moved mouse into the content area
                if (e.clientY > 100) {
                    setCanTrigger(true);
                    document.removeEventListener('mousemove', handleMouseMove);
                }
            };
            document.addEventListener('mousemove', handleMouseMove);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            // Trigger only if mouse leaves top, hasn't shown, can trigger, and document has focus
            if (e.clientY <= 0 && !hasShown && canTrigger && document.hasFocus()) {
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
    }, [hasShown, canTrigger]);

    return (
        <Dialog open={isVisible} onOpenChange={setIsVisible}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-accent/10 rounded-xl">
                            <Sparkles className="w-6 h-6 text-accent" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Wait! Don&apos;t miss out.</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Join <span className="text-foreground font-bold">10,000+ engineers</span> getting weekly AI insights and exclusive course previews.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                    {status === 'success' ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                            <p className="text-emerald-500 font-bold mb-1">Welcome aboard!</p>
                            <p className="text-sm text-emerald-500/80">Check your inbox for your first guide.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-6 text-lg"
                            >
                                {isLoading ? 'Joining...' : 'Get AI Insights Weekly'}
                            </Button>
                            {status === 'error' && (
                                <p className="text-xs text-destructive text-center">{message}</p>
                            )}
                        </form>
                    )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    No spam. Unsubscribe anytime.
                </p>
            </DialogContent>
        </Dialog>
    );
}
