export type ConsentState = 'accepted' | 'declined';

const STORAGE_KEY = 'prismira-analytics-consent';
export const CONSENT_EVENT = 'prismira-consent-change';

export function getConsent(): ConsentState | null {
    if (typeof window === 'undefined') return null;
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === 'accepted' || value === 'declined' ? value : null;
    } catch {
        return null;
    }
}

export function setConsent(state: ConsentState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, state);
        window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
    } catch {
        // Ignore storage failures (private mode, blocked storage) — banner just reappears.
    }
}
