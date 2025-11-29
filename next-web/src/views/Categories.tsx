'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid, List, Code2, Sparkles, Network, Database, LineChart, Layout, Smartphone, Server, BrainCircuit, Shield, Blocks, Palette, Cloud, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import coursesData from '../data/courses.json';
import CourseCard from '../components/CourseCard';
import AnimatedCounter from '../components/AnimatedCounter';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { trackEvent, useFeatureFlag } from '../utils/analytics';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        { id: 'Web Dev', name: 'Web Development', icon: Layout },
        { id: 'DSA', name: 'Data Structures', icon: Network },
        { id: 'System Design', name: 'System Design', icon: Database },
        { id: 'Mobile Dev', name: 'Mobile Dev', icon: Smartphone },
        { id: 'DevOps', name: 'DevOps', icon: Server },
        { id: 'Cloud', name: 'Cloud Computing', icon: Cloud },
        { id: 'Game Dev', name: 'Game Development', icon: Gamepad2 },
        { id: 'Finance', name: 'Finance & Biz', icon: LineChart },
        { id: 'Coding', name: 'Core Coding', icon: Code2 },
        { id: 'AI', name: 'Artificial Intelligence', icon: Sparkles },
        { id: 'Data Science', name: 'Data Science', icon: BrainCircuit },
        { id: 'Cybersecurity', name: 'Cybersecurity', icon: Shield },
        { id: 'Blockchain', name: 'Blockchain', icon: Blocks },
        { id: 'UI/UX', name: 'UI/UX Design', icon: Palette }
    ];

    const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'duration'>('popular');

    const filteredCourses = useMemo(() => {
        const result = coursesData.filter(course => {
            const searchLower = search.toLowerCase().trim();
            const searchTerms = searchLower.split(/\s+/).filter(Boolean);
            const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
            const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
                course.title.toLowerCase().includes(term) ||
                course.instructor.toLowerCase().includes(term) ||
                course.category.toLowerCase().includes(term) ||
                course.description.toLowerCase().includes(term) ||
                course.tags?.some(tag => tag.toLowerCase().includes(term))
            );
            return matchesCategory && matchesSearch;
        });

        return result.sort((a, b) => {
            switch (sortBy) {
                case 'popular': return (b.students || 0) - (a.students || 0);
                case 'rating': return (b.rating || 0) - (a.rating || 0);
                case 'newest': return (b.id || 0) - (a.id || 0);
                case 'duration': return parseInt(b.duration) - parseInt(a.duration);
                default: return 0;
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
            setTimeout(() => {
                setVisibleCount(prev => Math.min(prev + 15, filteredCourses.length));
                setLoadingMore(false);
            }, 500);
        }
    }, [isIntersecting, loadingMore, visibleCount, filteredCourses.length]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Minimal Hero Section */}
            <section className="pt-32 pb-20 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Master the <br />
                            Future of Tech.
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
                            Join an elite community of builders. From AI architecture to system design, we curate the path to mastery with industry-standard resources.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Button onClick={handleCtaClick} size="lg" className="text-lg px-8 py-6">
                                {ctaText}
                            </Button>
                            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                                <Link href="/roadmap">
                                    View Roadmap
                                </Link>
                            </Button>
                        </div>

                        {/* Minimal Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-12 border-t border-border pt-8 max-w-lg">
                            <div>
                                <p className="text-3xl font-bold text-foreground mb-1">
                                    <AnimatedCounter value={10000} suffix="+" />
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Learners</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-foreground mb-1">
                                    <AnimatedCounter value={85} suffix="%" />
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Growth</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-foreground mb-1">
                                    <AnimatedCounter value={200} suffix="+" />
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Courses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal Features Section */}
            <section className="py-20 border-b border-border bg-accent/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 border border-border bg-background rounded-lg">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">AI-Powered</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Personalized curriculum that adapts to your learning pace and style using advanced algorithms.
                            </p>
                        </div>
                        <div className="p-6 border border-border bg-background rounded-lg">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                                <Network className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Interactive</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Hands-on labs and real-world challenges to solidify learning through doing.
                            </p>
                        </div>
                        <div className="p-6 border border-border bg-background rounded-lg">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                                <Database className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Industry Standard</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Curriculum designed by engineers from top tech companies to ensure relevance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="courses-section">

                {/* Search & Filter Bar */}
                <div className="mb-12 space-y-6">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search courses, topics, or instructors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 py-6 text-base"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Categories Scroll */}
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                            <Button
                                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('All')}
                                className="whitespace-nowrap"
                            >
                                All Categories
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="whitespace-nowrap"
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>

                        {/* Sort & View Toggle */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Select
                                value={sortBy}
                                onValueChange={(value) => setSortBy(value as 'popular' | 'rating' | 'newest' | 'duration')}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                    <SelectItem value="rating">Highest Rated</SelectItem>
                                    <SelectItem value="newest">Newest Added</SelectItem>
                                    <SelectItem value="duration">Duration</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center border border-border rounded-md overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-none ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : ''}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-full bg-border" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-none ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : ''}`}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    <AnimatePresence mode="popLayout">
                        {displayedCourses.map((course, index) => (
                            <motion.div
                                layout
                                key={course.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                                transition={{
                                    layout: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                    scale: { duration: 0.2 }
                                }}
                            >
                                <CourseCard
                                    course={course}
                                    index={index}
                                    isCompact={viewMode === 'list'}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredCourses.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-border rounded-lg">
                        <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
                        <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
                        <Button
                            variant="outline"
                            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                )}

                {/* Loading Indicator */}
                {visibleCount < filteredCourses.length && (
                    <div ref={loadRef} className="h-20 w-full flex justify-center items-center mt-8">
                        {loadingMore && <span className="text-sm text-muted-foreground">Loading more courses...</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
