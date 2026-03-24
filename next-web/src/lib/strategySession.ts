const PROFILE_ID_KEY = 'pryzmira_strategy_profile_id';

function canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStrategyProfileId(): string | null {
    if (!canUseStorage()) {
        return null;
    }

    return window.localStorage.getItem(PROFILE_ID_KEY);
}

export function setStrategyProfileId(profileId: string): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.setItem(PROFILE_ID_KEY, profileId);
}

export function clearStrategyProfileId(): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.removeItem(PROFILE_ID_KEY);
}
