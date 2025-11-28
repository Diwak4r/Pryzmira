'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code2, BrainCircuit, Cloud, Server, Shield, Globe } from 'lucide-react';

const roadmapData = [
    {
        id: 1,
        title: "Foundations of Computer Science",
        description: "Master the basics of programming, algorithms, and data structures.",
        icon: Code2,
        status: "completed",
        topics: ["Python/C++", "Data Structures", "Algorithms", "Git & GitHub"]
    },
    {
        id: 2,
        title: "Web Development Fundamentals",
        description: "Learn how the web works and build your first websites.",
        icon: Globe,
        status: "in-progress",
        topics: ["HTML/CSS", "JavaScript", "React Basics", "Responsive Design"]
    },
    {
        id: 3,
        title: "Backend & Databases",
        description: "Build robust server-side applications and manage data.",
        icon: Server,
        status: "locked",
        topics: ["Node.js/Express", "SQL vs NoSQL", "API Design", "Authentication"]
    },
    {
        id: 4,
        title: "Advanced AI & Machine Learning",
        description: "Dive into the world of AI, neural networks, and deep learning.",
        icon: BrainCircuit,
        status: "locked",
        topics: ["Python for ML", "TensorFlow/PyTorch", "NLP", "Computer Vision"]
    },
    {
        id: 5,
        title: "Cloud & DevOps",
        description: "Deploy and scale your applications like a pro.",
        icon: Cloud,
        status: "locked",
        topics: ["AWS/Azure", "Docker & Kubernetes", "CI/CD Pipelines", "Monitoring"]
    },
    {
        id: 6,
        title: "Cybersecurity & Ethics",
        description: "Secure your applications and understand ethical AI.",
        icon: Shield,
        status: "locked",
        topics: ["Network Security", "Ethical Hacking", "AI Ethics", "Data Privacy"]
    }
];

export default function Roadmap() {
    return (
        <div className="min-h-screen bg-background pb-20 pt-10">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-primary mb-6">
                        Your Learning <span className="text-accent">Journey</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        A structured path to mastery. Follow this roadmap to go from beginner to industry-ready engineer.
                    </p>
                </motion.div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-border/30 -translate-x-1/2 md:translate-x-0" />

                    <div className="space-y-12">
                        {roadmapData.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Timeline Node */}
                                <div className="absolute left-8 md:left-1/2 top-8 w-8 h-8 -translate-x-1/2 bg-background border-4 border-accent rounded-full z-10 flex items-center justify-center">
                                    {step.status === 'completed' && <div className="w-3 h-3 bg-accent rounded-full" />}
                                    {step.status === 'in-progress' && <div className="w-3 h-3 bg-accent/50 rounded-full animate-pulse" />}
                                </div>

                                {/* Content Card */}
                                <div className="ml-20 md:ml-0 md:w-1/2">
                                    <div className={`p-6 rounded-2xl border ${step.status === 'locked'
                                        ? 'bg-surface/30 border-border/30 opacity-70'
                                        : 'bg-surface border-border hover:border-accent/50 shadow-lg'
                                        } transition-all duration-300 group`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${step.status === 'locked' ? 'bg-white/5' : 'bg-accent/10 text-accent'
                                                }`}>
                                                <step.icon className="w-6 h-6" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${step.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                step.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-white/5 text-text-secondary'
                                                }`}>
                                                {step.status.replace('-', ' ')}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                                            {step.description}
                                        </p>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Key Topics</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {step.topics.map((topic, i) => (
                                                    <span key={i} className="px-2 py-1 rounded bg-background border border-white/5 text-xs text-text-secondary font-medium">
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {step.status !== 'locked' && (
                                            <button className="mt-6 w-full py-2 rounded-lg bg-accent/10 text-accent font-bold text-sm hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2">
                                                {step.status === 'completed' ? 'Review Module' : 'Continue Learning'}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Spacer for the other side */}
                                <div className="hidden md:block md:w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
