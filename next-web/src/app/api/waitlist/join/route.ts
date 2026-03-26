import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { joinWaitlist } from '@/lib/waitlistStore';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pryzmira.diwakaryadav.com.np';

function getResendClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
}

interface JoinWaitlistRequest {
    email: string;
    name?: string;
    referredBy?: string;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendWaitlistEmail(
    email: string,
    name: string | null,
    position: number,
    referralCode: string
): Promise<void> {
    const resend = getResendClient();
    if (!resend) {
        console.warn('[Waitlist] Resend not configured, skipping email');
        return;
    }

    const referralUrl = `${SITE_URL}/?ref=${referralCode}`;
    const displayName = name || 'there';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're on the Pryzmira Pro waitlist</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <tr>
                        <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Pryzmira Pro</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">Hi ${displayName},</h2>
                            <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">You're officially on the Pryzmira Pro waitlist!</p>

                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 30px 0; text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Position</p>
                                <p style="margin: 0; color: #667eea; font-size: 48px; font-weight: 700; line-height: 1;">#${position}</p>
                            </div>

                            <h3 style="margin: 30px 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">What's included in Pro:</h3>
                            <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                                <li style="margin-bottom: 8px;">Weekly personalized strategy briefs delivered to your inbox</li>
                                <li style="margin-bottom: 8px;">Priority access to new AI tools and courses</li>
                                <li style="margin-bottom: 8px;">Advanced workspace features and automation</li>
                                <li style="margin-bottom: 8px;">Direct support and feedback channel</li>
                            </ul>

                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0 0 12px 0; color: #92400e; font-size: 15px; font-weight: 600;">Move up the list faster</p>
                                <p style="margin: 0 0 16px 0; color: #78350f; font-size: 14px; line-height: 1.6;">Share your referral link. Each person who joins moves you up 1 spot.</p>
                                <div style="background-color: #ffffff; border-radius: 6px; padding: 12px; font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937; word-break: break-all;">
                                    ${referralUrl}
                                </div>
                            </div>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${referralUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">Share Your Link</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">We'll notify you when it's your turn to access Pro. In the meantime, keep building with the free workspace at <a href="${SITE_URL}" style="color: #667eea; text-decoration: none;">Pryzmira</a>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.6;">
                                Pryzmira – Your AI operating desk<br>
                                <a href="${SITE_URL}" style="color: #667eea; text-decoration: none;">pryzmira.diwakaryadav.com.np</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    await resend.emails.send({
        from: 'Pryzmira <noreply@pryzmira.diwakaryadav.com.np>',
        to: email,
        subject: "You're on the Pryzmira Pro waitlist",
        html: htmlContent,
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as JoinWaitlistRequest;

        if (!body.email || !isValidEmail(body.email)) {
            return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
        }

        const email = body.email.toLowerCase().trim();
        const name = body.name?.trim() || null;
        const referredBy = body.referredBy?.trim() || null;

        const entry = await joinWaitlist(email, name, referredBy);

        const referralUrl = `${SITE_URL}/?ref=${entry.referralCode}`;

        const resend = getResendClient();
        if (resend) {
            try {
                await sendWaitlistEmail(email, name, entry.position, entry.referralCode);
            } catch (emailError) {
                console.error('[Waitlist] Failed to send email:', emailError);
            }
        }

        return NextResponse.json({
            position: entry.position,
            referralCode: entry.referralCode,
            referralUrl,
        });
    } catch (error) {
        console.error('[Waitlist] Join error:', error);
        return NextResponse.json(
            { error: 'Unable to join waitlist right now.' },
            { status: 500 }
        );
    }
}
