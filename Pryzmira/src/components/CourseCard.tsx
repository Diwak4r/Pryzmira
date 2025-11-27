import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, Zap, Briefcase, Code, Brain, Binary, Server, TrendingUp, Terminal, Cpu } from 'lucide-react';

import { getCourseImage } from '../utils/imageMapper';

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

const categoryColors: Record<string, string> = {
    'Web Dev': 'bg-[#14b8a6]', // Solid Teal
    'AI': 'bg-[#f43f5e]',      // Solid Rose
    'DSA': 'bg-[#10b981]',     // Solid Emerald
    'System Design': 'bg-[#6366f1]', // Solid Indigo
    'Finance': 'bg-[#06b6d4]', // Solid Cyan
    'Coding': 'bg-[#8b5cf6]',  // Solid Violet
    'Default': 'bg-[#64748b]'  // Solid Slate
};

export default function CourseCard({ course, index, isCompact = false }: CourseCardProps) {
    // Calculate Vibe Score (Mock Logic)
    const vibeScore = Math.min(100, Math.round(((course.rating || 0) * 18) + ((course.reviewCount || 0) > 1000 ? 10 : 5)));

    const bgColor = categoryColors[course.category] || categoryColors['Default'];
    const imageSrc = getCourseImage(course.category);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Web Dev': return <Code className="w-16 h-16 text-teal-400" />;
            case 'AI': return <Brain className="w-16 h-16 text-rose-400" />;
            case 'DSA': return <Binary className="w-16 h-16 text-emerald-400" />;
            case 'System Design': return <Server className="w-16 h-16 text-indigo-400" />;
            case 'Finance': return <TrendingUp className="w-16 h-16 text-cyan-400" />;
            case 'Coding': return <Terminal className="w-16 h-16 text-violet-400" />;
            default: return <Cpu className="w-16 h-16 text-slate-400" />;
        }
    };

    if (isCompact) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-4 p-4 bg-surface/50 backdrop-blur-sm border border-white/5 rounded-xl hover:border-accent/30 transition-all duration-300 hover:bg-surface-hover/50"
            >
                {/* Minimal Visual Indicator */}
                <div className={`w-2 h-16 rounded-full ${bgColor} flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} />

                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                            {course.title}
                        </h3>
                        {course.tags?.includes('Popular') && (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase rounded border border-accent/20">
                                Hot
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-text-secondary truncate">by {course.instructor}</p>
                </div>

                {/* Career Relevance (Compact) */}
                {course.careerRelevance && (
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-hover/50 border border-white/5 text-xs font-medium text-text-secondary mr-4">
                        <Briefcase className="w-3.5 h-3.5 text-accent" />
                        <span className="truncate max-w-[150px]">{course.careerRelevance}</span>
                    </div>
                )}

                {/* Vibe Score */}
                <div className="flex flex-col items-center px-4 border-l border-white/10">
                    <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">Vibe</span>
                    <span className="text-lg font-black text-accent">{vibeScore}</span>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm text-text-secondary mr-4">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{course.students?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to={`/canvas?challenge=Practice ${course.title}`}
                        className="p-2 rounded-lg bg-surface/50 text-text-secondary hover:bg-accent/10 hover:text-accent transition-colors border border-transparent hover:border-accent/20"
                        title="Practice on Canvas"
                    >
                        <Code className="w-4 h-4" />
                    </Link>
                    <a
                        href={course.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-surface/50 text-text-secondary hover:bg-accent hover:text-white transition-colors border border-transparent hover:border-accent/20"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col h-full bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1"
        >
            {/* Image/Icon Area */}
            <div className="relative h-48 overflow-hidden bg-surface-hover/30 flex items-center justify-center group-hover:bg-transparent transition-colors duration-500">

                {/* Abstract Background (Visible on Hover) */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
                    style={{
                        backgroundImage: `url(${imageSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent opacity-90 z-10" />

                {/* Centered Logo/Icon */}
                <div className="relative z-20 transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {getCategoryIcon(course.category)}
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-30">
                    <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                        {course.category}
                    </span>
                </div>

                {/* Vibe Score Badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full shadow-lg z-30">
                    <Zap className="w-3 h-3 text-teal-400 fill-current" />
                    <span className="text-xs font-bold">{vibeScore}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow relative">
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-text-primary leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 font-medium flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-accent inline-block" />
                        by {course.instructor}
                    </p>
                </div>

                {/* Career Relevance Badge */}
                {course.careerRelevance && (
                    <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/5 border border-accent/10 text-xs font-medium text-accent w-fit">
                        <Briefcase className="w-3 h-3" />
                        {course.careerRelevance}
                    </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface/50 border border-white/5">
                        <Users className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs font-semibold text-text-primary">{course.students?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface/50 border border-white/5">
                        <Clock className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs font-semibold text-text-primary">{course.duration}</span>
                    </div>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-grow leading-relaxed">
                    {course.description}
                </p>

                {/* Footer Info & Action */}
                <div className="pt-5 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                        <span className={`px-2.5 py-1 rounded-md border ${course.difficulty === 'Beginner' ? 'border-green-500/20 text-green-500 bg-green-500/5' :
                            course.difficulty === 'Intermediate' ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5' :
                                'border-red-500/20 text-red-500 bg-red-500/5'
                            }`}>
                            {course.difficulty}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to={`/canvas?challenge=Practice ${course.title}`}
                            className="p-2.5 rounded-xl bg-surface text-text-secondary hover:bg-accent/10 hover:text-accent transition-colors border border-white/5 hover:border-accent/20"
                            title="Practice on Canvas"
                        >
                            <Code className="w-4 h-4" />
                        </Link>
                        <a
                            href={course.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-text-primary text-background text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/20"
                        >
                            Start <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
