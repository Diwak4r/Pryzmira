import { NextResponse } from 'next/server';

// Newsletter content template
const getNewsletterContent = () => {
    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return {
        subject: `🚀 Pryzmira Weekly: AI & Tech Insights - ${date}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                            ✨ Pryzmira Weekly
                        </h1>
                        <p style="color: #888; font-size: 14px; margin-top: 8px;">
                            ${date}
                        </p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #333; margin-bottom: 24px;">
                        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">
                            This Week in AI & Tech 🔥
                        </h2>
                        
                        <p style="color: #cccccc; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                            Here's your curated roundup of the most exciting developments in AI, technology, and engineering this week.
                        </p>

                        <!-- Section 1: AI Updates -->
                        <div style="margin-bottom: 30px; padding: 20px; background: rgba(0, 212, 255, 0.05); border-radius: 12px; border-left: 4px solid #00d4ff;">
                            <h3 style="color: #00d4ff; font-size: 18px; margin: 0 0 12px 0;">
                                🤖 AI Spotlight
                            </h3>
                            <p style="color: #cccccc; font-size: 15px; line-height: 1.6; margin: 0;">
                                Explore the latest AI tools and breakthroughs on our platform. From cutting-edge language models to revolutionary image generators - we've curated the best for you.
                            </p>
                        </div>

                        <!-- Section 2: New Courses -->
                        <div style="margin-bottom: 30px; padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px; border-left: 4px solid #667eea;">
                            <h3 style="color: #667eea; font-size: 18px; margin: 0 0 12px 0;">
                                📚 Featured Learning
                            </h3>
                            <p style="color: #cccccc; font-size: 15px; line-height: 1.6; margin: 0;">
                                New courses added! Level up your skills with our hand-picked selection covering System Design, DSA, Web Development, and more.
                            </p>
                        </div>

                        <!-- Section 3: Community -->
                        <div style="margin-bottom: 30px; padding: 20px; background: rgba(118, 75, 162, 0.05); border-radius: 12px; border-left: 4px solid #764ba2;">
                            <h3 style="color: #764ba2; font-size: 18px; margin: 0 0 12px 0;">
                                🛠️ Pro Tip of the Week
                            </h3>
                            <p style="color: #cccccc; font-size: 15px; line-height: 1.6; margin: 0;">
                                Check out our Canvas tool - a free, powerful drawing and brainstorming tool built right into Pryzmira. Perfect for system design interviews!
                            </p>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://pryzmira.vercel.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Explore Pryzmira →
                            </a>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">Quick Links</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                            <a href="https://pryzmira.vercel.app/courses" style="color: #00d4ff; text-decoration: none; font-size: 14px;">📖 Courses</a>
                            <span style="color: #333;">|</span>
                            <a href="https://pryzmira.vercel.app/ai-tools" style="color: #00d4ff; text-decoration: none; font-size: 14px;">🤖 AI Tools</a>
                            <span style="color: #333;">|</span>
                            <a href="https://pryzmira.vercel.app/resources" style="color: #00d4ff; text-decoration: none; font-size: 14px;">📚 Resources</a>
                            <span style="color: #333;">|</span>
                            <a href="https://pryzmira.vercel.app/canvas" style="color: #00d4ff; text-decoration: none; font-size: 14px;">🎨 Canvas</a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
                        <p style="color: #666; font-size: 13px; margin: 0 0 8px 0;">
                            You're receiving this because you subscribed to Pryzmira newsletter.
                        </p>
                        <p style="color: #666; font-size: 13px; margin: 0;">
                            © ${new Date().getFullYear()} Pryzmira. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// Send email to a single recipient
async function sendEmail(to: string, subject: string, html: string, apiKey: string, fromEmail: string) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            from: `Pryzmira Newsletter <${fromEmail}>`,
            to: [to],
            subject,
            html
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
    }

    return result;
}

export async function POST(request: Request) {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow requests from Vercel Cron or with valid secret
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const API_KEY = process.env.RESEND_API_KEY;
        const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        if (!API_KEY) {
            return NextResponse.json(
                { error: 'RESEND_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Get subscribers from request body or use default test list
        const body = await request.json().catch(() => ({}));
        let subscribers: string[] = body.subscribers || [];

        // If no subscribers provided, use the test/production list
        if (subscribers.length === 0) {
            // You can manually add subscribers here or fetch from a database
            // For now, we'll return an error if no subscribers provided
            return NextResponse.json(
                { error: 'No subscribers provided. Send a POST request with { "subscribers": ["email1", "email2", ...] }' },
                { status: 400 }
            );
        }

        const newsletter = getNewsletterContent();
        const results: { email: string; status: string; error?: string; id?: string }[] = [];

        // Send to each subscriber (with rate limiting for Resend free tier: 100 emails/day)
        for (const email of subscribers) {
            try {
                const result = await sendEmail(
                    email,
                    newsletter.subject,
                    newsletter.html,
                    API_KEY,
                    FROM_EMAIL
                );

                results.push({
                    email,
                    status: 'sent',
                    id: result.id
                });

                console.log(`[Newsletter] ✅ Sent to: ${email}`);

                // Small delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({
                    email,
                    status: 'failed',
                    error: errorMessage
                });
                console.error(`[Newsletter] ❌ Failed for ${email}:`, errorMessage);
            }
        }

        const successCount = results.filter(r => r.status === 'sent').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        return NextResponse.json({
            success: true,
            message: `Newsletter sent to ${successCount}/${subscribers.length} subscribers`,
            stats: {
                total: subscribers.length,
                sent: successCount,
                failed: failedCount
            },
            details: results
        });

    } catch (error) {
        console.error('[Newsletter] Cron error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint for health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Newsletter cron endpoint is active. Use POST to send newsletters.',
        usage: 'POST with body: { "subscribers": ["email1@example.com", "email2@example.com"] }'
    });
}
