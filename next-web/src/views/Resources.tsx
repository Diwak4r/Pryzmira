'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Eye,
    EyeOff,
    Lightbulb,
    Lock,
    Quote,
    Search,
} from 'lucide-react';
import motivationData from '../data/motivation.json';
import tipsData from '../data/tips.json';
import { resources } from '../data/mockData';
import MotivationCard from '../components/MotivationCard';
import PageHero from '../components/PageHero';
import ResourceCard from '../components/ResourceCard';
import TipCard from '../components/TipCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ResourceTab = 'Resources' | 'Motivation' | 'Tips';

export default function Resources() {
    const [activeTab, setActiveTab] = useState<ResourceTab>('Resources');
    const [search, setSearch] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    const [, setFailedAttempts] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const deferredSearch = useDeferredValue(search);

    useEffect(() => {
        setIsUnlocked(localStorage.getItem('vault_unlocked') === 'true');
    }, []);

    const handleUnlock = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsVerifying(true);
        setError('');

        try {
            const response = await fetch('/api/vault/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: secretCode }),
            });

            if (response.ok) {
                setIsUnlocked(true);
                setFailedAttempts(0);
                localStorage.setItem('vault_unlocked', 'true');
            } else if (response.status === 429) {
                setError('Too many attempts. Wait a moment before trying again.');
            } else {
                setFailedAttempts((previous) => {
                    const nextAttempts = previous + 1;
                    setError(
                        nextAttempts >= 2
                            ? 'Still not the right clearance code.'
                            : 'Access denied. Check the clearance code and try again.'
                    );
                    return nextAttempts;
                });
            }
        } catch {
            setError('Network error. Try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const filteredResources = useMemo(
        () =>
            resources.filter(
                (resource) =>
                    resource.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    resource.description.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    resource.type.toLowerCase().includes(deferredSearch.toLowerCase())
            ),
        [deferredSearch]
    );

    const filteredMotivation = useMemo(
        () =>
            motivationData.filter(
                (item) =>
                    item.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    item.person.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    item.tags.some((tag) => tag.toLowerCase().includes(deferredSearch.toLowerCase()))
            ),
        [deferredSearch]
    );

    const filteredTips = useMemo(
        () =>
            tipsData.filter(
                (item) =>
                    item.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    item.content.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    item.tags.some((tag) => tag.toLowerCase().includes(deferredSearch.toLowerCase()))
            ),
        [deferredSearch]
    );

    if (!isUnlocked) {
        return (
            <div className="section-shell py-10">
                <div className="hero-stage px-6 py-10 md:px-10 md:py-14">
                    <div className="mx-auto max-w-3xl space-y-8 text-center">
                        <p className="brand-chip">
                            <span className="brand-chip-dot" />
                            The vault
                        </p>
                        <h1 className="max-w-4xl text-5xl text-display text-balance md:text-7xl">
                            Private study material, handled like a real archive.
                        </h1>
                        <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                            The vault holds sharper references, study notes, and motivation pieces. Unlock it with the clearance code.
                        </p>

                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleUnlock}
                            className="paper-panel-muted mx-auto max-w-xl space-y-5 rounded-[1.8rem] p-6 text-left md:p-7"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-full border border-border bg-background p-3 text-primary">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Restricted archive
                                    </p>
                                    <p className="text-lg font-semibold text-foreground">
                                        Enter clearance code
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={secretCode}
                                    onChange={(event) => setSecretCode(event.target.value)}
                                    placeholder="Clearance code"
                                    autoComplete="one-time-code"
                                    className="h-14 rounded-full border-border bg-background/90 pr-12 text-center text-base tracking-[0.2em]"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={showPassword ? 'Hide clearance code' : 'Show clearance code'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {error && (
                                <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {error}
                                </p>
                            )}

                            <Button type="submit" className="h-12 w-full rounded-full" disabled={isVerifying}>
                                {isVerifying ? 'Verifying...' : 'Unlock the archive'}
                                {!isVerifying && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </motion.form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <PageHero
                chip="Vault unlocked"
                kicker="Resources and field notes"
                title="The part of Pryzmira that feels like an intelligently packed desk drawer."
                description="Channels, guides, motivational material, and compact advice cards arranged for study sessions, not for vanity metrics."
                stats={[
                    { value: resources.length, label: 'References in the archive' },
                    { value: motivationData.length, label: 'Motivation entries' },
                    { value: tipsData.length, label: 'Compact study tips' },
                ]}
                asideKicker="Archive behavior"
                asideTitle="Search one collection, then move cleanly between resources, motivation, and tips."
                asideBody="The archive is meant to feel organized, private, and immediately useful once unlocked. Every tab supports a different kind of study session."
                highlights={[
                    { label: 'Reference', title: 'Links and channels worth reopening' },
                    { label: 'Motivation', title: 'Quotes and reminders with some staying power' },
                    { label: 'Tips', title: 'Compact operating advice for daily momentum' },
                ]}
                footnote="The point of the vault is not exclusivity. It is calmer curation and faster retrieval."
            />

            <section className="page-shell">
                <Tabs
                    defaultValue="Resources"
                    className="w-full"
                    onValueChange={(value) => setActiveTab(value as ResourceTab)}
                >
                    <div className="paper-panel rounded-[1.9rem] p-5 md:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <TabsList className="flex h-auto flex-wrap gap-2 rounded-full border border-border bg-background/80 p-1">
                                <TabsTrigger value="Resources" className="rounded-full px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Resources
                                </TabsTrigger>
                                <TabsTrigger value="Motivation" className="rounded-full px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                                    <Quote className="mr-2 h-4 w-4" />
                                    Motivation
                                </TabsTrigger>
                                <TabsTrigger value="Tips" className="rounded-full px-4 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                                    <Lightbulb className="mr-2 h-4 w-4" />
                                    Tips
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative w-full lg:w-[320px]">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="h-12 rounded-full border-border bg-background/85 pl-11"
                                />
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <TabsContent value="Resources" className="mt-8">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                            >
                                {filteredResources.map((resource) => (
                                    <ResourceCard key={resource.id} resource={resource} />
                                ))}
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="Motivation" className="mt-8">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                            >
                                {filteredMotivation.map((item, index) => (
                                    <MotivationCard key={item.id} item={item} index={index} />
                                ))}
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="Tips" className="mt-8">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
                            >
                                {filteredTips.map((item, index) => (
                                    <TipCard key={item.id} item={item} index={index} />
                                ))}
                            </motion.div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </section>
        </div>
    );
}
