'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    ArrowLeft, Clock, Users, Star, Globe, CheckCircle2,
    BookOpen, Code2, Share2, ExternalLink, Zap, Award,
    Briefcase, Layers, PlayCircle, Check
} from 'lucide-react';
import coursesData from '../data/courses.json';
import RippleButton from '../components/RippleButton';

export default function CourseDetail() {
    const { id } = useParams();
    const router = useRouter();
    const course = coursesData.find(c => c.id === Number(id));
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: course?.title,
                    text: `Check out this course: ${course?.title}`,
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary">
                <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                <button
                    onClick={() => router.push('/categories')}
                    className="px-6 py-2 bg-accent rounded-full text-white font-bold hover:bg-accent-hover transition-colors"
                >
                    Back to Courses
                </button>
            </div>
        );
    }

    const difficultyColor = {
        'Beginner': 'text-green-400 bg-green-400/10 border-green-400/20',
        'Intermediate': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        'Advanced': 'text-red-400 bg-red-400/10 border-red-400/20'
    }[course.difficulty] || 'text-text-secondary bg-surface border-white/10';

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative h-[500px] w-full overflow-hidden">
                {/* Background Image with Blur */}
                <div className="absolute inset-0">
                    <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover opacity-30 blur-xl scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>

                <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.back()}
                        className="absolute top-8 left-4 md:left-0 flex items-center gap-2 text-text-secondary hover:text-white transition-colors group"
                    >
                        <div className="p-2 rounded-full bg-surface/50 border border-white/5 group-hover:border-accent/50 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Back</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${difficultyColor}`}>
                                {course.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                                {course.category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            {course.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-text-secondary mb-8">
                            <div className="flex items-center gap-2">
                                <Image
                                    src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`}
                                    alt={course.instructor}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                                <span className="font-medium text-white">{course.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="font-bold text-white">{course.rating}</span>
                                <span className="text-sm">({course.reviewCount?.toLocaleString()} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span>{course.students?.toLocaleString()} students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                <span>{course.instructor_lang}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <RippleButton
                                onClick={() => window.open(course.url, '_blank')}
                                className="flex-1 md:flex-none w-full md:w-auto px-8 py-4 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 flex items-center justify-center gap-2 text-lg"
                            >
                                Start Learning <ExternalLink className="w-5 h-5" />
                            </RippleButton>

                            <Link href={`/canvas?challenge=Practice ${course.title}`} className="flex-1 md:flex-none">
                                <button className="w-full md:w-auto px-8 py-4 bg-surface/50 backdrop-blur-md border border-white/10 text-white font-bold rounded-xl hover:bg-surface hover:border-white/20 transition-all flex items-center justify-center gap-2 text-lg">
                                    <Code2 className="w-5 h-5" /> Practice on Canvas
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Course */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-surface border border-border rounded-2xl p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-accent" />
                                About this Course
                            </h2>
                            <p className="text-text-secondary leading-relaxed text-lg">
                                {course.description}
                            </p>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.benefits?.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                        <span className="text-text-secondary">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Prerequisites */}
                        {course.prerequisites && course.prerequisites.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-surface border border-border rounded-2xl p-8"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Layers className="w-6 h-6 text-accent" />
                                    Prerequisites
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {course.prerequisites.map((prereq, index) => (
                                        <span key={index} className="px-4 py-2 rounded-lg bg-surface-hover border border-white/5 text-text-secondary font-medium">
                                            {prereq}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Career Relevance */}
                        {course.careerRelevance && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-surface to-surface-hover border border-border rounded-2xl p-8"
                            >
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-accent" />
                                    Career Path
                                </h2>
                                <p className="text-text-secondary mb-4">
                                    This course is designed to help you prepare for roles such as:
                                </p>
                                <div className="inline-block px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-lg">
                                    {course.careerRelevance}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Course Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-surface border border-border rounded-2xl p-6 sticky top-24"
                        >
                            <div className="aspect-video rounded-xl overflow-hidden mb-6 relative group cursor-pointer">
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="w-16 h-16 text-white" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Duration
                                    </span>
                                    <span className="font-bold text-white">{course.duration}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Certificate
                                    </span>
                                    <span className="font-bold text-white">Yes</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                    <span className="text-text-secondary flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> Type
                                    </span>
                                    <span className="font-bold text-white">{course.type}</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="font-bold text-white mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags?.map((tag, i) => (
                                        <span key={i} className="text-xs font-medium px-2.5 py-1 rounded bg-white/5 text-text-secondary border border-white/5">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleShare}
                                className="w-full mt-6 py-3 rounded-xl border border-white/10 text-text-secondary hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Share Course'}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
