'use client';

import type { VoiceSavedGeneration } from '@/lib/voice';

const CURRENT_GENERATION_KEY = 'pryzmira_voice_current_generation';
const HISTORY_KEY = 'pryzmira_voice_history';
const PENDING_SAVE_KEY = 'pryzmira_voice_pending_save';
const SESSION_EVENT = 'pryzmira:voice-session-change';

function canUseSessionStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function notifyVoiceSessionChange(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new Event(SESSION_EVENT));
}

function readJson<T>(key: string, fallback: T): T {
    if (!canUseSessionStorage()) {
        return fallback;
    }

    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
        return fallback;
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function writeJson<T>(key: string, value: T): void {
    if (!canUseSessionStorage()) {
        return;
    }

    window.sessionStorage.setItem(key, JSON.stringify(value));
    notifyVoiceSessionChange();
}

export function getCurrentVoiceGeneration(): VoiceSavedGeneration | null {
    return readJson<VoiceSavedGeneration | null>(CURRENT_GENERATION_KEY, null);
}

export function setCurrentVoiceGeneration(value: VoiceSavedGeneration): void {
    writeJson(CURRENT_GENERATION_KEY, value);
}

export function clearCurrentVoiceGeneration(): void {
    if (!canUseSessionStorage()) {
        return;
    }

    window.sessionStorage.removeItem(CURRENT_GENERATION_KEY);
    notifyVoiceSessionChange();
}

export function getVoiceHistory(): VoiceSavedGeneration[] {
    return readJson<VoiceSavedGeneration[]>(HISTORY_KEY, []);
}

export function pushVoiceHistory(value: VoiceSavedGeneration): VoiceSavedGeneration[] {
    const current = getVoiceHistory();
    const deduped = current.filter((entry) => entry.id !== value.id);
    const next = [value, ...deduped].slice(0, 12);
    writeJson(HISTORY_KEY, next);
    return next;
}

export function replaceVoiceHistory(values: VoiceSavedGeneration[]): void {
    writeJson(HISTORY_KEY, values.slice(0, 12));
}

export function getPendingVoiceSave(): boolean {
    return readJson<boolean>(PENDING_SAVE_KEY, false);
}

export function setPendingVoiceSave(value: boolean): void {
    writeJson(PENDING_SAVE_KEY, value);
}

export function subscribeToVoiceSession(listener: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handleStorage = (event: StorageEvent) => {
        if (!event.key || [CURRENT_GENERATION_KEY, HISTORY_KEY, PENDING_SAVE_KEY].includes(event.key)) {
            listener();
        }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SESSION_EVENT, listener);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(SESSION_EVENT, listener);
    };
}
