'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface BuilderCounterProps {
    className?: string;
}

export function BuilderCounter({ className = '' }: BuilderCounterProps) {
    const [count, setCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const motionCount = useMotionValue(0);
    const rounded = useTransform(motionCount, (latest) => Math.round(latest));

    useEffect(() => {
        let isCancelled = false;

        const fetchCount = async () => {
            try {
                const response = await fetch('/api/platform/stats', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const data = await response.json();
                if (!isCancelled && typeof data.buildersThisWeek === 'number') {
                    setCount(data.buildersThisWeek);
                    setIsLoading(false);
                }
            } catch (error) {
                if (!isCancelled) {
                    setCount(0);
                    setIsLoading(false);
                }
            }
        };

        void fetchCount();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (count !== null) {
            const controls = animate(motionCount, count, {
                duration: 1.2,
                ease: 'easeOut',
            });

            return controls.stop;
        }
    }, [count, motionCount]);

    if (isLoading) {
        return (
            <div className={`inline-flex items-baseline gap-2 ${className}`}>
                <div className="h-8 w-12 animate-pulse rounded bg-muted/40" />
                <p className="text-sm leading-7 text-muted-foreground">
                    builders started their AI strategy this week
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-baseline gap-2 ${className}`}
        >
            <motion.span className="mono-value text-3xl font-semibold text-primary md:text-4xl">
                {rounded}
            </motion.span>
            <p className="text-sm leading-7 text-muted-foreground">
                builders started their AI strategy this week
            </p>
        </motion.div>
    );
}
