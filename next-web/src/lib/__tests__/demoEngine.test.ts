import { describe, expect, it } from 'vitest';
import {
    analyzeSampleLocally,
    applyDemoRefine,
    buildDemoRefineResponse,
    buildDemoVoiceResponse,
    composeDemoDraft,
    configuredProviders,
    isDemoModeEnabled,
} from '@/lib/demoEngine';
import type { VoiceContext } from '@/lib/voice';

const SAMPLE = [
    "I've been putting this off for a week. The migration is not hard, it's just tedious.",
    "So here's the plan: we move the billing service last, keep the old queue running for a day, and watch the error rate.",
    "If it spikes, we roll back. I'd rather be boring and safe than clever and sorry.",
    'Let me know if you see a gap in that.',
].join(' ');

const CONTEXT: VoiceContext = {
    sampleText: SAMPLE,
    analysis: {
        tone: 'direct',
        sentenceRhythm: 'short',
        vocabularyHabits: 'plain',
        transitions: 'simple',
        languageMixing: 'English only',
        closingStyle: 'question',
    },
    voiceInsights: 'Sounds like a planning note.',
    insightBullets: ['one', 'two', 'three', 'four', 'five'],
    latestTask: 'Write the plan.',
};

describe('isDemoModeEnabled', () => {
    it('honors the explicit flag', () => {
        expect(isDemoModeEnabled({ PRYZMIRA_DEMO_MODE: 'true' })).toBe(true);
        expect(isDemoModeEnabled({ PRYZMIRA_DEMO_MODE: 'TRUE' })).toBe(true);
        expect(isDemoModeEnabled({ GROQ_API_KEY: 'x', PRYZMIRA_DEMO_MODE: 'false' })).toBe(false);
    });

    it('falls back to demo mode when no provider key exists', () => {
        expect(isDemoModeEnabled({})).toBe(true);
        expect(isDemoModeEnabled({ GROQ_API_KEY: '   ' })).toBe(true);
        expect(isDemoModeEnabled({ GROQ_API_KEY: 'real' })).toBe(false);
        expect(isDemoModeEnabled({ DASHSCOPE_API_KEY: 'real' })).toBe(false);
        expect(isDemoModeEnabled({ OPENROUTER_API_KEY: 'real' })).toBe(false);
    });
});

describe('configuredProviders', () => {
    it('lists configured providers in fallback order', () => {
        expect(configuredProviders({})).toEqual([]);
        expect(configuredProviders({ GROQ_API_KEY: 'a' })).toEqual(['groq']);
        expect(
            configuredProviders({ GROQ_API_KEY: 'a', DASHSCOPE_API_KEY: 'b', OPENROUTER_API_KEY: 'c' })
        ).toEqual(['groq', 'dashscope', 'openrouter']);
        expect(configuredProviders({ OPENROUTER_API_KEY: 'c' })).toEqual(['openrouter']);
    });
});

describe('analyzeSampleLocally', () => {
    it('measures real properties of the sample', () => {
        const result = analyzeSampleLocally(SAMPLE);

        expect(Object.keys(result.analysis).sort()).toEqual(
            ['closingStyle', 'languageMixing', 'sentenceRhythm', 'tone', 'transitions', 'vocabularyHabits'].sort()
        );

        for (const value of Object.values(result.analysis)) {
            expect(value.length).toBeGreaterThan(3);
        }

        expect(result.analysis.closingStyle).toContain('Let me know');
        expect(result.analysis.sentenceRhythm).toMatch(/\d+(\.\d+)? words per sentence/);
        expect(result.analysis.sentenceRhythm).toContain('sentences');
        expect(result.analysis.transitions).toMatch(/\d+ simple joining words?/);
        expect(result.analysis.tone).toContain('local estimate');
        expect(result.voiceInsights).toContain('Local estimate only');
        expect(result.insightBullets.length).toBeGreaterThanOrEqual(5);
        expect(result.insightBullets.join(' ')).toContain('Contractions');
    });

    it('detects non-Latin script', () => {
        const result = analyzeSampleLocally('म यो काम आज सक्छु। The rest of this sample is in English so the word count stays sane.');

        expect(result.analysis.languageMixing).toContain('non-Latin');
    });

    it('handles a sample with no closing punctuation', () => {
        const result = analyzeSampleLocally('just some words without any punctuation at all');

        expect(result.analysis.closingStyle.length).toBeGreaterThan(0);
        expect(result.insightBullets.length).toBeGreaterThanOrEqual(5);
    });
});

