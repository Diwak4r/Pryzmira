import { describe, expect, it } from 'vitest';
import {
    isVoiceEngineFailure,
    normalizeVoiceRequestError,
    VOICE_ENGINE_UNAVAILABLE_MESSAGE,
} from '@/lib/voiceRequestError';

describe('isVoiceEngineFailure', () => {
    it.each([
        'fetch failed',
        'Failed to fetch',
        'The writing engine is unreachable.',
        'The writing engine is unavailable right now.',
        'Groq request failed.',
        'Groq returned an empty response.',
        'OpenRouter request failed.',
        'OpenRouter returned an empty response.',
        '  FETCH FAILED  ',
    ])('flags %j as an engine failure', (message) => {
        expect(isVoiceEngineFailure(message)).toBe(true);
    });

    it.each([
        'Your writing sample needs at least 50 words so the voice analysis has enough signal.',
        'Describe what you want written.',
        'Anonymous quota reached. Try again in the next hour or sign in to save more generations.',
        '',
        'network hiccup',
    ])('does not flag %j as an engine failure', (message) => {
        expect(isVoiceEngineFailure(message)).toBe(false);
    });
});

describe('normalizeVoiceRequestError', () => {
    it('replaces raw engine failures with the friendly message', () => {
        expect(normalizeVoiceRequestError(new Error('fetch failed'), 'fallback')).toBe(
            VOICE_ENGINE_UNAVAILABLE_MESSAGE
        );
    });

    it('preserves actionable validation messages', () => {
        expect(
            normalizeVoiceRequestError(new Error('Refine instruction is required.'), 'fallback')
        ).toBe('Refine instruction is required.');
    });

    it('falls back when a non-Error value is thrown', () => {
        expect(normalizeVoiceRequestError('boom', 'Something went wrong.')).toBe('Something went wrong.');
    });

    it('falls back when the Error message is empty', () => {
        expect(normalizeVoiceRequestError(new Error(''), 'Fallback message.')).toBe('Fallback message.');
    });
});
