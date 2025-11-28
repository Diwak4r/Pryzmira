import posthog from 'posthog-js';
import * as Sentry from "@sentry/react";

// Initialize Analytics
export const initAnalytics = () => {
    // PostHog Initialization
    posthog.init('phc_MOCK_API_KEY_REPLACE_ME', {
        api_host: 'https://app.posthog.com',
        autocapture: false, // We want manual control for now
        capture_pageview: false // We'll manually track pageviews
    });

    // Sentry Initialization
    Sentry.init({
        dsn: "https://examplePublicKey@o0.ingest.sentry.io/0", // Placeholder DSN
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
};

// Track Events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${eventName}`, properties);
    }
    try {
        posthog.capture(eventName, properties);
    } catch (e) {
        console.warn('PostHog capture failed', e);
    }
};

// Track Page Views
export const trackPageView = (path: string) => {
    if (typeof window === 'undefined') return;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] Page View: ${path}`);
    }
    try {
        posthog.capture('$pageview', { path });
    } catch (e) {
        console.warn('PostHog capture failed', e);
    }
};

// A/B Testing Hook (Mocked for now)
export const useFeatureFlag = (flagKey: string): boolean | string => {
    // Avoid hydration mismatch by returning a consistent default during SSR
    if (typeof window === 'undefined') return 'variant-a';

    // In a real app, this would come from PostHog
    // posthog.onFeatureFlags(() => { ... })

    // Mock A/B Test for CTA - using a deterministic approach or just returning one variant for now to avoid hydration errors
    if (flagKey === 'hero-cta-copy') {
        return 'variant-a';
    }

    return false;
};
