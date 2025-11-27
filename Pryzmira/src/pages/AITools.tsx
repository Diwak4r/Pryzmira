import { useState } from 'react';
import { Search, ExternalLink, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
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
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

                <h1 className="text-5xl md:text-7xl font-black mb-6 text-text-primary tracking-tight">
                    AI Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-400">Directory</span>
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
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${filter === f
                                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                                            : 'bg-surface/50 text-text-secondary border-white/5 hover:bg-surface hover:text-text-primary hover:border-white/10'
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
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${pricingFilter === p
                                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                                            : 'bg-surface/50 text-text-secondary border-white/5 hover:bg-surface hover:text-text-primary hover:border-white/10'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 flex flex-col h-full"
                        >
                            {/* Tool Image */}
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={tool.image}
                                    alt={tool.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent opacity-90" />
                                <div className="absolute bottom-3 left-3 flex gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 text-black px-2 py-0.5 rounded shadow-sm">
                                        {tool.pricing}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/10">
                                        {tool.level}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors leading-tight">
                                        {tool.name}
                                    </h3>
                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 rounded-lg bg-surface/50 text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors border border-white/5"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>

                                <p className="text-sm text-text-secondary mb-6 line-clamp-2 flex-grow leading-relaxed">
                                    {tool.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                                    {tool.tags.map((tag) => (
                                        <span key={tag} className="text-xs font-bold text-text-secondary bg-surface/50 border border-white/5 px-2.5 py-1 rounded-md group-hover:border-accent/20 group-hover:text-accent/80 transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
