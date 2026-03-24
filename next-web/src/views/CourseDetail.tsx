'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowUpRight,
    Bookmark,
    BookmarkCheck,
    BookOpen,
    Check,
    CheckCircle2,
    Clock3,
    Globe,
    Share2,
    Star,
    Users,
} from 'lucide-react';
import coursesData from '@/data/courses.json';
import {
    isCourseSaved,
    subscribeToPersonalDataUpdates,
    toggleSavedCourse,
} from '@/lib/personalDesk';
import { saveRecentCourse } from '@/lib/recentlyViewed';
import { Button } from '@/components/ui/button';

function normalizeCourseImage(image: string | undefined): string {
    if (!image) {
        return '/logo.png';
    }

    if (image.includes('img.youtube.com') && image.includes('maxresdefault.jpg')) {
        return image
            .replace('img.youtube.com', 'i.ytimg.com')
            .replace('maxresdefault.jpg', 'hqdefault.jpg');
    }

    return image;
}

export default function CourseDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const course = useMemo(
        () => coursesData.find((entry) => entry.id === Number(id)),
        [id]
    );

    const relatedCourses = useMemo(() => {
        if (!course) {
            return [];
        }

        return coursesData
            .filter(
                (entry) =>
                    entry.id !== course.id &&
                    (entry.category === course.category ||
                        entry.tags?.some((tag) => course.tags?.includes(tag)))
            )
            .slice(0, 3);
    }, [course]);

    const heroImage = useMemo(() => normalizeCourseImage(course?.image), [course?.image]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!course) {
            return;
        }

        saveRecentCourse({
            id: course.id,
            title: course.title,
            category: course.category,
            instructor: course.instructor,
            image: heroImage,
        });
    }, [course, heroImage]);

    useEffect(() => {
        if (!course) {
            return;
        }

        const syncSavedState = () => {
            setSaved(isCourseSaved(course.id));
        };

        syncSavedState();
        return subscribeToPersonalDataUpdates(syncSavedState);
    }, [course]);

    const handleShare = async () => {
        const url = window.location.href;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: course?.title,
                    text: `Check out this course: ${course?.title}`,
                    url,
                });
                return;
            }

            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleSave = () => {
        if (!course) {
            return;
        }

        toggleSavedCourse({
            id: course.id,
            title: course.title,
            category: course.category,
            instructor: course.instructor,
            image: heroImage,
        });
    };

    if (!course) {
        return (
            <div className="page-shell py-20">
                <div className="paper-panel rounded-[2rem] px-6 py-12 text-center">
                    <h1 className="text-4xl text-display">Course not found</h1>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        The route you opened does not point to a current course entry.
                    </p>
                    <Button className="mt-6 rounded-full" onClick={() => router.push('/categories')}>
                        Return to the atlas
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-16">
            <section className="page-shell space-y-8">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="editorial-link px-0 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to catalog
                </Button>

                <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
                    <div className="space-y-6">
                        <span className="brand-chip">
                            <span className="brand-chip-dot" />
                            {course.category}
                        </span>
                        <div className="space-y-4">
                            <p className="section-kicker">Course brief</p>
                            <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                                {course.title}
                            </h1>
                            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                                {course.description}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{course.instructor}</span>
                            <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-primary" />
                                {course.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {course.students?.toLocaleString()} students
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="rounded-full px-6 py-6 text-sm font-semibold">
                                <a href={course.url} target="_blank" rel="noreferrer" className="editorial-link">
                                    Start learning
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-6 py-6 text-sm font-semibold">
                                <Link href={`/canvas?challenge=Practice ${course.title}`}>
                                    Practice on canvas
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full px-6 py-6 text-sm font-semibold"
                                onClick={handleSave}
                            >
                                {saved ? (
                                    <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                                ) : (
                                    <Bookmark className="mr-2 h-4 w-4" />
                                )}
                                {saved ? 'Saved to desk' : 'Save to desk'}
                            </Button>
                        </div>
                    </div>

                    <div className="paper-panel poster-shadow overflow-hidden rounded-[2rem]">
                        <div className="relative aspect-[4/3] bg-card">
                            <Image
                                src={heroImage}
                                alt={course.title}
                                fill
                                priority
                                className="object-cover"
                            />
                        </div>
                        <div className="grid gap-4 p-6 md:grid-cols-3">
                            <div className="space-y-1 border-t border-border pt-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Difficulty
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                    {course.difficulty}
                                </p>
                            </div>
                            <div className="space-y-1 border-t border-border pt-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Duration
                                </p>
                                <p className="text-lg font-semibold text-foreground">{course.duration}</p>
                            </div>
                            <div className="space-y-1 border-t border-border pt-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    Language
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                    {course.instructor_lang}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="page-shell grid gap-8 lg:grid-cols-[0.96fr_0.74fr]">
                <div className="space-y-8">
                    <article className="paper-panel rounded-[2rem] p-6 md:p-8">
                        <p className="section-kicker">What you get</p>
                        <h2 className="mt-4 text-4xl text-display">Why this course matters</h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {(course.benefits || []).map((benefit) => (
                                <div
                                    key={benefit}
                                    className="rounded-[1.4rem] border border-border bg-background/70 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            {benefit}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    {course.prerequisites && course.prerequisites.length > 0 && (
                        <article className="paper-panel rounded-[2rem] p-6 md:p-8">
                            <p className="section-kicker">Before you begin</p>
                            <h2 className="mt-4 text-4xl text-display">Prerequisites</h2>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {course.prerequisites.map((prerequisite) => (
                                    <span
                                        key={prerequisite}
                                        className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-foreground"
                                    >
                                        {prerequisite}
                                    </span>
                                ))}
                            </div>
                        </article>
                    )}

                    {relatedCourses.length > 0 && (
                        <article className="paper-panel rounded-[2rem] p-6 md:p-8">
                            <p className="section-kicker">Keep the momentum</p>
                            <h2 className="mt-4 text-4xl text-display">Recommended next courses</h2>
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                {relatedCourses.map((entry) => (
                                    <Link
                                        key={entry.id}
                                        href={`/course/${entry.id}`}
                                        className="paper-soft hover-rise rounded-[1.4rem] p-4"
                                    >
                                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                            {entry.category}
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-foreground">
                                            {entry.title}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {entry.instructor}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </article>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="paper-panel rounded-[2rem] p-6">
                        <p className="section-kicker">Course facts</p>
                        <div className="mt-6 space-y-4">
                            <DetailRow icon={<Clock3 className="h-4 w-4" />} label="Duration" value={course.duration} />
                            <DetailRow icon={<BookOpen className="h-4 w-4" />} label="Format" value={course.type} />
                            <DetailRow icon={<Globe className="h-4 w-4" />} label="Language" value={course.instructor_lang} />
                            <DetailRow
                                icon={<Users className="h-4 w-4" />}
                                label="Audience"
                                value={`${course.students?.toLocaleString() || '0'} enrolled`}
                            />
                        </div>
                    </div>

                    <div className="paper-soft rounded-[2rem] p-6">
                        <p className="section-kicker">Tags</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {(course.tags || []).map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-6 w-full rounded-full"
                            onClick={handleShare}
                        >
                            {copied ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Share2 className="mr-2 h-4 w-4" />}
                            {copied ? 'Link copied' : 'Share course'}
                        </Button>
                    </div>
                </aside>
            </section>
        </div>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    );
}
