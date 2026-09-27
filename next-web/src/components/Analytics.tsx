'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { CONSENT_EVENT, getConsent } from '@/lib/cookieConsent';

/**
 * Loads the analytics script only after the visitor accepts the cookie
 * banner. Set NEXT_PUBLIC_ANALYTICS_SRC / NEXT_PUBLIC_ANALYTICS_WEBSITE_ID
 * for a self-hosted Umami/Plausible-style script. Renders nothing if unset.
 */
export default function Analytics() {
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        // Reads localStorage after mount to avoid an SSR/client hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAllowed(getConsent() === 'accepted');

        const onChange = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            setAllowed(detail === 'accepted');
        };

        window.addEventListener(CONSENT_EVENT, onChange);
        return () => window.removeEventListener(CONSENT_EVENT, onChange);
    }, []);

    const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
    const websiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID;

    if (!allowed || !src || !websiteId) return null;

    return <Script src={src} data-website-id={websiteId} strategy="afterInteractive" />;
}
