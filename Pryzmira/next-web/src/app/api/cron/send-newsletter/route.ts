import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In a real app, you would use an email service like Resend, SendGrid, or AWS SES.
// For this demo, we will simulate sending emails.

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

export async function GET() {
    // Verify a secret key to prevent unauthorized access
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    try {
        if (!fs.existsSync(SUBSCRIBERS_FILE)) {
            return NextResponse.json({ message: 'No subscribers found' }, { status: 200 });
        }

        const fileContent = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
        const subscribers: string[] = JSON.parse(fileContent);

        if (subscribers.length === 0) {
            return NextResponse.json({ message: 'No subscribers to send to' }, { status: 200 });
        }

        // Simulate sending emails
        console.log(`[Weekly Newsletter] Sending updates to ${subscribers.length} subscribers...`);

        // Mock email sending logic
        const results = await Promise.all(
            subscribers.map(async (email) => {
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log(`[Email Sent] To: ${email} | Subject: 🚀 Your Weekly AI & Tech Update`);
                return { email, status: 'sent' };
            })
        );

        return NextResponse.json({
            success: true,
            message: `Newsletter sent to ${subscribers.length} subscribers`,
            details: results
        });

    } catch (error) {
        console.error('Newsletter cron error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
