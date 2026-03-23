'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, Filter, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiTools } from '../data/mockData';
import ToolCard from '../components/ToolCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface TavilyResult {
    title: string;
    url: string;
    snippet: string;
}

export default function AITools() {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [pricingFilter, setPricingFilter] = useState<'All' | 'Free' | 'Freemium' | 'Paid'>('All');

    // Tavily live search state
    const [liveResults, setLiveResults] = useState<TavilyResult[]>([]);
    const [liveAnswer, setLiveAnswer] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Dynamically derive categories from actual data
    const categories = ['All', ...Array.from(new Set(aiTools.map(t => t.category))).sort()];

    const filteredTools = aiTools.filter((tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
        const matchesPricing = pricingFilter === 'All' || tool.pricing === pricingFilter;
        return matchesSearch && matchesCategory && matchesPricing;
    });

    const searchLive = useCallback(async (query: string) => {
        if (query.length < 3) {
            setLiveResults([]);
            setLiveAnswer('');
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setLiveResults(data.results || []);
                setLiveAnswer(data.answer || '');
                setHasSearched(true);
            } else if (res.status === 503) {
                // Tavily not configured — silently skip
                setHasSearched(false);
            }
        } catch {
            // Network error — silently skip
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearch = (value: string) => {
        setSearch(value);
        // Debounce live search (800ms)
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchLive(value), 800);
    };

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
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-12"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                        )}
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

                {/* Live Web Results (from Tavily) */}
                {hasSearched && liveResults.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            <span>Live Web Results</span>
                        </div>

                        {liveAnswer && (
                            <Card className="p-4 bg-primary/5 border-primary/20">
                                <p className="text-sm text-foreground leading-relaxed">{liveAnswer}</p>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {liveResults.slice(0, 6).map((result, i) => (
                                <a
                                    key={i}
                                    href={result.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group"
                                >
                                    <Card className="p-4 h-full hover:border-primary/50 transition-colors">
                                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                                            {result.title}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
                                    </Card>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Curated Tools Grid */}
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

                {filteredTools.length === 0 && !isSearching && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">No tools match your search.</p>
                        <p className="text-muted-foreground text-sm mt-2">Try different keywords or clear your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
