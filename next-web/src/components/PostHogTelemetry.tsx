'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initTelemetry, persistAttribution, trackPageView } from '@/lib/telemetry';

export default function PostHogTelemetry() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        initTelemetry();
    }, []);

    useEffect(() => {
        if (!pathname) {
            return;
        }

        persistAttribution(pathname, searchParams);
        trackPageView(pathname, searchParams);
    }, [pathname, searchParams]);

    return null;
}
