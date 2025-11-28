'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface RippleButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    className?: string;
}

export default function RippleButton({ children, className = "", onClick, ...props }: RippleButtonProps) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);

        if (onClick) onClick(e);
    };

    return (
        <motion.button
            className={`relative overflow-hidden ${className}`}
            onClick={handleClick}
            {...props}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute bg-[#B8674F] rounded-full opacity-30 animate-ripple pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        transform: 'translate(-50%, -50%)',
                        width: '200%',
                        paddingBottom: '200%',
                    }}
                />
            ))}
        </motion.button>
    );
}
