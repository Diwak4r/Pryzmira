import { NextResponse } from 'next/server';
import {
    addSubscriber,
    getSubscriberCount,
    isSubscriberStoreConfigurationError,
} from '@/lib/db';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const { added, count } = await addSubscriber(normalizedEmail);

        if (!added) {
            return NextResponse.json(
                { error: 'You are already subscribed!' },
                { status: 409 }
            );
        }

        console.log(`[Newsletter] New subscriber: ${normalizedEmail} | Total: ${count}`);

        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pryzmira.vercel.app';

        if (apiKey) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        from: `Pryzmira <${fromEmail}>`,
                        to: [normalizedEmail],
                        subject: 'Welcome to Pryzmira - Your AI & Tech Journey Begins!',
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            </head>
                            <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0a0a0a;">
                                <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
                                    <div style="text-align:center;margin-bottom:40px;">
                                        <h1 style="color:#ffffff;font-size:32px;margin:0;font-weight:700;">Pryzmira</h1>
                                        <p style="color:#888;font-size:14px;margin-top:8px;">AI, Tech & Learning Hub</p>
                                    </div>
                                    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;padding:40px;border:1px solid #333;">
                                        <h2 style="color:#ffffff;font-size:24px;margin:0 0 20px 0;">Welcome to the future.</h2>
                                        <p style="color:#cccccc;font-size:16px;line-height:1.6;margin:0 0 20px 0;">You've just joined an exclusive community of engineers, developers, and tech enthusiasts who are staying ahead of the curve.</p>
                                        <p style="color:#cccccc;font-size:16px;line-height:1.6;margin:0 0 24px 0;">Here's what you'll receive:</p>
                                        <div style="margin-bottom:30px;">
                                            <div style="display:flex;align-items:center;margin-bottom:16px;">
                                                <span style="color:#00d4ff;font-size:20px;margin-right:12px;">*</span>
                                                <span style="color:#ffffff;font-size:15px;">Latest AI Tools & Breakthroughs</span>
                                            </div>
                                            <div style="display:flex;align-items:center;margin-bottom:16px;">
                                                <span style="color:#00d4ff;font-size:20px;margin-right:12px;">*</span>
                                                <span style="color:#ffffff;font-size:15px;">System Design Case Studies</span>
                                            </div>
                                            <div style="display:flex;align-items:center;margin-bottom:16px;">
                                                <span style="color:#00d4ff;font-size:20px;margin-right:12px;">*</span>
                                                <span style="color:#ffffff;font-size:15px;">Cybersecurity Insights</span>
                                            </div>
                                            <div style="display:flex;align-items:center;margin-bottom:16px;">
                                                <span style="color:#00d4ff;font-size:20px;margin-right:12px;">*</span>
                                                <span style="color:#ffffff;font-size:15px;">Curated Learning Resources</span>
                                            </div>
                                        </div>
                                        <a href="${siteUrl}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Explore Pryzmira</a>
                                    </div>
                                    <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #333;">
                                        <p style="color:#666;font-size:13px;margin:0;">You're receiving this because you subscribed at Pryzmira</p>
                                        <p style="color:#666;font-size:13px;margin-top:8px;">&copy; ${new Date().getFullYear()} Pryzmira. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `,
                    }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('[Newsletter] Welcome email failed:', errorBody);
                }
            } catch (emailError) {
                console.error('[Newsletter] Failed to send welcome email:', emailError);
            }
        }

        return NextResponse.json(
            {
                message: 'Successfully subscribed!',
                subscriberCount: count,
            },
            { status: 200 }
        );
    } catch (error) {
        if (isSubscriberStoreConfigurationError(error)) {
            console.error('[Newsletter] Subscriber store unavailable:', error.message);
            return NextResponse.json(
                { error: error.message },
                { status: 503 }
            );
        }

        console.error('[Newsletter] Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const count = await getSubscriberCount();
        return NextResponse.json({ subscriberCount: count });
    } catch (error) {
        if (isSubscriberStoreConfigurationError(error)) {
            console.error('[Newsletter] Subscriber count unavailable:', error.message);
            return NextResponse.json(
                { error: error.message },
                { status: 503 }
            );
        }

        console.error('[Newsletter] Failed to get subscriber count:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
