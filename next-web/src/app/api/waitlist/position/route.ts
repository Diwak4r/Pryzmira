import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistPosition, getReferralCount } from '@/lib/waitlistStore';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pryzmira.diwakaryadav.com.np';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
        }

        const entry = await getWaitlistPosition(email.toLowerCase().trim());

        if (!entry) {
            return NextResponse.json({ error: 'Email not found on waitlist.' }, { status: 404 });
        }

        const referralCount = await getReferralCount(entry.referralCode);
        const referralUrl = `${SITE_URL}/?ref=${entry.referralCode}`;

        return NextResponse.json({
            position: entry.position,
            referralCode: entry.referralCode,
            referralUrl,
            referralCount,
        });
    } catch (error) {
        console.error('[Waitlist] Position error:', error);
        return NextResponse.json(
            { error: 'Unable to fetch waitlist position right now.' },
            { status: 500 }
        );
    }
}
