'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code2, BrainCircuit, Cloud, Server, Shield, Globe, Rocket, Heart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const roadmapData = [
    {
        id: 1,
        title: "Foundations of Computer Science",
        description: "Where every great engineer begins. Master the fundamentals that separate good developers from great ones.",
        icon: Code2,
        status: "completed" as const,
        topics: ["Python / C++", "Data Structures", "Algorithms", "Git & GitHub"],
        emotion: "You'll feel the click when recursion suddenly makes sense.",
        link: "/categories?cat=Coding"
    },
    {
        id: 2,
        title: "Web Development",
        description: "Build things people can see and use. There's nothing like shipping your first website.",
        icon: Globe,
        status: "in-progress" as const,
        topics: ["HTML / CSS / JS", "React & Next.js", "Tailwind CSS", "Responsive Design"],
        emotion: "The moment your creation goes live — that rush never gets old.",
        link: "/categories?cat=Web+Dev"
    },
    {
        id: 3,
        title: "Backend & Databases",
        description: "The invisible engine behind every app. Learn to build systems that scale.",
        icon: Server,
        status: "locked" as const,
        topics: ["Node.js / Express", "PostgreSQL / MongoDB", "REST & GraphQL APIs", "Authentication & Security"],
        emotion: "You'll start seeing the world as systems talking to systems.",
        link: "/categories"
    },
    {
        id: 4,
        title: "AI & Machine Learning",
        description: "The most transformative technology of our generation. Don't just use AI — understand it.",
        icon: BrainCircuit,
        status: "locked" as const,
        topics: ["Python for ML", "Neural Networks", "NLP & LLMs", "Computer Vision"],
        emotion: "Training your first model feels like teaching something to think.",
        link: "/categories?cat=AI"
    },
    {
        id: 5,
        title: "Cloud & DevOps",
        description: "Deploy at scale. The bridge between writing code and running production systems.",
        icon: Cloud,
        status: "locked" as const,
        topics: ["AWS / Azure / GCP", "Docker & Kubernetes", "CI/CD Pipelines", "Monitoring & Observability"],
        emotion: "When your app handles 10,000 users without breaking a sweat.",
        link: "/categories?cat=Cloud"
    },
    {
        id: 6,
        title: "Cybersecurity & Ethics",
        description: "With great power comes great responsibility. Learn to protect what you build.",
        icon: Shield,
        status: "locked" as const,
        topics: ["Network Security", "Penetration Testing", "Responsible AI", "Privacy & Compliance"],
        emotion: "You'll never look at a login form the same way again.",
        link: "/categories?cat=Cybersecurity"
    }
];

export default function Roadmap() {
    return (
        <div className="min-h-screen bg-background pb-20 pt-24">
            <div className="container mx-auto px-4">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <Rocket className="w-4 h-4" />
                        Your path from zero to engineer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
                        The Learning Roadmap
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A structured path to mastery. Each step builds on the last.
                        You don't need to rush — consistency beats speed every time.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

                    <div className="space-y-12">
                        {roadmapData.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Timeline Node */}
                                <div className={`absolute left-8 md:left-1/2 top-8 w-8 h-8 -translate-x-1/2 rounded-full z-10 flex items-center justify-center border-4 ${
                                    step.status === 'completed' ? 'bg-green-500 border-green-500/30' :
                                    step.status === 'in-progress' ? 'bg-primary border-primary/30 animate-pulse' :
                                    'bg-muted border-border'
                                }`}>
                                    {step.status === 'completed' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                    {step.status === 'in-progress' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                </div>

                                {/* Content Card */}
                                <div className="ml-20 md:ml-0 md:w-1/2">
                                    <Card className={`p-6 ${
                                        step.status === 'locked'
                                            ? 'opacity-60 border-dashed'
                                            : 'hover:shadow-lg hover:border-primary/30'
                                    } transition-all duration-300 group`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${
                                                step.status === 'locked' ? 'bg-muted text-muted-foreground' :
                                                step.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                'bg-primary/10 text-primary'
                                            }`}>
                                                <step.icon className="w-6 h-6" />
                                            </div>
                                            <Badge variant={
                                                step.status === 'completed' ? 'default' :
                                                step.status === 'in-progress' ? 'secondary' :
                                                'outline'
                                            } className={
                                                step.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                step.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                ''
                                            }>
                                                {step.status === 'completed' ? 'Completed' :
                                                 step.status === 'in-progress' ? 'In Progress' :
                                                 'Coming Soon'}
                                            </Badge>
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Emotional hook */}
                                        <p className="text-xs text-primary/80 italic mb-5 flex items-start gap-2">
                                            <Heart className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                            {step.emotion}
                                        </p>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Topics</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {step.topics.map((topic, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs font-medium">
                                                        {topic}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {step.status !== 'locked' && (
                                            <Button asChild variant="outline" className="w-full mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                <Link href={step.link}>
                                                    {step.status === 'completed' ? 'Review Module' : 'Continue Learning'}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Link>
                                            </Button>
                                        )}
                                    </Card>
                                </div>

                                {/* Spacer for the other side */}
                                <div className="hidden md:block md:w-1/2" />
                            </motion.div>
                        ))}
                    </div>

                    {/* End marker */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-16 pt-8"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium">
                            <Rocket className="w-5 h-5" />
                            This is just the beginning. Keep building.
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
