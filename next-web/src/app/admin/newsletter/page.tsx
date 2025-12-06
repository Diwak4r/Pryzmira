'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Users, Mail, CheckCircle, XCircle, Loader2, Plus, Trash2 } from 'lucide-react';

export default function NewsletterAdmin() {
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
            .map(e => e.trim().toLowerCase())
            .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
            .filter(e => !subscribers.includes(e));

        if (emails.length > 0) {
            setSubscribers([...subscribers, ...emails]);
            setBulkEmails('');
        }
    };

    const removeEmail = (email: string) => {
        setSubscribers(subscribers.filter(e => e !== email));
    };

    const sendNewsletter = async () => {
        if (subscribers.length === 0) {
            alert('Add at least one subscriber first!');
            return;
        }

        setIsSending(true);
        setSendResult(null);

        try {
            const response = await fetch('/api/cron/send-newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Mail className="w-8 h-8 text-primary" />
                    Newsletter Admin
                </h1>
                <p className="text-muted-foreground">
                    Manage subscribers and send newsletters via Resend.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Add Single Email */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add Subscriber
                        </CardTitle>
                        <CardDescription>Add individual email addresses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                            />
                            <Button onClick={addEmail}>Add</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Add */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Bulk Add Subscribers
                        </CardTitle>
                        <CardDescription>
                            Paste multiple emails (comma or newline separated)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full h-32 p-3 rounded-md border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                            value={bulkEmails}
                            onChange={(e) => setBulkEmails(e.target.value)}
                        />
                        <Button onClick={addBulkEmails} className="mt-3">
                            Add All Emails
                        </Button>
                    </CardContent>
                </Card>

                {/* Subscriber List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Subscribers ({subscribers.length})
                        </CardTitle>
                        <CardDescription>
                            Current list of recipients for the newsletter
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subscribers.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-4 text-center">
                                No subscribers yet. Add emails above.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {subscribers.map((email) => (
                                    <div
                                        key={email}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                    >
                                        <span className="text-sm font-mono">{email}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeEmail(email)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Send Newsletter */}
                <Card className="border-primary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Send Newsletter
                        </CardTitle>
                        <CardDescription>
                            Send the weekly newsletter to all subscribers above
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={sendNewsletter}
                            disabled={isSending || subscribers.length === 0}
                            className="w-full"
                            size="lg"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Sending to {subscribers.length} subscribers...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Send Newsletter to {subscribers.length} Subscribers
                                </>
                            )}
                        </Button>

                        {/* Results */}
                        {sendResult && (
                            <div
                                className={`mt-4 p-4 rounded-lg ${sendResult.success
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-destructive/10 border border-destructive/20'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {sendResult.success ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-destructive" />
                                    )}
                                    <span className="font-medium">{sendResult.message}</span>
                                </div>

                                {sendResult.stats && (
                                    <div className="text-sm text-muted-foreground mb-3">
                                        Total: {sendResult.stats.total} | Sent: {sendResult.stats.sent} | Failed: {sendResult.stats.failed}
                                    </div>
                                )}

                                {sendResult.details && (
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                        {sendResult.details.map((detail, i) => (
                                            <div
                                                key={i}
                                                className={`text-sm flex items-center gap-2 ${detail.status === 'sent'
                                                    ? 'text-emerald-500'
                                                    : 'text-destructive'
                                                    }`}
                                            >
                                                {detail.status === 'sent' ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {detail.email}
                                                {detail.error && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({detail.error})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
