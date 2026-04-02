'use client';

import posthog from 'posthog-js';

const ATTRIBUTION_STORAGE_KEY = 'pryzmira_attribution_v1';

export interface TelemetryAttribution {
    initialPath: string | null;
    initialReferrer: string | null;
    referralCode: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmMedium: string | null;
    utmSource: string | null;
    utmTerm: string | null;
}

type SearchLike = {
    get(name: string): string | null;
    toString(): string;
};

declare global {
    interface Window {
        __pryzmiraPostHogInitialized?: boolean;
    }
}

function cleanValue(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
}

function isClient(): boolean {
    return typeof window !== 'undefined';
}

function isTelemetryEnabled(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

function getPostHogHost(): string {
    return process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
}

function parseStoredAttribution(): TelemetryAttribution {
    if (!isClient()) {
        return {
            initialPath: null,
            initialReferrer: null,
            referralCode: null,
            utmCampaign: null,
            utmContent: null,
            utmMedium: null,
            utmSource: null,
            utmTerm: null,
        };
    }

    try {
        const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);

        if (!raw) {
            return {
                initialPath: null,
                initialReferrer: null,
                referralCode: null,
                utmCampaign: null,
                utmContent: null,
                utmMedium: null,
                utmSource: null,
                utmTerm: null,
            };
        }

        const parsed = JSON.parse(raw) as Partial<TelemetryAttribution>;

        return {
            initialPath: cleanValue(parsed.initialPath),
            initialReferrer: cleanValue(parsed.initialReferrer),
            referralCode: cleanValue(parsed.referralCode),
            utmCampaign: cleanValue(parsed.utmCampaign),
            utmContent: cleanValue(parsed.utmContent),
            utmMedium: cleanValue(parsed.utmMedium),
            utmSource: cleanValue(parsed.utmSource),
            utmTerm: cleanValue(parsed.utmTerm),
        };
    } catch {
        return {
            initialPath: null,
            initialReferrer: null,
            referralCode: null,
            utmCampaign: null,
            utmContent: null,
            utmMedium: null,
            utmSource: null,
            utmTerm: null,
        };
    }
}

function writeAttribution(attribution: TelemetryAttribution): void {
    if (!isClient()) {
        return;
    }

    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
}

function compactProperties(
    properties: Record<string, string | number | boolean | null | undefined>
): Record<string, string | number | boolean> {
    const compacted = Object.entries(properties).filter(([, value]) => {
        return value !== null && value !== undefined && value !== '';
    });

    return Object.fromEntries(compacted) as Record<string, string | number | boolean>;
}

export function getStoredAttribution(): TelemetryAttribution {
    return parseStoredAttribution();
}

export function persistAttribution(pathname: string, searchParams: SearchLike): TelemetryAttribution {
    const current = parseStoredAttribution();
    const queryString = searchParams.toString();

    const nextAttribution: TelemetryAttribution = {
        initialPath: current.initialPath || pathname || null,
        initialReferrer: current.initialReferrer || cleanValue(document.referrer),
        referralCode: cleanValue(searchParams.get('ref')) || current.referralCode,
        utmCampaign: cleanValue(searchParams.get('utm_campaign')) || current.utmCampaign,
        utmContent: cleanValue(searchParams.get('utm_content')) || current.utmContent,
        utmMedium: cleanValue(searchParams.get('utm_medium')) || current.utmMedium,
        utmSource: cleanValue(searchParams.get('utm_source')) || current.utmSource,
        utmTerm: cleanValue(searchParams.get('utm_term')) || current.utmTerm,
    };

    if (!current.initialPath || queryString.includes('utm_') || queryString.includes('ref=')) {
        writeAttribution(nextAttribution);
    }

    return nextAttribution;
}

export function initTelemetry(): boolean {
    if (!isClient() || !isTelemetryEnabled()) {
        return false;
    }

    if (window.__pryzmiraPostHogInitialized) {
        return true;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: getPostHogHost(),
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        person_profiles: 'identified_only',
    });

    window.__pryzmiraPostHogInitialized = true;
    return true;
}

export function identifyUser(
    distinctId: string,
    properties: Record<string, string | number | boolean | null | undefined> = {}
): void {
    if (!initTelemetry()) {
        return;
    }

    posthog.identify(distinctId, compactProperties({ ...getStoredAttribution(), ...properties }));
}

export function trackEvent(
    eventName: string,
    properties: Record<string, string | number | boolean | null | undefined> = {}
): void {
    if (!initTelemetry()) {
        return;
    }

    posthog.capture(
        eventName,
        compactProperties({
            ...getStoredAttribution(),
            currentPath: window.location.pathname,
            query: window.location.search || null,
            ...properties,
        })
    );
}

export function trackPageView(pathname: string, searchParams: SearchLike): void {
    if (!initTelemetry()) {
        return;
    }

    posthog.capture(
        '$pageview',
        compactProperties({
            ...getStoredAttribution(),
            currentPath: pathname,
            query: searchParams.toString() || null,
            url: `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        })
    );
}
