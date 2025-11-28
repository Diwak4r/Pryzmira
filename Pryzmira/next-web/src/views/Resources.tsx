'use client';

import { useState, useMemo, useEffect } from 'react';
import { Youtube, ExternalLink, BookOpen, GraduationCap, Map, Search, Lightbulb, Quote, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { resources } from '../data/mockData';
import motivationData from '../data/motivation.json';
import tipsData from '../data/tips.json';
import MotivationCard from '../components/MotivationCard';
import TipCard from '../components/TipCard';

export default function Resources() {
    const [activeTab, setActiveTab] = useState<'Resources' | 'Motivation' | 'Tips'>('Resources');
    const [search, setSearch] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsUnlocked(localStorage.getItem('vault_unlocked') === 'true');
    }, []);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretCode === 'Diwa') {
            setIsUnlocked(true);
            setError('');
            localStorage.setItem('vault_unlocked', 'true');
        } else {
            setError('Access Denied. Invalid Clearance Code.');
        }
    };

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

    const filteredResources = useMemo(() => resources.filter(resource =>
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.type.toLowerCase().includes(search.toLowerCase())
    ), [search]);

    const filteredMotivation = useMemo(() => motivationData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.person.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ), [search]);

    const filteredTips = useMemo(() => tipsData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ), [search]);

    if (!isUnlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-surface/30" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md w-full mx-4 p-8 rounded-3xl bg-surface/30 backdrop-blur-xl border border-white/10 shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent/20">
                            <Lock className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-3xl font-black text-text-primary mb-2">The Vault</h1>
                        <p className="text-text-secondary">Restricted Access. Enter clearance code.</p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                placeholder="Enter Access Code"
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-4 px-6 text-center text-lg font-bold tracking-widest text-text-primary focus:outline-none focus:border-accent/50 focus:bg-surface transition-all placeholder:text-text-secondary/30 placeholder:font-normal placeholder:tracking-normal"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm text-center font-medium"
                            >
                                {error}
                            </motion.p>
                        )}
                        <button
                            type="submit"
                            className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                        >
                            Unlock Vault <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="relative py-20 mb-12 text-center overflow-hidden">
                <h1 className="text-5xl md:text-7xl font-black mb-6 text-text-primary tracking-tight">
                    The <span className="text-accent">Vault</span>
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
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
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
                            layout
                            key="resources"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredResources.map((resource) => (
                                    <motion.div
                                        layout
                                        key={resource.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className="group bg-surface backdrop-blur-md border border-border rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 flex flex-col h-full"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={resource.image}
                                                alt={resource.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                                                    {getIcon(resource.type)}
                                                    {resource.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors leading-tight">
                                                {resource.title}
                                            </h3>

                                            <p className="text-sm text-text-secondary mb-6 line-clamp-2 leading-relaxed flex-grow">
                                                {resource.description}
                                            </p>

                                            <a
                                                href={resource.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-auto w-full py-2.5 rounded-lg bg-surface-hover text-text-primary text-xs font-bold uppercase tracking-wide hover:bg-accent hover:text-white transition-all duration-300 border border-white/5 hover:border-accent/20 flex items-center justify-center gap-2"
                                            >
                                                Open Resource <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {activeTab === 'Motivation' && (
                        <motion.div
                            layout
                            key="motivation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredMotivation.map((item, index) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <MotivationCard item={item} index={index} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {activeTab === 'Tips' && (
                        <motion.div
                            layout
                            key="tips"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredTips.map((item, index) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <TipCard item={item} index={index} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
