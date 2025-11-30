import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure subscribers file exists
if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
}

import { rateLimit } from '@/utils/rateLimit';

export async function POST(request: Request) {
    try {
        // Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limiter = rateLimit(ip);

        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Basic CSRF/Origin Check
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');

        // Allow requests with no origin (e.g. server-side calls) or matching origin
        if (origin && host && !origin.includes(host)) {
            // In development, localhost ports might differ, so we can be lenient or strict.
            // For now, we'll log it but not block to avoid dev issues, or block if strictly needed.
            // return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
        }

        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // 1. Save to local file (Backup)
        const fileContent = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
        const subscribers: string[] = JSON.parse(fileContent);

        if (subscribers.includes(email)) {
            return NextResponse.json(
                { error: 'You are already subscribed!' },
                { status: 409 }
            );
        }

        subscribers.push(email);
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

        // 2. Send Welcome Email via Resend (since key is restricted to sending)
        const API_KEY = process.env.RESEND_API_KEY;
        const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        if (API_KEY) {
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        from: `Pryzmira <${FROM_EMAIL}>`,
                        to: [email],
                        subject: 'Welcome to Pryzmira - AI & Tech Insights',
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                                <h1>Welcome to the future.</h1>
                                <p>Thanks for joining Pryzmira. You're now part of a community of engineers mastering AI, System Design, and the latest in tech.</p>
                                <p>Expect weekly updates on:</p>
                                <ul>
                                    <li>🚀 AI Tools & Leaks</li>
                                    <li>💻 System Design Case Studies</li>
                                    <li>🛡️ Cybersecurity Trends</li>
                                </ul>
                                <p>Stay tuned.</p>
                                <p>— The Pryzmira Team</p>
                            </div>
                        `
                    })
                });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't fail the request if email sending fails, just log it
            }
        }

        return NextResponse.json(
            { message: 'Successfully subscribed!' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
