import { NextResponse } from 'next/server';
import { getSubscribers, isSubscriberStoreConfigurationError } from '@/lib/db';
import {
    buildStrategyBrief,
    buildStrategyPlan,
    type StrategyBriefRecord,
    type StrategyProfileRecord,
} from '@/lib/strategy';
import { listStrategyProfilesForBriefs, saveStrategyBrief } from '@/lib/strategyStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailContent {
    html: string;
    subject: string;
}

interface CampaignRecipient {
    content: EmailContent;
    email: string;
    type: 'generic' | 'strategy';
}

function normalizeSubscribers(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const normalized = value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => EMAIL_REGEX.test(email));

    return Array.from(new Set(normalized));
}

function isStrategyConfigurationError(error: unknown): boolean {
    return error instanceof Error && error.message.toLowerCase().includes('not configured');
}

function getAuthorizationError(request: Request): NextResponse | null {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (!cronSecret) {
        return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null;
}

function getBaseEmailLayout(title: string, body: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f7f2e8;font-family:Inter,Arial,sans-serif;color:#1f1a17;">
  <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
    <div style="padding:28px;border-radius:24px;background:#fff8ef;border:1px solid #eadfce;">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6b5c;">Pryzmira</p>
      <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;">${title}</h1>
      ${body}
    </div>
  </div>
</body>
</html>`;
}

function getGenericBriefContent(siteUrl: string): EmailContent {
    return {
        subject: 'Pryzmira Weekly Workspace Brief',
        html: getBaseEmailLayout(
            'A sharper AI workspace note for this week.',
            `<p style="margin:0 0 16px;line-height:1.7;color:#4d433a;">Pryzmira is evolving into an AI workspace platform built around clearer execution, better tool judgment, and weekly momentum.</p>
             <p style="margin:0 0 16px;line-height:1.7;color:#4d433a;">This week, use the workspace to decide one AI outcome, tighten your stack, and spend time only where the signal is high.</p>
             <div style="margin:24px 0;padding:18px;border-radius:18px;background:#f3eadc;">
               <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6b5c;">Suggested loop</p>
               <p style="margin:0 0 8px;line-height:1.7;">1. Open the workspace and define one AI mission.</p>
               <p style="margin:0 0 8px;line-height:1.7;">2. Pull one course or tool from the atlas that directly supports it.</p>
               <p style="margin:0;line-height:1.7;">3. Produce one visible output before the week ends.</p>
             </div>
             <a href="${siteUrl}" style="display:inline-block;margin-top:8px;padding:14px 22px;border-radius:999px;background:#1f1a17;color:#fff8ef;text-decoration:none;font-weight:600;">Open Pryzmira</a>`
        ),
    };
}

function getStrategyBriefContent(
    profile: StrategyProfileRecord,
    brief: StrategyBriefRecord,
    siteUrl: string
): EmailContent {
    const firstName = profile.fullName.split(' ')[0];
    const actions = brief.plan.nextActions
        .slice(0, 3)
        .map(
            (action, index) =>
                `<p style="margin:0 0 10px;line-height:1.7;color:#4d433a;">${index + 1}. ${action}</p>`
        )
        .join('');
    const picks = [
        ...brief.plan.recommendations.courses.slice(0, 1),
        ...brief.plan.recommendations.tools.slice(0, 1),
        ...brief.plan.recommendations.resources.slice(0, 1),
    ]
        .map(
            (item) =>
                `<p style="margin:0 0 10px;line-height:1.7;color:#4d433a;"><strong>${item.title}</strong> — ${item.reason}</p>`
        )
        .join('');

    return {
        subject: brief.subject,
        html: getBaseEmailLayout(
            `${firstName}, here is your Pryzmira workspace brief.`,
            `<p style="margin:0 0 16px;line-height:1.7;color:#4d433a;">${brief.plan.summary}</p>
             <div style="margin:24px 0;padding:18px;border-radius:18px;background:#f3eadc;">
               <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6b5c;">Sprint focus</p>
               <p style="margin:0;line-height:1.7;color:#1f1a17;">${brief.plan.sprintFocus}</p>
             </div>
             <div style="margin:24px 0;">
               <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6b5c;">Next actions</p>
               ${actions}
             </div>
             <div style="margin:24px 0;">
               <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6b5c;">Key picks</p>
               ${picks}
             </div>
             <p style="margin:0 0 18px;line-height:1.7;color:#4d433a;">${brief.plan.monetizationHook}</p>
             <a href="${siteUrl}/desk?profileId=${encodeURIComponent(profile.id)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#1f1a17;color:#fff8ef;text-decoration:none;font-weight:600;">Open your workspace</a>`
        ),
    };
}

async function sendEmail(
    to: string,
    content: EmailContent,
    apiKey: string,
    fromEmail: string
) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            from: `Pryzmira <${fromEmail}>`,
            to: [to],
            subject: content.subject,
            html: content.html,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
    }

    return result;
}

async function buildStrategyRecipients(siteUrl: string): Promise<CampaignRecipient[]> {
    const profiles = await listStrategyProfilesForBriefs();
    const recipients: CampaignRecipient[] = [];

    for (const profile of profiles) {
        const plan = buildStrategyPlan(profile);
        const draft = buildStrategyBrief(profile, plan);
        const brief = await saveStrategyBrief(
            profile.id,
            draft.subject,
            draft.preview,
            draft.plan
        );

        recipients.push({
            email: profile.email,
            content: getStrategyBriefContent(profile, brief, siteUrl),
            type: 'strategy',
        });
    }

    return recipients;
}

async function dispatchCampaign(recipients: CampaignRecipient[]) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (!apiKey) {
        return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    if (recipients.length === 0) {
        return NextResponse.json(
            { error: 'No recipients available for this campaign.' },
            { status: 400 }
        );
    }

    const results: Array<{
        email: string;
        status: 'failed' | 'sent';
        type: 'generic' | 'strategy';
        error?: string;
        id?: string;
    }> = [];

    for (const recipient of recipients) {
        try {
            const result = await sendEmail(
                recipient.email,
                recipient.content,
                apiKey,
                fromEmail
            );
            results.push({
                email: recipient.email,
                id: result.id,
                status: 'sent',
                type: recipient.type,
            });
        } catch (error) {
            results.push({
                email: recipient.email,
                error: error instanceof Error ? error.message : 'Unknown error',
                status: 'failed',
                type: recipient.type,
            });
        }
    }

    const sent = results.filter((result) => result.status === 'sent').length;
    const failed = results.length - sent;

    return NextResponse.json({
        success: failed === 0,
        message: `Workspace brief campaign sent to ${sent}/${results.length} recipients`,
        stats: {
            total: results.length,
            sent,
            failed,
        },
        details: results,
    });
}

async function handleSend(request: Request, body?: unknown) {
    const authError = getAuthorizationError(request);
    if (authError) {
        return authError;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pryzmira.vercel.app';

    try {
        const manualSubscribers = normalizeSubscribers(
            typeof body === 'object' && body !== null && 'subscribers' in body
                ? (body as { subscribers?: unknown }).subscribers
                : undefined
        );

        if (manualSubscribers.length > 0) {
            return dispatchCampaign(
                manualSubscribers.map((email) => ({
                    email,
                    content: getGenericBriefContent(siteUrl),
                    type: 'generic',
                }))
            );
        }

        const strategyRecipients = await buildStrategyRecipients(siteUrl);
        const strategyEmails = new Set(strategyRecipients.map((recipient) => recipient.email));

        let genericRecipients: CampaignRecipient[] = [];

        try {
            genericRecipients = (await getSubscribers())
                .filter((email) => !strategyEmails.has(email))
                .map((email) => ({
                    email,
                    content: getGenericBriefContent(siteUrl),
                    type: 'generic' as const,
                }));
        } catch (error) {
            if (!isSubscriberStoreConfigurationError(error) || strategyRecipients.length === 0) {
                throw error;
            }
        }

        return dispatchCampaign([...strategyRecipients, ...genericRecipients]);
    } catch (error) {
        if (isSubscriberStoreConfigurationError(error) || isStrategyConfigurationError(error)) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Storage is not configured.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Unable to send the workspace brief campaign.' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    return handleSend(request, body);
}

export async function GET(request: Request) {
    return handleSend(request);
}
