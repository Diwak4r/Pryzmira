'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Users, Mail, CheckCircle, XCircle, Loader2, Plus, Trash2, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function NewsletterAdminInner() {
    const [isAuthed, setIsAuthed] = useState(false);
    const [adminSecret, setAdminSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [authError, setAuthError] = useState('');
    const [subscribers, setSubscribers] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [bulkEmails, setBulkEmails] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{
        success: boolean;
        message: string;
        stats?: { total: number; sent: number; failed: number };
        details?: { email: string; status: string; error?: string }[];
    } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/subscribe', {
                headers: { Authorization: `Bearer ${adminSecret}` },
            });
            if (res.ok) {
                setIsAuthed(true);
                setAuthError('');
            } else {
                setAuthError('Invalid admin secret.');
            }
        } catch {
            setAuthError('Network error.');
        }
    };

    const addEmail = () => {
        const email = newEmail.trim().toLowerCase();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !subscribers.includes(email)) {
            setSubscribers([...subscribers, email]);
            setNewEmail('');
        }
    };

    const addBulkEmails = () => {
        const emails = bulkEmails
            .split(/[,\n]/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
            .filter((e) => !subscribers.includes(e));

        if (emails.length > 0) {
            setSubscribers([...subscribers, ...emails]);
            setBulkEmails('');
        }
    };

    const removeEmail = (email: string) => {
        setSubscribers(subscribers.filter((e) => e !== email));
    };

    const sendNewsletter = async () => {
        if (subscribers.length === 0) return;
        setIsSending(true);
        setSendResult(null);
        try {
            const response = await fetch('/api/cron/send-newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminSecret}`,
                },
                body: JSON.stringify({ subscribers }),
            });
            const result = await response.json();
            setSendResult({
                success: response.ok,
                message: result.message || result.error,
                stats: result.stats,
                details: result.details,
            });
        } catch (error) {
            setSendResult({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to send newsletter',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {!isAuthed ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Card className="w-full max-w-md p-8">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                                <Lock className="h-7 w-7 text-primary" />
                            </div>
                            <h1 className="mb-1 text-2xl font-bold">Admin Access</h1>
                            <p className="text-sm text-muted-foreground">Enter admin secret to continue</p>
                        </div>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="relative">
                                <Input
                                    type={showSecret ? 'text' : 'password'}
                                    value={adminSecret}
                                    onChange={(e) => setAdminSecret(e.target.value)}
                                    placeholder="Admin Secret"
                                    className="pr-10 text-center"
                                    autoFocus
                                />
                                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showSecret ? 'Hide admin secret' : 'Show admin secret'}>
                                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {authError ? <p className="text-center text-sm text-destructive">{authError}</p> : null}
                            <Button type="submit" className="w-full">
                                Authenticate
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-6">
                    <div className="mb-2">
                        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
                            <Mail className="h-8 w-8 text-primary" />
                            Newsletter Admin
                        </h1>
                        <p className="text-muted-foreground">Manage subscribers and send newsletters via Resend.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Subscriber</CardTitle>
                            <CardDescription>Add individual email addresses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input type="email" placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEmail()} />
                                <Button onClick={addEmail}>Add</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Bulk Add Subscribers</CardTitle>
                            <CardDescription>Paste multiple emails (comma or newline separated)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <textarea className="h-32 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="email1@example.com&#10;email2@example.com" value={bulkEmails} onChange={(e) => setBulkEmails(e.target.value)} />
                            <Button onClick={addBulkEmails} className="mt-3">Add All Emails</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Subscribers ({subscribers.length})</CardTitle>
                            <CardDescription>Current list of recipients for the newsletter</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {subscribers.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No subscribers yet. Add emails above.</p>
                            ) : (
                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                    {subscribers.map((email) => (
                                        <div key={email} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                                            <span className="font-mono text-sm">{email}</span>
                                            <Button variant="ghost" size="sm" onClick={() => removeEmail(email)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-primary/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Send Newsletter</CardTitle>
                            <CardDescription>Send the weekly newsletter to all subscribers above</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={sendNewsletter} disabled={isSending || subscribers.length === 0} className="w-full" size="lg">
                                {isSending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending to {subscribers.length} subscribers...</> : <><Send className="mr-2 h-5 w-5" /> Send Newsletter to {subscribers.length} Subscribers</>}
                            </Button>
                            {sendResult ? (
                                <div className={`mt-4 rounded-lg border p-4 ${sendResult.success ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-destructive/20 bg-destructive/10'}`}>
                                    <div className="mb-2 flex items-center gap-2">
                                        {sendResult.success ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                                        <span className="font-medium">{sendResult.message}</span>
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
