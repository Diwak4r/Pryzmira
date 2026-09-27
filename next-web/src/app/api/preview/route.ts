import { NextResponse } from 'next/server';
import { fetchLinkPreview } from '@/lib/linkPreview';

export async function POST(request: Request) {
    let url: string | undefined;

    try {
        const body = await request.json();
        url = body?.url;
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'A url is required.' }, { status: 400 });
    }

    try {
        new URL(url);
    } catch {
        return NextResponse.json({ error: 'That does not look like a valid URL.' }, { status: 400 });
    }

    try {
        const preview = await fetchLinkPreview(url);
        return NextResponse.json({ preview });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not fetch a preview for that link.';
        return NextResponse.json({ error: message }, { status: 422 });
    }
}
