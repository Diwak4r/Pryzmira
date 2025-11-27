import { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid, List, Zap, Terminal, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import coursesData from '../data/courses.json';
import CourseCard from '../components/CourseCard';
import heroBg from '../assets/images/backgrounds/hero.png';

export default function Courses() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Popularity');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const categories = ['All', 'Web Dev', 'AI', 'DSA', 'System Design', 'Finance', 'Coding'];
    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
    const sortOptions = ['Popularity', 'Rating', 'Newest', 'Duration'];

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Filter and Sort Logic
    const filteredCourses = useMemo(() => {
        const result = coursesData.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                course.instructor.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
            const matchesDifficulty = difficultyFilter === 'All' || course.difficulty === difficultyFilter;
            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'Popularity':
                    return (b.students || 0) - (a.students || 0);
                case 'Rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'Newest':
                    return (b.tags?.includes('New') ? 1 : 0) - (a.tags?.includes('New') ? 1 : 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [debouncedSearch, categoryFilter, difficultyFilter, sortBy]);

    return (
        <div className="min-h-screen pb-20">
            {/* Dynamic Hero Section */}
            <section className="relative py-32 mb-12 overflow-hidden">
                {/* Background Effects */}
                <div
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        backgroundImage: `url(${heroBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/20 rounded-full blur-[120px] -z-10 opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] -z-10 opacity-30" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/50 backdrop-blur-md border border-white/10 text-accent text-sm font-bold mb-8 shadow-lg shadow-accent/5">
                            <Terminal className="w-4 h-4" />
                            <span>v2.0.0 // Ready to Build</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-text-primary tracking-tight mb-8 leading-tight">
                            Master the Skills <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-400">That Matter.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Curated paths for Developers, Designers, and Founders. <br />
                            Stop searching, start building.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-10">
                {/* Path Builder Sidebar */}
                <aside className="hidden lg:block w-72 flex-shrink-0 space-y-8">
                    <div className="sticky top-28">
                        <div className="flex items-center gap-2 mb-6 px-2">
                            <Layers className="w-5 h-5 text-accent" />
                            <h3 className="text-lg font-bold text-text-primary">Path Builder</h3>
                        </div>

                        <div className="space-y-8 p-6 rounded-2xl bg-surface/30 backdrop-blur-md border border-white/5">
                            {/* Core Paths (Categories) */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Core Path</label>
                                <div className="flex flex-col gap-2">
                                    {categories.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCategoryFilter(c)}
                                            className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${categoryFilter === c
                                                ? 'bg-accent text-white border-accent shadow-lg shadow-accent/25'
                                                : 'bg-surface/50 text-text-secondary border-transparent hover:bg-surface hover:text-text-primary hover:border-white/5'
                                                }`}
                                        >
                                            <span className="font-medium">{c}</span>
                                            {categoryFilter === c && <Zap className="w-4 h-4 fill-current" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level (Difficulty) */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Experience Level</label>
                                <div className="flex flex-wrap gap-2">
                                    {difficulties.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficultyFilter(d)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${difficultyFilter === d
                                                ? 'bg-text-primary text-background border-text-primary'
                                                : 'bg-surface/50 text-text-secondary border-transparent hover:bg-surface hover:text-text-primary'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Grid */}
                <div className="flex-grow min-w-0">
                    {/* Top Bar: Search & Controls */}
                    <div className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm sticky top-20 z-40">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Search paths, skills, creators..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-surface/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-surface transition-all placeholder:text-text-secondary/50 font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            <div className="flex items-center gap-1 bg-surface/50 rounded-xl p-1 border border-white/5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surface text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-surface/50 border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-text-primary font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 hover:bg-surface transition-colors"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters (Horizontal Scroll) */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                        {categories.map(c => (
                            <button
                                key={c}
                                onClick={() => setCategoryFilter(c)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border transition-all ${categoryFilter === c
                                    ? 'bg-accent text-white border-accent'
                                    : 'bg-surface/50 text-text-secondary border-transparent'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Results Status */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                            {categoryFilter === 'All' ? 'All Paths' : categoryFilter}
                            <span className="px-2.5 py-0.5 rounded-md bg-surface/50 text-sm text-text-secondary border border-white/5 font-medium">
                                {filteredCourses.length}
                            </span>
                        </h2>
                    </div>

                    {/* Grid/List View */}
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                        : "flex flex-col gap-4"
                    }>
                        <AnimatePresence mode="popLayout">
                            {filteredCourses.map((course, index) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    index={index}
                                    isCompact={viewMode === 'list'}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-32 bg-surface/20 border border-white/5 rounded-3xl border-dashed backdrop-blur-sm">
                            <div className="w-20 h-20 bg-surface/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-text-secondary/50" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">No paths found</h3>
                            <p className="text-text-secondary mb-8">Try adjusting your filters or search terms.</p>
                            <button
                                onClick={() => { setSearch(''); setCategoryFilter('All'); setDifficultyFilter('All'); }}
                                className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
