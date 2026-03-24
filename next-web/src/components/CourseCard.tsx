import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, BookmarkCheck, Clock3, Star, Users } from 'lucide-react';
import {
    isCourseSaved,
    subscribeToPersonalDataUpdates,
    toggleSavedCourse,
} from '@/lib/personalDesk';
import { Badge } from '@/components/ui/badge';

interface Course {
    id: number;
    title: string;
    instructor: string;
    category: string;
    description: string;
    difficulty: string;
    duration: string;
    image?: string;
    rating?: number;
    students?: number;
    tags?: string[];
}

interface CourseCardProps {
    course: Course;
    isCompact?: boolean;
}

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

function formatStudents(value: number | undefined): string {
    if (!value) {
        return 'New';
    }

    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M learners`;
    }

    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}k learners`;
    }

    return `${value} learners`;
}

function CourseCard({ course, isCompact = false }: CourseCardProps) {
    const [imgSrc, setImgSrc] = useState(normalizeCourseImage(course.image));
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const syncSavedState = () => {
            setSaved(isCourseSaved(course.id));
        };

        syncSavedState();
        return subscribeToPersonalDataUpdates(syncSavedState);
    }, [course.id]);

    const handleSave = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        toggleSavedCourse({
            id: course.id,
            title: course.title,
            category: course.category,
            instructor: course.instructor,
            image: imgSrc,
        });
    };

    if (isCompact) {
        return (
            <Link href={`/course/${course.id}`} className="group block">
                <article className="paper-panel hover-rise grid gap-4 rounded-[1.6rem] p-4 md:grid-cols-[168px_1fr] md:items-center">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] border border-border/80 bg-card">
                        <Image
                            src={imgSrc}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="168px"
                            onError={() => setImgSrc('/logo.png')}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                                    {course.category}
                                </Badge>
                                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    {course.difficulty}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleSave}
                                aria-label={saved ? 'Remove course from desk' : 'Save course to desk'}
                                className="rounded-full border border-border bg-background/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {saved ? (
                                    <BookmarkCheck className="h-4 w-4 text-primary" />
                                ) : (
                                    <Bookmark className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold leading-tight text-foreground">
                                {course.title}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                {course.description}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>{course.instructor}</span>
                            <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-primary" />
                                {course.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock3 className="h-4 w-4" />
                                {course.duration}
                            </span>
                            <span className="editorial-link text-foreground">
                                Open course
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        );
    }

    return (
        <Link href={`/course/${course.id}`} className="group block h-full">
            <article className="paper-panel hover-rise flex h-full flex-col overflow-hidden rounded-[1.8rem]">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-border/80 bg-card">
                    <Image
                        src={imgSrc}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        onError={() => setImgSrc('/logo.png')}
                    />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="flex items-center justify-between gap-4">
                        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                            {course.category}
                        </Badge>
                        <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                {course.difficulty}
                            </span>
                            <button
                                type="button"
                                onClick={handleSave}
                                aria-label={saved ? 'Remove course from desk' : 'Save course to desk'}
                                className="rounded-full border border-border bg-background/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {saved ? (
                                    <BookmarkCheck className="h-4 w-4 text-primary" />
                                ) : (
                                    <Bookmark className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-semibold leading-tight text-foreground">
                            {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                    </div>
                    <p className="flex-1 text-sm leading-7 text-muted-foreground">
                        {course.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {(course.tags || []).slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-border bg-background/75 px-3 py-1 text-xs text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="ink-rule" />
                    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-primary" />
                                {course.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {formatStudents(course.students)}
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <Clock3 className="h-4 w-4" />
                            {course.duration}
                        </span>
                    </div>
                    <div className="editorial-link text-sm text-foreground">
                        Open course
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default memo(CourseCard);
