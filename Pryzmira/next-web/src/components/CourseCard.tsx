'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, ArrowRight, Zap, Code2 } from 'lucide-react';
import { useRef, memo } from 'react';

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

const difficultyConfig: Record<string, { color: string; bg: string; border: string }> = {
    'Beginner': { color: 'text-[#6B8E7F]', bg: 'bg-[#6B8E7F]/10', border: 'border-[#6B8E7F]/20' },
    'Intermediate': { color: 'text-[#B8674F]', bg: 'bg-[#B8674F]/10', border: 'border-[#B8674F]/20' },
    'Advanced': { color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/20' }
};

function CourseCard({ course, index, isCompact = false }: CourseCardProps) {
    const difficultyStyle = difficultyConfig[course.difficulty] || difficultyConfig['Beginner'];
    const vibeScore = Math.min(100, Math.round(((course.rating || 0) * 18) + ((course.reviewCount || 0) > 1000 ? 10 : 5)));

    // 3D Tilt Effect Logic
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

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

    if (isCompact) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-4 p-4 bg-surface/50 backdrop-blur-sm border border-white/5 rounded-xl hover:border-accent/30 transition-all duration-300 hover:bg-surface-hover/50"
            >
                {/* Thumbnail (Compact) */}
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/5 relative flex-shrink-0">
                    <Image
                        src={course.image || '/placeholder.png'}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                    />
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/course/${course.id}`} className="block">
                            <h3 className="text-base font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                                {course.title}
                            </h3>
                        </Link>
                        {course.tags?.includes('Popular') && (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase rounded border border-accent/20">
                                Hot
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-text-secondary truncate">by {course.instructor}</p>
                </div>

                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${difficultyStyle.bg} ${difficultyStyle.color} ${difficultyStyle.border}`}>
                    {course.difficulty}
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/course/${course.id}`}
                        className="p-2 rounded-lg bg-surface/50 text-text-secondary hover:bg-accent hover:text-white transition-colors border border-transparent hover:border-accent/20"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </motion.div>
        );
    }

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
                damping: 20
            }}
            className="group flex flex-col h-full bg-surface backdrop-blur-md border border-border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-accent/5 perspective-1000"
        >
            <div style={{ transform: "translateZ(50px)" }} className="flex flex-col h-full">
                {/* Course Thumbnail */}
                <Link href={`/course/${course.id}`} className="relative aspect-video overflow-hidden block">
                    <Image
                        src={course.image || '/placeholder.png'}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                        <span className={`px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm`}>
                            {course.category}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full shadow-sm">
                            <Zap className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-[10px] font-bold">{vibeScore}</span>
                        </div>
                    </div>

                    {/* Learning Velocity Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 group/velocity">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, ((course.rating || 4.5) / (course.difficulty === 'Advanced' ? 1 : course.difficulty === 'Intermediate' ? 2 : 3)) * 30)}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#6B8E7F] to-[#B8674F]"
                        />
                    </div>
                </Link>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow relative bg-surface">
                    <div className="mb-2">
                        <Link href={`/course/${course.id}`} className="block">
                            <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors font-heading">
                                {course.title}
                            </h3>
                        </Link>
                        <p className="text-xs text-text-secondary mt-1 font-medium truncate">
                            by {course.instructor}
                        </p>
                    </div>

                    {/* Metrics Row */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-text-secondary">
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{course.students ? (course.students > 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${difficultyStyle.bg} ${difficultyStyle.color} ${difficultyStyle.border}`}>
                                {course.difficulty}
                            </span>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <Link
                            href={`/canvas?challenge=Practice ${course.title}`}
                            className="p-2 rounded-lg bg-surface text-text-secondary hover:bg-accent/10 hover:text-accent transition-colors border border-white/5 hover:border-accent/20"
                            title="Practice on Canvas"
                        >
                            <Code2 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            href={`/course/${course.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent text-white text-xs font-bold uppercase tracking-wide hover:bg-accent-hover transition-all duration-300 shadow-lg shadow-accent/20"
                        >
                            View Course
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export const MemoizedCourseCard = memo(CourseCard);
export default MemoizedCourseCard;
