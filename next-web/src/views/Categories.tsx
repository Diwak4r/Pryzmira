
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid, List, Code2, Sparkles, Network, Database, LineChart, Layout, Smartphone, Server, BrainCircuit, Shield, Blocks, Palette, Cloud, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import coursesData from '../data/courses.json';
import CourseCard from '../components/CourseCard';
import AnimatedCounter from '../components/AnimatedCounter';
import SkeletonCard from '../components/SkeletonCard';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import RippleButton from '../components/RippleButton';
import { trackEvent, useFeatureFlag } from '../utils/analytics';

export default function Categories() {
    const [search, setSearch] = useState('');

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // A/B Testing & Analytics
    const ctaVariant = useFeatureFlag('hero-cta-copy');
    const ctaText = ctaVariant === 'variant-b' ? 'Join the Revolution' : 'Start Learning Now';

    const handleCtaClick = () => {
        trackEvent('hero_cta_clicked', { variant: ctaVariant });
        const element = document.getElementById('courses-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Infinite Scroll State
    const [visibleCount, setVisibleCount] = useState(15);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadRef, isIntersecting] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px'
    });

    const categories = [
        // Core Learning
        { id: 'Web Dev', name: 'Web Development', icon: Layout, color: 'bg-blue-500', desc: 'Build modern web apps' },
        { id: 'DSA', name: 'Data Structures', icon: Network, color: 'bg-emerald-500', desc: 'Ace technical interviews' },
        { id: 'System Design', name: 'System Design', icon: Database, color: 'bg-indigo-500', desc: 'Scale large systems' },
        { id: 'Mobile Dev', name: 'Mobile Dev', icon: Smartphone, color: 'bg-violet-500', desc: 'iOS & Android apps' },
        { id: 'DevOps', name: 'DevOps', icon: Server, color: 'bg-slate-500', desc: 'CI/CD & Infrastructure' },
        { id: 'Cloud', name: 'Cloud Computing', icon: Cloud, color: 'bg-sky-500', desc: 'AWS, Azure, GCP' },
        { id: 'Game Dev', name: 'Game Development', icon: Gamepad2, color: 'bg-rose-500', desc: 'Unity & Unreal Engine' },
        { id: 'Finance', name: 'Finance & Biz', icon: LineChart, color: 'bg-amber-500', desc: 'Understand markets' },
        { id: 'Coding', name: 'Core Coding', icon: Code2, color: 'bg-pink-500', desc: 'Programming fundamentals' },

        // AI & Tech
        { id: 'AI', name: 'Artificial Intelligence', icon: Sparkles, color: 'bg-orange-500', desc: 'Master ML & AI models' },
        { id: 'Data Science', name: 'Data Science', icon: BrainCircuit, color: 'bg-teal-500', desc: 'Analyze complex data' },
        { id: 'Cybersecurity', name: 'Cybersecurity', icon: Shield, color: 'bg-red-500', desc: 'Protect systems' },
        { id: 'Blockchain', name: 'Blockchain', icon: Blocks, color: 'bg-yellow-500', desc: 'Web3 & Smart Contracts' },
        { id: 'UI/UX', name: 'UI/UX Design', icon: Palette, color: 'bg-fuchsia-500', desc: 'Design user interfaces' }
    ];

    // Filter Logic
    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'duration'>('popular');

    // Filter & Sort Logic
    const filteredCourses = useMemo(() => {
        const result = coursesData.filter(course => {
            const searchLower = search.toLowerCase().trim();
            const searchTerms = searchLower.split(/\s+/).filter(Boolean);

            // Category Filter
            const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;

            // Search Filter (Multi-term AND logic)
            const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
                course.title.toLowerCase().includes(term) ||
                course.instructor.toLowerCase().includes(term) ||
                course.category.toLowerCase().includes(term) ||
                course.description.toLowerCase().includes(term) ||
                course.tags?.some(tag => tag.toLowerCase().includes(term))
            );

            return matchesCategory && matchesSearch;
        });

        // Sorting Logic
        return result.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return (b.students || 0) - (a.students || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'newest':
                    // Assuming higher ID is newer for now, or check for 'New' tag
                    const aNew = a.tags?.includes('New') ? 1 : 0;
                    const bNew = b.tags?.includes('New') ? 1 : 0;
                    if (aNew !== bNew) return bNew - aNew;
                    return b.id - a.id;
                case 'duration':
                    // Simple heuristic for duration string comparison
                    return parseInt(b.duration) - parseInt(a.duration);
                default:
                    return 0;
            }
        });
    }, [search, selectedCategory, sortBy]);

    const displayedCourses = useMemo(() => {
        return filteredCourses.slice(0, visibleCount);
    }, [filteredCourses, visibleCount]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisibleCount(15);
    }, [search, selectedCategory]);

    useEffect(() => {
        if (isIntersecting && !loadingMore && visibleCount < filteredCourses.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingMore(true);
            // Simulate network delay for smooth feel
            setTimeout(() => {
                setVisibleCount(prev => Math.min(prev + 15, filteredCourses.length));
                setLoadingMore(false);
            }, 800);
        }
    }, [isIntersecting, loadingMore, visibleCount, filteredCourses.length]);

    // Animation Variants (Anime.js style)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { x: -20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section - Premium Design with Animated Background */}
            <section className="relative py-32 mb-20 overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent-secondary/5 to-background animate-gradient opacity-60" />

                {/* Floating Orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float opacity-30" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-float opacity-20" style={{ animationDelay: '2s' }} />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 noise-texture opacity-50" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        {/* Left: Enhanced Copy & CTA */}
                        <div className="lg:w-1/2 text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                    </span>
                                    <span className="text-sm font-semibold gradient-text">10,000+ Active Learners</span>
                                </motion.div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary tracking-tight mb-6 leading-[1.05]">
                                    Master the{' '}
                                    <span className="gradient-text animate-gradient">
                                        Future of Tech
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-text-secondary max-w-lg mb-10 leading-relaxed">
                                    Join an <span className="text-primary font-semibold">elite community</span> of builders. From AI architecture to system design, we curate the path to mastery.
                                </p>

                                <div className="flex flex-wrap items-center gap-4">
                                    <RippleButton
                                        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCtaClick}
                                        className="group px-8 py-4 gradient-bg text-white text-lg font-bold rounded-full shadow-premium hover:shadow-premium-lg transition-all relative overflow-hidden"
                                    >
                                        <span className="relative z-10">{ctaText}</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    </RippleButton>

                                    <Link
                                        href="/roadmap"
                                        className="px-8 py-4 glass-card text-primary font-bold rounded-full hover:scale-105 transition-all"
                                    >
                                        View Roadmap
                                    </Link>
                                </div>

                                {/* Premium Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-14 grid grid-cols-3 gap-6"
                                >
                                    <div className="text-center glass-panel p-4 rounded-2xl">
                                        <p className="text-4xl font-black gradient-text mb-1">
                                            <AnimatedCounter value={10000} suffix="+" />
                                        </p>
                                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Learners</p>
                                    </div>
                                    <div className="text-center glass-panel p-4 rounded-2xl">
                                        <p className="text-4xl font-black gradient-text mb-1">
                                            <AnimatedCounter value={85} suffix="%" />
                                        </p>
                                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Career Growth</p>
                                    </div>
                                    <div className="text-center glass-panel p-4 rounded-2xl">
                                        <p className="text-4xl font-black gradient-text mb-1">
                                            <AnimatedCounter value={200} suffix="+" />
                                        </p>
                                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Courses</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Right: Premium Feature Cards with Glassmorphism */}
                        <div className="lg:w-1/2 relative">
                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="premium-card p-8 rounded-3xl hover-glow"
                                >
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg">
                                            <Sparkles className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary mb-3">AI-Powered</h3>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            Personalized curriculum that adapts to your learning pace and style.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="premium-card p-8 rounded-3xl hover-glow mt-8"
                                >
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg">
                                            <Network className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary mb-3">Interactive</h3>
                                        <p className="text-sm text-text-secondary leading-relaxed">
                                            Hands-on labs and real-world challenges to solidify learning.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="col-span-2 premium-card p-8 rounded-3xl hover-glow"
                                >
                                    <div className="relative z-10 flex items-start gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                            <Database className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-primary mb-3">Industry Standard</h3>
                                            <p className="text-sm text-text-secondary leading-relaxed">
                                                Curriculum designed by engineers from FAANG and top tech companies worldwide.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Learning Path Section */}
            <section className="py-16 bg-surface border-y border-border mb-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-primary">Featured Learning Path: Full Stack AI</h2>
                        <Link href="/roadmap" className="text-accent font-bold hover:underline">View Roadmap</Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 relative">
                        {/* Animated Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-2 -z-10 -translate-y-1/2">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                                {/* Background Line */}
                                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="currentColor" className="text-border" strokeWidth="2" />

                                {/* Animated Progress Line */}
                                <motion.line
                                    x1="0%" y1="50%" x2="100%" y2="50%"
                                    stroke="#B8674F" // Terracotta
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                            </svg>
                        </div>

                        {[
                            { step: '01', title: 'Foundations', desc: 'Python & Data Structures', icon: Code2 },
                            { step: '02', title: 'Core AI', desc: 'Machine Learning Models', icon: BrainCircuit },
                            { step: '03', title: 'Deployment', desc: 'Scale & Production', icon: Cloud },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.3 }}
                                whileHover={{ y: -5 }}
                                className="flex-1 bg-background/80 backdrop-blur-sm border border-border p-6 rounded-xl shadow-sm relative group"
                            >
                                <motion.div
                                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-4 border-background z-10"
                                    initial={{ backgroundColor: "#1A1F2E", color: "white" }} // Charcoal
                                    whileInView={{ backgroundColor: "#B8674F" }} // Terracotta
                                    transition={{ delay: i * 0.6, duration: 0.5 }}
                                >
                                    {item.step}
                                </motion.div>
                                <item.icon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform duration-300" />
                                <h3 className="text-xl font-bold text-primary mb-1">{item.title}</h3>
                                <p className="text-sm text-text-secondary">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4" id="courses-section">
                {/* Search Bar (Moved down) */}
                <div className="mb-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-surface/80 backdrop-blur-xl border border-border rounded-full px-6 py-4 shadow-2xl">
                            <Search className="w-6 h-6 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="What do you want to learn today?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none outline-none ml-4 text-lg text-primary placeholder:text-text-secondary/50 font-medium"
                            />
                        </div>
                    </motion.div>
                </div>


                {/* Compact Categories List */}
                <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    <motion.div
                        className="flex gap-3 min-w-max px-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.button
                            variants={itemVariants}
                            onClick={() => setSelectedCategory('All')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md ${selectedCategory === 'All'
                                ? 'bg-accent text-white border-accent shadow-lg shadow-accent/25'
                                : 'bg-surface/30 text-text-secondary border-border/50 hover:border-accent/30 hover:bg-surface/60 hover:text-text-primary'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="font-bold text-sm whitespace-nowrap">All Categories</span>
                        </motion.button>

                        {categories.map((cat) => (
                            <motion.button
                                key={cat.id}
                                variants={itemVariants}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'All' : cat.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md ${selectedCategory === cat.id
                                    ? 'bg-accent text-white border-accent shadow-lg shadow-accent/25'
                                    : 'bg-surface/30 text-text-secondary border-border/50 hover:border-accent/30 hover:bg-surface/60 hover:text-text-primary'
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                <span className="font-bold text-sm whitespace-nowrap">{cat.name}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                </div>

                {/* Content Section */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        {selectedCategory === 'All' ? 'Popular Courses' : `${selectedCategory} Courses`}
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-surface border border-white/10 text-text-secondary">
                            {filteredCourses.length}
                        </span>
                    </h2>

                    <div className="flex items-center gap-4">
                        {/* Sort Dropdown */}
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'newest' | 'duration')}
                                className="appearance-none bg-surface/50 border border-white/5 text-text-secondary text-sm font-medium px-4 py-2.5 pr-10 rounded-xl outline-none focus:border-accent/30 focus:text-text-primary cursor-pointer hover:bg-surface hover:text-text-primary transition-all"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest Added</option>
                                <option value="duration">Duration</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surface text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <motion.div
                    layout
                    className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                        : "flex flex-col gap-4"
                    }
                >
                    <AnimatePresence mode="popLayout">
                        {displayedCourses.map((course, index) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                index={index}
                                isCompact={viewMode === 'list'}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Loading Skeletons */}
                {loadingMore && (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8"
                        : "flex flex-col gap-4 mt-4"
                    }>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={`skeleton-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <SkeletonCard />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Intersection Observer Target */}
                {visibleCount < filteredCourses.length && (
                    <div ref={loadRef} className="h-20 w-full flex justify-center items-center opacity-0">
                        Loading more...
                    </div>
                )}

                {filteredCourses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="inline-block p-6 rounded-full bg-surface/50 mb-4">
                            <Search className="w-12 h-12 text-text-secondary/50" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No courses found</h3>
                        <p className="text-text-secondary">Try selecting a different category or adjusting your search.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                            className="mt-6 px-6 py-2 rounded-full bg-accent text-white font-bold hover:bg-accent-hover transition-colors"
                        >
                            Reset Filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div >
    );
}
