const PROFILE_ID_KEY = 'pryzmira_strategy_profile_id';
const RESUME_TOKEN_KEY = 'pryzmira_strategy_resume_token';
const STRATEGY_SESSION_EVENT = 'pryzmira:strategy-session-change';

function canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function notifyStrategySessionChange(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new Event(STRATEGY_SESSION_EVENT));
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
    notifyStrategySessionChange();
}

export function clearStrategyProfileId(): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.removeItem(PROFILE_ID_KEY);
    notifyStrategySessionChange();
}

export function getStrategyResumeToken(): string | null {
    if (!canUseStorage()) {
        return null;
    }

    return window.localStorage.getItem(RESUME_TOKEN_KEY);
}

export function setStrategyResumeToken(token: string): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.setItem(RESUME_TOKEN_KEY, token);
    notifyStrategySessionChange();
}

export function clearStrategyResumeToken(): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.removeItem(RESUME_TOKEN_KEY);
    notifyStrategySessionChange();
}

export function subscribeToStrategySession(listener: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handleStorage = (event: StorageEvent) => {
        if (!event.key || event.key === PROFILE_ID_KEY || event.key === RESUME_TOKEN_KEY) {
            listener();
        }
    };

    const handleSessionChange = () => {
        listener();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(STRATEGY_SESSION_EVENT, handleSessionChange);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(STRATEGY_SESSION_EVENT, handleSessionChange);
    };
}
