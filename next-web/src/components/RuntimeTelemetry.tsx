'use client';

import { useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

function subscribe(): () => void {
    return () => {};
}

function shouldEnableTelemetry(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const host = window.location.hostname.toLowerCase();
    return host !== 'localhost' && host !== '127.0.0.1';
}

export default function RuntimeTelemetry() {
    const shouldRender = useSyncExternalStore(subscribe, shouldEnableTelemetry, () => false);

    if (!shouldRender) {
        return null;
    }

    return (
        <>
            <Analytics />
            <SpeedInsights />
        </>
    );
}
