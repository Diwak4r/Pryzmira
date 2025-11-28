'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, ArrowRight, Zap, Code2, Star } from 'lucide-react';
import { useRef, memo, useState } from 'react';

interface Course {
    id: number;
    title: string;
    instructor: string;
    category: string;
    url: string;
    description: string;
    difficulty: string;
    type: string;
    duration: string;
    instructor_lang: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
    students?: number;
    tags?: string[];
    careerRelevance?: string;
}

interface CourseCardProps {
    course: Course;
    index: number;
    isCompact?: boolean;
}

const difficultyConfig: Record<string, { color: string; bg: string; border: string; gradient: string }> = {
    'Beginner': {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500 to-teal-600'
    },
    'Intermediate': {
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        gradient: 'from-amber-500 to-orange-600'
    },
    'Advanced': {
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        gradient: 'from-purple-500 to-pink-600'
    }
};

function CourseCard({ course, index, isCompact = false }: CourseCardProps) {
    const difficultyStyle = difficultyConfig[course.difficulty] || difficultyConfig['Beginner'];
    const vibeScore = Math.min(100, Math.round(((course.rating || 0) * 18) + ((course.reviewCount || 0) > 1000 ? 10 : 5)));
    const [imageLoaded, setImageLoaded] = useState(false);

    // 3D Tilt Effect Logic (Desktop only)
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current || window.innerWidth < 768) return; // Disable on mobile

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Compact/List View
    if (isCompact) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-4 p-4 glass-card rounded-2xl hover:scale-[1.01] transition-all duration-300"
            >
                {/* Thumbnail */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden glass-panel relative flex-shrink-0">
                    <Image
                        src={course.image || '/placeholder.png'}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 96px"
                        loading="lazy"
                    />
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link href={`/course/${course.id}`} className="block flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-text-primary truncate group-hover:gradient-text transition-colors">
                                {course.title}
                            </h3>
                        </Link>
                        {course.tags?.includes('Popular') && (
                            <span className="px-2 py-1 gradient-bg text-white text-xs font-bold uppercase rounded-full flex-shrink-0 shadow-lg">
                                Hot
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-text-secondary truncate">by {course.instructor}</p>

                    {/* Mobile: Show rating */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary md:hidden">
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <span>•</span>
                        <span className={difficultyStyle.color}>{course.difficulty}</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${difficultyStyle.bg} ${difficultyStyle.color} ${difficultyStyle.border}`}>
                        {course.difficulty}
                    </div>

                    <Link
                        href={`/course/${course.id}`}
                        className="p-3 rounded-xl glass-card hover:gradient-bg hover:text-white transition-all group/arrow"
                    >
                        <ArrowRight className="w-5 h-5 group-hover/arrow:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>
        );
    }

    // Grid View - Premium Design
    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 25
            }}
            className="group flex flex-col h-full premium-card rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-500"
        >
            <div style={{ transform: "translateZ(50px)" }} className="flex flex-col h-full">
                {/* Course Thumbnail with Lazy Loading */}
                <Link href={`/course/${course.id}`} className="relative aspect-video overflow-hidden block">
                    {/* Blur Placeholder */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-secondary/20 animate-pulse" />
                    )}

                    <Image
                        src={course.image || '/placeholder.png'}
                        alt={course.title}
                        fill
                        className={`object-cover transition-all duration-700 ${imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                            } group-hover:scale-110`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        quality={85}
                    />

                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />

                    {/* Top Badges with Glass Effect */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 gap-2">
                        <span className="px-3 py-1.5 glass-panel text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-xl">
                            {course.category}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 glass-panel text-white rounded-full shadow-lg backdrop-blur-xl">
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                            <span className="text-xs font-bold">{vibeScore}</span>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, vibeScore)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${difficultyStyle.gradient}`}
                        />
                    </div>
                </Link>

                {/* Content with Glassmorphism */}
                <div className="p-5 flex flex-col flex-grow relative glass-panel">
                    <div className="mb-3">
                        <Link href={`/course/${course.id}`} className="block">
                            <h3 className="text-lg font-bold text-text-primary leading-snug line-clamp-2 group-hover:gradient-text transition-all font-heading">
                                {course.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-text-secondary mt-1.5 font-medium truncate">
                            by {course.instructor}
                        </p>
                    </div>

                    {/* Enhanced Metrics */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-text-secondary flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span className="font-semibold">{course.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{course.students ? (course.students > 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                        </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${difficultyStyle.bg} ${difficultyStyle.color} ${difficultyStyle.border}`}>
                            {course.difficulty}
                        </span>
                    </div>

                    {/* Premium Footer Actions */}
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-3">
                        <Link
                            href={`/canvas?challenge=Practice ${course.title}`}
                            className="p-3 rounded-xl glass-card hover:gradient-bg hover:text-white transition-all group/practice"
                            title="Practice on Canvas"
                        >
                            <Code2 className="w-4 h-4" />
                        </Link>
                        <Link
                            href={`/course/${course.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white text-sm font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-premium hover:shadow-premium-lg"
                        >
                            View Course
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Memoize for performance
export const MemoizedCourseCard = memo(CourseCard);
export default MemoizedCourseCard;
