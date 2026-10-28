import { describe, expect, it } from 'vitest';
import {
    MAX_SAMPLE_CHARACTERS,
    MIN_SAMPLE_WORDS,
    countWords,
    createPreview,
    normalizeMultilineInput,
    sanitizeExtraInstructions,
    sanitizeSampleText,
    sanitizeWritingTask,
    validateGenerateInput,
    validateRefineInput,
    type VoiceContext,
} from '@/lib/voice';

const LONG_SAMPLE = Array.from({ length: 60 }, (_, index) => `word${index}`).join(' ');

const VOICE_CONTEXT: VoiceContext = {
    sampleText: LONG_SAMPLE,
    analysis: {
        tone: 'warm but direct',
        sentenceRhythm: 'short lines, occasional run-on',
        vocabularyHabits: 'concrete nouns, few adverbs',
        transitions: 'abrupt cuts',
        languageMixing: 'English only',
        closingStyle: 'ends on a question',
    },
    voiceInsights: 'Reads like a quick text message.',
    insightBullets: ['one', 'two', 'three', 'four', 'five'],
    latestTask: 'Write an email.',
};

describe('normalizeMultilineInput', () => {
    it('converts CRLF to LF and trims surrounding whitespace', () => {
        expect(normalizeMultilineInput('  a\r\nb\r\n  ')).toBe('a\nb');
    });

    it('returns an empty string for whitespace-only input', () => {
        expect(normalizeMultilineInput('   \n\t ')).toBe('');
    });
});

describe('countWords', () => {
    it('counts words separated by any whitespace', () => {
        expect(countWords('one two\tthree\nfour')).toBe(4);
    });

    it('returns 0 for empty or whitespace-only input', () => {
        expect(countWords('')).toBe(0);
        expect(countWords('   ')).toBe(0);
    });
});

describe('sanitizeSampleText', () => {
    it('keeps short samples intact after normalization', () => {
        expect(sanitizeSampleText('hello\r\nworld')).toBe('hello\nworld');
    });

    it('truncates samples above the character ceiling', () => {
        const oversized = 'x'.repeat(MAX_SAMPLE_CHARACTERS + 500);
        const result = sanitizeSampleText(oversized);

        expect(result.length).toBeLessThanOrEqual(MAX_SAMPLE_CHARACTERS);
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('sanitizeWritingTask / sanitizeExtraInstructions', () => {
    it('normalizes line endings on tasks', () => {
        expect(sanitizeWritingTask('line one\r\nline two')).toBe('line one\nline two');
    });

    it('treats null and undefined instructions as empty strings', () => {
        expect(sanitizeExtraInstructions(null)).toBe('');
        expect(sanitizeExtraInstructions(undefined)).toBe('');
    });
});

describe('createPreview', () => {
    it('collapses whitespace for short text', () => {
        expect(createPreview('  hello\n\nworld  ')).toBe('hello world');
    });

    it('truncates long text to 180 characters with an ellipsis', () => {
        const preview = createPreview('a'.repeat(400));

        expect(preview).toHaveLength(180);
        expect(preview.endsWith('...')).toBe(true);
    });

    it('never returns more than the preview budget for short text', () => {
        expect(createPreview('short')).toBe('short');
    });
});

describe('validateGenerateInput', () => {
    it('accepts a sample with the minimum word count', () => {
        const input = validateGenerateInput({
            sampleText: LONG_SAMPLE,
            writingTask: 'Write a note to my landlord.',
            extraInstructions: 'Keep it short.',
        });

        expect(countWords(input.sampleText)).toBeGreaterThanOrEqual(MIN_SAMPLE_WORDS);
        expect(input.writingTask).toBe('Write a note to my landlord.');
        expect(input.extraInstructions).toBe('Keep it short.');
    });

    it('rejects samples below the minimum word count', () => {
        expect(() =>
            validateGenerateInput({ sampleText: 'too short', writingTask: 'anything' })
        ).toThrowError(/at least 50 words/i);
    });

    it('rejects a missing writing task', () => {
        expect(() =>
            validateGenerateInput({ sampleText: LONG_SAMPLE, writingTask: '   ' })
        ).toThrowError(/what you want written/i);
    });

    it('coerces non-string values to safe empties instead of throwing type errors', () => {
        expect(() =>
            validateGenerateInput({ sampleText: 42, writingTask: null, extraInstructions: {} })
        ).toThrowError(/at least 50 words/i);
    });
});

describe('validateRefineInput', () => {
    it('accepts a complete refine request', () => {
        const input = validateRefineInput({
            voiceContext: VOICE_CONTEXT,
            previousOutput: '  draft text  ',
            refineInstruction: 'Make it shorter.',
        });

        expect(input.previousOutput).toBe('draft text');
        expect(input.refineInstruction).toBe('Make it shorter.');
        expect(input.voiceContext).toBe(VOICE_CONTEXT);
    });

    it('rejects a missing voice context', () => {
        expect(() =>
            validateRefineInput({ previousOutput: 'draft', refineInstruction: 'shorter' })
        ).toThrowError(/voice context is missing/i);
    });

    it('rejects a missing previous output', () => {
        expect(() =>
            validateRefineInput({
                voiceContext: VOICE_CONTEXT,
                previousOutput: '   ',
                refineInstruction: 'shorter',
            })
        ).toThrowError(/previous output is missing/i);
    });

    it('rejects a missing refine instruction', () => {
        expect(() =>
            validateRefineInput({
                voiceContext: VOICE_CONTEXT,
                previousOutput: 'draft',
                refineInstruction: '',
            })
        ).toThrowError(/refine instruction is required/i);
    });
});
