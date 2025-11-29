import { memo, useState } from 'react';
import Image from 'next/image';
import { Star, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    index?: number;
    isCompact?: boolean;
}

const CourseCard = ({
    course,
    // index,
    isCompact = false,
}: CourseCardProps) => {
    const [imgSrc, setImgSrc] = useState(course.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

    if (isCompact) {
        return (
            <Link href={`/course/${course.id}`} className="block h-full">
                <Card className="group flex gap-3 p-2 hover:bg-accent/50 transition-colors h-full border-border">
                    <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
                        <Image
                            src={imgSrc}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="96px"
                            onError={() => setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80')}
                        />
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium h-5">
                                    {course.difficulty}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                                    {course.rating?.toFixed(1) || 'N/A'}
                                </span>
                            </div>
                            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {course.title}
                            </h3>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-medium text-foreground">View</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Card>
            </Link>
        );
    }

    return (
        <Link href={`/course/${course.id}`} className="block h-full">
            <Card className="group flex flex-col h-full overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                {/* Image Section */}
                <div className="relative aspect-video w-full overflow-hidden border-b border-border">
                    <Image
                        src={imgSrc}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        onError={() => setImgSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80')}
                    />
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="backdrop-blur-sm bg-background/90 text-foreground shadow-sm text-xs px-2 py-0.5">
                            {course.category}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="flex flex-col flex-1 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 h-5">
                            {course.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-muted-foreground font-normal">
                                ({course.students ? (course.students > 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students) : 'N/A'})
                            </span>
                        </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {course.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                        by {course.instructor}
                    </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration}</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View <ArrowRight className="w-3 h-3" />
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
};

export default memo(CourseCard);
