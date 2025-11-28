'use client';

import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface TipItem {
    id: number;
    title: string;
    category: string;
    content: string;
    link: string;
    tags: string[];
}

export default function TipCard({ item, index }: { item: TipItem; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface p-5 flex flex-col h-full border border-border hover:border-text-secondary transition-colors rounded-xl"
        >
            <div className="flex items-center gap-2 mb-3 text-text-primary">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{item.category}</span>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>

            <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-grow">
                {item.content}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <div className="flex gap-2">
                    {item.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs text-text-secondary">#{tag}</span>
                    ))}
                </div>
                <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-surface-hover hover:bg-border text-text-primary transition-colors border border-border"
                >
                    <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </motion.div>
    );
}
