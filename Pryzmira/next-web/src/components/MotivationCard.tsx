'use client';

import { motion } from 'framer-motion';
import { Play, FileText, Clock, ExternalLink, Mic } from 'lucide-react';

interface MotivationItem {
    id: number;
    title: string;
    person: string;
    category: string;
    url: string;
    type: string;
    duration: string;
    key_points: string[];
    tags: string[];
}

export default function MotivationCard({ item, index }: { item: MotivationItem; index: number }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'Talk': return <Play className="w-4 h-4" />;
            case 'Essay': return <FileText className="w-4 h-4" />;
            case 'Podcast': return <Mic className="w-4 h-4" />;
            default: return <ExternalLink className="w-4 h-4" />;
        }
    };

    return (
        <motion.a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-surface border border-border rounded-xl p-5 flex flex-col h-full group hover:border-text-secondary transition-all relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 rounded text-xs font-medium bg-surface-hover text-text-secondary border border-border">
                    {item.category}
                </span>
                <div className="p-2 rounded-full bg-surface-hover text-text-primary border border-border">
                    {getIcon(item.type)}
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-text-primary transition-colors line-clamp-2">
                {item.title}
            </h3>
            <p className="text-sm text-text-secondary mb-4">{item.person}</p>

            <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                <Clock className="w-3 h-3" />
                <span>{item.duration}</span>
            </div>

            <div className="mt-auto space-y-2">
                {item.key_points.slice(0, 2).map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-text-primary mt-1.5 shrink-0" />
                        <span>{point}</span>
                    </div>
                ))}
            </div>
        </motion.a>
    );
}