describe('composeDemoDraft', () => {
    const input = {
        sampleText: SAMPLE,
        writingTask: 'Write a short email to my teammate about the migration plan.',
    };

    it('is deterministic for the same input', () => {
        expect(composeDemoDraft(input)).toBe(composeDemoDraft(input));
    });

    it('themes the draft around the task keywords', () => {
        const draft = composeDemoDraft({ ...input, writingTask: 'Write a note about the billing migration.' });

        expect(draft.toLowerCase()).toContain('billing');
    });

    it('pulls the subject out of the task instead of dumping keywords', () => {
        const draft = composeDemoDraft({
            ...input,
            writingTask: 'Write a short email to my teammate about the migration plan.',
        });

        expect(draft).toMatch(/^Quick note about|^Short update on|^Here is where things stand with|^A fast one about/);
        expect(draft).toContain('migration plan');
    });

    it('leaves bracketed placeholders instead of inventing facts', () => {
        const draft = composeDemoDraft(input);

        expect(draft).toContain('[');
        expect(draft).toContain(']');
        expect(draft).not.toMatch(/\b\d{1,3}%\b/);
    });

    it('carries extra instructions through as a visible constraint', () => {
        const draft = composeDemoDraft({ ...input, extraInstructions: 'Keep it under 80 words.' });

        expect(draft).toContain('Keep it under 80 words.');
    });

    it('switches to formal phrasing when the sample avoids contractions', () => {
        const formalSample =
            'The service is ready. We will move the queue first and then the billing worker. It is slower but safer.';
        const draft = composeDemoDraft({ sampleText: formalSample, writingTask: 'Write an update about deployment.' });

        expect(draft).toContain('I would');
    });

    it('changes when the task changes', () => {
        const other = composeDemoDraft({ ...input, writingTask: 'Write a note about the design review.' });

        expect(other).not.toBe(composeDemoDraft(input));
    });
});

describe('applyDemoRefine', () => {
    const draft = 'First paragraph here.\n\nSecond paragraph here.\n\nThird paragraph here.';

    it('cuts the draft in half when asked for shorter', () => {
        expect(applyDemoRefine(draft, 'Make it shorter.')).toBe('First paragraph here.\n\nSecond paragraph here.');
    });

    it('expands contractions when asked for formal', () => {
        const result = applyDemoRefine("I'm sure we're ready and it's fine.", 'Make it more formal.');

        expect(result).toBe('I am sure we are ready and it is fine.');
    });

    it('adds a warm opener', () => {
        expect(applyDemoRefine('Here is the plan.', 'Make it warmer.')).toMatch(/^Hey - here is the plan\./);
    });

    it('appends a detail prompt when asked for more detail', () => {
        expect(applyDemoRefine(draft, 'Add more detail.')).toContain('one more concrete detail');
    });

    it('says so when it cannot apply the instruction', () => {
        const result = applyDemoRefine(draft, 'Rewrite this as a haiku.');

        expect(result).toContain('not applied');
        expect(result).toContain('Connect a model key');
    });
});

describe('demo responses', () => {
    it('builds a labelled generation payload', () => {
        const payload = buildDemoVoiceResponse({
            sampleText: SAMPLE,
            writingTask: 'Write a plan update.',
            extraInstructions: 'Keep it short.',
            remainingQuota: 4,
            quotaLimit: 5,
            isAuthenticated: false,
            now: new Date('2026-10-28T12:00:00.000Z'),
        });

        expect(payload.demo).toBe(true);
        expect(payload.createdAt).toBe('2026-10-28T12:00:00.000Z');
        expect(payload.remainingQuota).toBe(4);
        expect(payload.quotaLimit).toBe(5);
        expect(payload.isAuthenticated).toBe(false);
        expect(payload.voiceContext.latestTask).toBe('Write a plan update.');
        expect(payload.voiceContext.latestInstructions).toBe('Keep it short.');
        expect(payload.preview.length).toBeGreaterThan(0);
        expect(payload.insightBullets.length).toBeGreaterThanOrEqual(5);
    });

    it('builds a labelled refine payload', () => {
        const payload = buildDemoRefineResponse({
            voiceContext: CONTEXT,
            previousOutput: 'One.\n\nTwo.\n\nThree.',
            refineInstruction: 'Make it shorter.',
            remainingQuota: 3,
            quotaLimit: 5,
            isAuthenticated: true,
            now: new Date('2026-10-28T12:00:00.000Z'),
        });

        expect(payload.demo).toBe(true);
        expect(payload.outputText).toBe('One.\n\nTwo.');
        expect(payload.voiceContext).toEqual(CONTEXT);
        expect(payload.isAuthenticated).toBe(true);
    });
});
