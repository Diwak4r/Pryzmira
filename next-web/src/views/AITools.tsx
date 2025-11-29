'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiTools } from '../data/mockData';
import ToolCard from '../components/ToolCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AITools() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [pricingFilter, setPricingFilter] = useState<'All' | 'Free' | 'Freemium' | 'Paid'>('All');

    const categories = ['All', 'Chatbot', 'Search', 'Image Gen', 'Video', 'Coding', 'Design', 'Productivity', 'Audio'];

    const filteredTools = aiTools.filter((tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
        const matchesPricing = pricingFilter === 'All' || tool.pricing === pricingFilter;
        return matchesSearch && matchesCategory && matchesPricing;
    });

    return (
        <div className="min-h-screen pb-20 pt-24 bg-background text-foreground">
            <div className="relative py-12 mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
                    AI Tools Directory
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Discover the best AI tools to supercharge your productivity.
                </p>
            </div>

            <div className="container mx-auto px-4 flex flex-col gap-10">
                <div className="flex flex-col gap-6 bg-card border border-border p-6 rounded-lg shadow-sm">
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search tools or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Filter className="w-4 h-4" />
                                <span>Category</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {categories.map((c) => (
                                    <Button
                                        key={c}
                                        variant={categoryFilter === c ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCategoryFilter(c)}
                                        className="whitespace-nowrap"
                                    >
                                        {c}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <span className="font-bold">$</span>
                                <span>Pricing</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                {(['All', 'Free', 'Freemium', 'Paid'] as const).map((p) => (
                                    <Button
                                        key={p}
                                        variant={pricingFilter === p ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPricingFilter(p)}
                                        className="whitespace-nowrap"
                                    >
                                        {p}
                                    </Button>
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
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
