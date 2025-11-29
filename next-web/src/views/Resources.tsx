'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, Lightbulb, Quote, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resources } from '../data/mockData';
import motivationData from '../data/motivation.json';
import tipsData from '../data/tips.json';
import MotivationCard from '../components/MotivationCard';
import TipCard from '../components/TipCard';
import ResourceCard from '../components/ResourceCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Resources() {
    const [activeTab, setActiveTab] = useState('Resources');
    const [search, setSearch] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsUnlocked(localStorage.getItem('vault_unlocked') === 'true');
    }, []);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretCode === 'Diwa') {
            setIsUnlocked(true);
            setError('');
            localStorage.setItem('vault_unlocked', 'true');
        } else {
            if (failedAttempts >= 1) {
                window.location.href = 'https://youtu.be/dQw4w9WgXcQ?si=Kmovl8tb_hAMgoRA';
            } else {
                setFailedAttempts(prev => prev + 1);
                setError('Access Denied. Invalid Clearance Code.');
            }
        }
    };

    // Resources Logic
    const filteredResources = useMemo(() => resources.filter(resource =>
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()) ||
        resource.type.toLowerCase().includes(search.toLowerCase())
    ), [search]);

    const filteredMotivation = useMemo(() => motivationData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.person.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ), [search]);

    const filteredTips = useMemo(() => tipsData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ), [search]);

    if (!isUnlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md w-full mx-4"
                >
                    <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">The Vault</h1>
                            <p className="text-muted-foreground">Restricted Access. Enter clearance code.</p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value)}
                                    placeholder="Enter Access Code"
                                    className="text-center text-lg font-bold tracking-widest pr-10"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-destructive text-sm text-center font-medium"
                                >
                                    {error}
                                </motion.p>
                            )}
                            <Button
                                type="submit"
                                className="w-full text-lg font-bold py-6"
                                size="lg"
                            >
                                Unlock Vault <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 pt-24 bg-background">
            <div className="relative py-12 mb-8 text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground tracking-tight">
                    The <span className="text-primary">Vault</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Curated learning paths, legendary channels, and essential guides to master your craft.
                </p>
            </div>

            <div className="container mx-auto px-4">
                <Tabs defaultValue="Resources" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 sticky top-24 z-30 bg-background/80 backdrop-blur-md p-4 rounded-lg border border-border shadow-sm">
                        <TabsList>
                            <TabsTrigger value="Resources" className="flex gap-2">
                                <BookOpen className="w-4 h-4" /> Resources
                            </TabsTrigger>
                            <TabsTrigger value="Motivation" className="flex gap-2">
                                <Quote className="w-4 h-4" /> Motivation
                            </TabsTrigger>
                            <TabsTrigger value="Tips" className="flex gap-2">
                                <Lightbulb className="w-4 h-4" /> Tips
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={`Search ${activeTab.toLowerCase()}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <TabsContent value="Resources" className="mt-0">
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredResources.map((resource) => (
                                        <ResourceCard key={resource.id} resource={resource} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="Motivation" className="mt-0">
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredMotivation.map((item, index) => (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <MotivationCard item={item} index={index} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="Tips" className="mt-0">
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredTips.map((item, index) => (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <TipCard item={item} index={index} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </div>
        </div>
    );
}
