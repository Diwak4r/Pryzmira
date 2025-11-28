'use client';

import { useState } from 'react';
import { Search, ExternalLink, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { aiTools } from '../data/mockData';

export default function AITools() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Hard'>('All');
    const [pricingFilter, setPricingFilter] = useState<'All' | 'Free' | 'Freemium' | 'Paid'>('All');

    const filteredTools = aiTools.filter((tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesFilter = filter === 'All' || tool.level === filter;
        const matchesPricing = pricingFilter === 'All' || tool.pricing === pricingFilter;
        return matchesSearch && matchesFilter && matchesPricing;
    });

    return (
        <div className="min-h-screen pb-20">
            <div className="relative py-20 mb-12 text-center overflow-hidden">
                <h1 className="text-5xl md:text-7xl font-black mb-6 text-text-primary tracking-tight">
                    AI Tools <span className="text-accent">Directory</span>
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                    Discover the best AI tools to supercharge your productivity and creativity.
                </p>
            </div>

            <div className="container mx-auto px-4 flex flex-col gap-10">
                <div className="flex flex-col gap-6 bg-surface/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg shadow-black/5">
                    {/* Search */}
                    <div className="relative max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tools or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-text-primary placeholder:text-text-secondary/50"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                                <Filter className="w-4 h-4" />
                                <span>Level</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {(['All', 'Beginner', 'Intermediate', 'Advanced', 'Hard'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border backdrop-blur-md ${filter === f
                                            ? 'bg-accent/90 text-white border-accent shadow-[0_0_15px_rgba(184,103,79,0.4)]'
                                            : 'bg-surface/30 text-text-secondary border-white/10 hover:bg-surface/50 hover:text-text-primary hover:border-white/20 hover:shadow-[0_0_10px_rgba(184,103,79,0.1)]'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                                <span className="font-bold">$</span>
                                <span>Pricing</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {(['All', 'Free', 'Freemium', 'Paid'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPricingFilter(p)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border backdrop-blur-md ${pricingFilter === p
                                            ? 'bg-accent/90 text-white border-accent shadow-[0_0_15px_rgba(184,103,79,0.4)]'
                                            : 'bg-surface/30 text-text-secondary border-white/10 hover:bg-surface/50 hover:text-text-primary hover:border-white/20 hover:shadow-[0_0_10px_rgba(184,103,79,0.1)]'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool) => (
                            <motion.div
                                layout
                                key={tool.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-surface backdrop-blur-md border border-border rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 flex flex-col h-full"
                            >
                                {/* Tool Image */}
                                <div className="h-48 overflow-hidden relative">
                                    <Image
                                        src={tool.image}
                                        alt={tool.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10">
                                            {tool.pricing}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/90 text-white px-2 py-1 rounded shadow-sm">
                                            {tool.level}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors leading-tight">
                                            {tool.name}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-grow leading-relaxed">
                                        {tool.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {tool.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="text-[10px] font-bold text-text-secondary bg-surface-hover border border-white/5 px-2 py-1 rounded group-hover:border-accent/20 group-hover:text-accent/80 transition-colors">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-auto w-full py-2.5 rounded-lg bg-surface-hover text-text-primary text-xs font-bold uppercase tracking-wide hover:bg-accent hover:text-white transition-all duration-300 border border-white/5 hover:border-accent/20 flex items-center justify-center gap-2"
                                    >
                                        Visit Tool <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
