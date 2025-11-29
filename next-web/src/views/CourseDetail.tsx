'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
    ArrowLeft, Clock, Users, Star, Globe, CheckCircle2,
    BookOpen, Code2, ExternalLink, Zap, Award,
    Layers, Share2, Check
} from 'lucide-react';
import coursesData from '../data/courses.json';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                <Button
                    onClick={() => router.push('/categories')}
                >
                    Back to Courses
                </Button>
            </div>
        );
    }

    const difficultyVariant = {
        'Beginner': 'default',
        'Intermediate': 'secondary',
        'Advanced': 'destructive'
    }[course.difficulty] || 'outline';

    return (
        <div className="min-h-screen bg-background pb-20 pt-24">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8 group pl-0 hover:pl-2 transition-all"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Courses
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge variant={difficultyVariant as "default" | "secondary" | "destructive" | "outline"}>
                                    {course.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                    {course.category}
                                </Badge>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                                {course.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`}
                                        alt={course.instructor}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <span className="font-medium text-foreground">{course.instructor}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                    <span className="font-bold text-foreground">{course.rating}</span>
                                    <span className="text-sm">({course.reviewCount?.toLocaleString()} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <span>{course.students?.toLocaleString()} students</span>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="aspect-video relative rounded-lg overflow-hidden mb-8 border border-border shadow-sm">
                            <Image
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 mb-12">
                            <Button
                                onClick={() => window.open(course.url, '_blank')}
                                size="lg"
                                className="flex-1 md:flex-none text-lg px-8"
                            >
                                Start Learning <ExternalLink className="w-5 h-5 ml-2" />
                            </Button>

                            <Button asChild variant="secondary" size="lg" className="flex-1 md:flex-none text-lg px-8">
                                <Link href={`/canvas?challenge=Practice ${course.title}`}>
                                    <Code2 className="w-5 h-5 mr-2" /> Practice on Canvas
                                </Link>
                            </Button>
                        </div>

                        {/* About */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                About this Course
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                                {course.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.benefits?.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Prerequisites */}
                        {course.prerequisites && course.prerequisites.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Layers className="w-6 h-6" />
                                    Prerequisites
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {course.prerequisites.map((prereq, index) => (
                                        <Badge key={index} variant="secondary" className="text-base py-1 px-3">
                                            {prereq}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Duration
                                    </span>
                                    <span className="font-medium text-foreground">{course.duration}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Certificate
                                    </span>
                                    <span className="font-medium text-foreground">Yes</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> Type
                                    </span>
                                    <span className="font-medium text-foreground">{course.type}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Globe className="w-4 h-4" /> Language
                                    </span>
                                    <span className="font-medium text-foreground">{course.instructor_lang}</span>
                                </div>

                                <div className="pt-4">
                                    <h3 className="font-bold text-foreground mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {course.tags?.map((tag, index) => (
                                            <Badge key={index} variant="outline">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleShare}
                                    className="w-full mt-6"
                                >
                                    {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Share2 className="w-4 h-4 mr-2" />}
                                    {copied ? 'Copied!' : 'Share Course'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
