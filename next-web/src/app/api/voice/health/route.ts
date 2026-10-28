import { NextResponse } from 'next/server';
import { configuredProviders, isDemoModeEnabled } from '@/lib/demoEngine';

export const dynamic = 'force-dynamic';

/**
 * Tells the client whether a real model will be called. Exposes booleans only -
 * never key material - so the UI can label demo output honestly.
 */
export async function GET() {
    return NextResponse.json({
        demoMode: isDemoModeEnabled(),
        providers: configuredProviders(),
    });
}
