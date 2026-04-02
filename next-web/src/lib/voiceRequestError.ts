const RAW_FETCH_ERROR_MESSAGES = new Set(['fetch failed', 'failed to fetch']);

export const VOICE_ENGINE_UNAVAILABLE_MESSAGE =
    'The writing engine is unavailable right now. Try again in a moment.';

export function isVoiceEngineFailure(message: string): boolean {
    const normalized = message.trim().toLowerCase();

    return (
        RAW_FETCH_ERROR_MESSAGES.has(normalized) ||
        normalized.includes('writing engine is unreachable') ||
        normalized.includes('writing engine is unavailable') ||
        normalized.includes('groq request failed') ||
        normalized.includes('groq returned an empty response')
    );
}

export function normalizeVoiceRequestError(error: unknown, fallback: string): string {
    const message = error instanceof Error ? error.message : fallback;

    if (isVoiceEngineFailure(message)) {
        return VOICE_ENGINE_UNAVAILABLE_MESSAGE;
    }

    return message || fallback;
}
