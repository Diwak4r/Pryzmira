import { useState } from 'react';
import { Youtube, ExternalLink, BookOpen, GraduationCap, Map, Search, Lightbulb, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resources } from '../data/mockData';
import motivationData from '../data/motivation.json';
import tipsData from '../data/tips.json';
import MotivationCard from '../components/MotivationCard';
import TipCard from '../components/TipCard';

export default function Resources() {
    const activeTabState = useState<'Resources' | 'Motivation' | 'Tips'>('Resources');
    const activeTab = activeTabState[0];
    const setActiveTab = activeTabState[1];
    const [search, setSearch] = useState('');

    // Resources Logic
    const getIcon = (type: string) => {
        switch (type) {
            case 'YouTube Channel': return <Youtube className="w-6 h-6" />;
            case 'Course': return <GraduationCap className="w-6 h-6" />;
            case 'Guide': return <Map className="w-6 h-6" />;
            case 'Platform': return <BookOpen className="w-6 h-6" />;
            default: return <ExternalLink className="w-6 h-6" />;
        }
    };

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.type.toLowerCase().includes(search.toLowerCase())
    );

    const filteredMotivation = motivationData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.person.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    const filteredTips = tipsData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen pb-20">
            <div className="relative py-20 mb-12 text-center overflow-hidden">
                <h1 className="text-5xl md:text-7xl font-black mb-6 text-text-primary tracking-tight">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-400">Vault</span>
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
                    Curated learning paths, legendary channels, and essential guides to master your craft.
                </p>
            </div>

            <div className="container mx-auto px-4 flex flex-col gap-10">
                {/* Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 sticky top-24 z-30 bg-surface/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-lg shadow-black/5">
                    {/* Tabs */}
                    <div className="flex p-1 rounded-xl bg-surface/50 border border-white/5">
                        {(['Resources', 'Motivation', 'Tips'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                                    }`}
                            >
                                {tab === 'Resources' && <BookOpen className="w-4 h-4" />}
                                {tab === 'Motivation' && <Quote className="w-4 h-4" />}
                                {tab === 'Tips' && <Lightbulb className="w-4 h-4" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 focus:bg-surface transition-all placeholder:text-text-secondary/50"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'Resources' && (
                        <motion.div
                            key="resources"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredResources.map((resource, index) => (
                                <motion.div
                                    key={resource.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="p-3.5 rounded-xl bg-surface/50 text-accent border border-white/10 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-lg shadow-accent/10">
                                            {getIcon(resource.type)}
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface/50 text-text-secondary border border-white/5 group-hover:border-accent/20 transition-colors">
                                            {resource.type}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors leading-tight">
                                        {resource.title}
                                    </h3>

                                    <p className="text-sm text-text-secondary mb-8 line-clamp-3 leading-relaxed flex-grow">
                                        {resource.description}
                                    </p>

                                    <a
                                        href={resource.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center w-full gap-2 py-3 rounded-xl bg-surface/50 text-text-primary text-sm font-bold hover:bg-accent hover:text-white transition-all duration-300 border border-white/5 hover:border-accent/20 group-hover:shadow-lg group-hover:shadow-accent/20"
                                    >
                                        Open Resource <ExternalLink className="w-4 h-4" />
                                    </a>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'Motivation' && (
                        <motion.div
                            key="motivation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredMotivation.map((item, index) => (
                                <MotivationCard key={item.id} item={item} index={index} />
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'Tips' && (
                        <motion.div
                            key="tips"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filteredTips.map((item, index) => (
                                <TipCard key={item.id} item={item} index={index} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
