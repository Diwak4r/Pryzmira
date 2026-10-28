import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    analyzeVoice,
    buildRefinedVoiceResponse,
    buildVoiceResponse,
    createTransientGenerationId,
    generateInVoice,
} from '@/lib/voiceService';
import type { VoiceAnalysis } from '@/lib/voice';
import {
    isVoiceEngineFailure,
    normalizeVoiceRequestError,
    VOICE_ENGINE_UNAVAILABLE_MESSAGE,
} from '@/lib/voiceRequestError';

const SAMPLE = [
    "I've been meaning to write this for a week now. The launch slipped again.",
    "Not because the code broke, but because I kept polishing things nobody asked for.",
    "So here's the deal: we ship Friday, rough edges and all.",
    "If that scares you, that's fine. I'd rather ship something real than schedule another perfect demo.",
    "Let me know what you think. I'll be in the build room all week.",
    'We keep the scope small and the feedback loop short, which is the only reason this thing exists.',
].join(' ');

const ANALYSIS: VoiceAnalysis = {
    tone: 'blunt and warm',
    sentenceRhythm: 'short bursts with one longer reflection',
    vocabularyHabits: 'build-room slang, concrete nouns',
    transitions: 'hard cuts, "so here\'s the deal"',
    languageMixing: 'English only',
    closingStyle: 'casual invitation to reply',
};

const INSIGHT_BULLETS = [
    'Opens with a confession instead of a greeting.',
    'Keeps sentences under 15 words most of the time.',
    "Uses contractions constantly, including n't forms.",
    'Ends with a low-pressure invitation.',
    'Names the concrete blocker instead of hedging.',
    'Avoids corporate transitions entirely.',
];

const FAITHFUL_DRAFT =
    "we ship friday, rough edges and all. no more polishing. i'd rather ship something real than schedule another perfect demo. i'll be in the build room if you want to argue about it.";

function analysisPayload(overrides: Record<string, unknown> = {}): string {
    return JSON.stringify({
        tone: ANALYSIS.tone,
        sentenceRhythm: ANALYSIS.sentenceRhythm,
        vocabularyHabits: ANALYSIS.vocabularyHabits,
        transitions: ANALYSIS.transitions,
        languageMixing: ANALYSIS.languageMixing,
        closingStyle: ANALYSIS.closingStyle,
        voiceInsights: 'Reads like a founder note written at midnight.',
        insightBullets: INSIGHT_BULLETS,
        ...overrides,
    });
}

interface MockResponse {
    status?: number;
    body: unknown;
}

function mockFetchSequence(responses: MockResponse[]) {
    const calls: Array<{ url: string; body: unknown }> = [];
    const fetchMock = vi.fn(async (input: unknown, init?: RequestInit) => {
        calls.push({
            url: String(input),
            body: init?.body ? (JSON.parse(String(init.body)) as unknown) : null,
        });

        const next = responses.shift();
        if (!next) {
            throw new Error('Unexpected fetch call in test.');
        }

        return new Response(JSON.stringify(next.body), {
            status: next.status ?? 200,
            headers: { 'Content-Type': 'application/json' },
        });
    });

    vi.stubGlobal('fetch', fetchMock);
    return { fetchMock, calls };
}

beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', 'groq-test-key');
    vi.stubEnv('OPENROUTER_API_KEY', '');
    vi.stubEnv('DASHSCOPE_API_KEY', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('analyzeVoice', () => {
    it('normalizes a valid analysis payload', async () => {
        const { fetchMock, calls } = mockFetchSequence([
            { body: { choices: [{ message: { content: analysisPayload() } }] } },
        ]);

        const result = await analyzeVoice(SAMPLE);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(calls[0].url).toBe('https://api.groq.com/openai/v1/chat/completions');
        expect(result.analysis).toEqual(ANALYSIS);
        expect(result.voiceInsights).toMatch(/founder note/);
        expect(result.insightBullets).toHaveLength(6);
    });

    it('reads JSON wrapped in markdown fences', async () => {
        mockFetchSequence([
            { body: { choices: [{ message: { content: '```json\n' + analysisPayload() + '\n```' } }] } },
        ]);

        await expect(analyzeVoice(SAMPLE)).resolves.toMatchObject({ analysis: ANALYSIS });
    });

    it('caps insight bullets at seven entries', async () => {
        mockFetchSequence([
            {
                body: {
                    choices: [
                        {
                            message: {
                                content: analysisPayload({
                                    insightBullets: [...INSIGHT_BULLETS, 'seven', 'eight', 'nine'],
                                }),
                            },
                        },
                    ],
                },
            },
        ]);

        const result = await analyzeVoice(SAMPLE);

        expect(result.insightBullets).toHaveLength(7);
    });

    it('rejects an analysis with too few insight bullets', async () => {
        mockFetchSequence([
            {
                body: {
                    choices: [
                        { message: { content: analysisPayload({ insightBullets: ['only one'] }) } },
                    ],
                },
            },
        ]);

        await expect(analyzeVoice(SAMPLE)).rejects.toThrowError(/enough insight bullets/i);
    });

    it('rejects a response that is not JSON', async () => {
        mockFetchSequence([{ body: { choices: [{ message: { content: 'not json at all' } }] } }]);

        await expect(analyzeVoice(SAMPLE)).rejects.toThrowError(/invalid JSON/i);
    });

    it('falls back to placeholders for missing analysis fields', async () => {
        mockFetchSequence([
            {
                body: {
                    choices: [
                        { message: { content: analysisPayload({ tone: undefined, closingStyle: 42 }) } },
                    ],
                },
            },
        ]);

        const result = await analyzeVoice(SAMPLE);

        expect(result.analysis.tone).toBe('Unclear from sample');
        expect(result.analysis.closingStyle).toBe('Unclear from sample');
        expect(result.analysis.sentenceRhythm).toBe(ANALYSIS.sentenceRhythm);
    });

    it('surfaces an engine error when the API key is missing', async () => {
        vi.stubEnv('GROQ_API_KEY', '');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await expect(analyzeVoice(SAMPLE)).rejects.toThrowError(/GROQ_API_KEY is not configured/);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('generateInVoice', () => {
    it('returns the first draft when it already matches the voice', async () => {
        const { fetchMock } = mockFetchSequence([
            { body: { choices: [{ message: { content: FAITHFUL_DRAFT } }] } },
        ]);

        const result = await generateInVoice({
            sampleText: SAMPLE,
            analysis: ANALYSIS,
            voiceInsights: 'Reads like a founder note.',
            insightBullets: INSIGHT_BULLETS,
            writingTask: 'Write a launch update.',
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(FAITHFUL_DRAFT);
    });

    it('retries once when the draft uses generic assistant phrasing', async () => {
        const genericDraft =
            'I hope this email finds you well. I wanted to reach out regarding the upcoming launch timeline.';
        const { fetchMock, calls } = mockFetchSequence([
            { body: { choices: [{ message: { content: genericDraft } }] } },
            { body: { choices: [{ message: { content: FAITHFUL_DRAFT } }] } },
        ]);

        const result = await generateInVoice({
            sampleText: SAMPLE,
            analysis: ANALYSIS,
            writingTask: 'Write a launch update.',
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result).toBe(FAITHFUL_DRAFT);

        const retryBody = calls[1].body as { messages: Array<{ role: string; content: string }> };
        expect(retryBody.messages).toHaveLength(4);
        expect(retryBody.messages[2]).toEqual({ role: 'assistant', content: genericDraft });
        expect(retryBody.messages[3].content).toMatch(/too generic/i);
    });

    it('keeps the first draft when the retry fails', async () => {
        const genericDraft = 'I hope this message finds you well. Please do not hesitate to reach out.';
        mockFetchSequence([
            { body: { choices: [{ message: { content: genericDraft } }] } },
            { status: 500, body: { error: { message: 'upstream exploded' } } },
        ]);

        const result = await generateInVoice({
            sampleText: SAMPLE,
            analysis: ANALYSIS,
            writingTask: 'Write a launch update.',
        });

        expect(result).toBe(genericDraft);
    });

    it('audits the prompt for the voice contract and the writing task', async () => {
        const { calls } = mockFetchSequence([
            { body: { choices: [{ message: { content: FAITHFUL_DRAFT } }] } },
        ]);

        await generateInVoice({
            sampleText: SAMPLE,
            analysis: ANALYSIS,
            writingTask: 'Write a launch update.',
            extraInstructions: 'Mention the Friday deadline.',
        });

        const body = calls[0].body as {
            temperature: number;
            messages: Array<{ role: string; content: string }>;
        };
        const systemPrompt = body.messages[0].content;
        const userPrompt = body.messages[1].content;

        expect(systemPrompt).toMatch(/Dynamic voice contract/);
        expect(systemPrompt).toMatch(/Never output generic assistant\/corporate phrases/);
        expect(userPrompt).toContain('Write a launch update.');
        expect(userPrompt).toContain('Mention the Friday deadline.');
        expect(userPrompt).toContain(ANALYSIS.tone);
        expect(body.temperature).toBeGreaterThan(0);
    });
});

describe('provider fallbacks', () => {
    it('falls back to OpenRouter when Groq fails', async () => {
        vi.stubEnv('OPENROUTER_API_KEY', 'openrouter-test-key');
        const { fetchMock, calls } = mockFetchSequence([
            { status: 503, body: { error: { message: 'Groq is down' } } },
            { body: { choices: [{ message: { content: analysisPayload() } }] } },
        ]);

        const result = await analyzeVoice(SAMPLE);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(calls[1].url).toBe('https://openrouter.ai/api/v1/chat/completions');
        expect(result.analysis).toEqual(ANALYSIS);
    });

    it('marks exhausted provider failures so the request layer can normalize them', async () => {
        const { fetchMock } = mockFetchSequence([{ status: 500, body: { error: { message: 'boom' } } }]);

        const failure = await analyzeVoice(SAMPLE).catch((error: unknown) => error);

        expect(failure).toBeInstanceOf(Error);
        expect((failure as Error).message).toMatch(/^Groq request failed/);
        expect(isVoiceEngineFailure((failure as Error).message)).toBe(true);
        expect(normalizeVoiceRequestError(failure, 'fallback')).toBe(VOICE_ENGINE_UNAVAILABLE_MESSAGE);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe('buildVoiceResponse', () => {
    it('composes the payload the desk consumes', async () => {
        mockFetchSequence([
            { body: { choices: [{ message: { content: analysisPayload() } }] } },
            {
                body: {
                    choices: [
                        {
                            message: {
                                content:
                                    "we ship friday, rough edges and all. i'd rather ship something real than schedule another perfect demo. i'll be in the build room all week.",
                            },
                        },
                    ],
                },
            },
        ]);

        const payload = await buildVoiceResponse({
            sampleText: SAMPLE,
            writingTask: 'Write a launch update.',
            extraInstructions: 'Mention the Friday deadline.',
            remainingQuota: 3,
            quotaLimit: 5,
            isAuthenticated: false,
        });

        expect(payload.outputText).toMatch(/ship friday/i);
        expect(payload.preview).toBe(payload.outputText);
        expect(payload.voiceContext.sampleText).toBe(SAMPLE);
        expect(payload.voiceContext.latestTask).toBe('Write a launch update.');
        expect(payload.voiceContext.latestInstructions).toBe('Mention the Friday deadline.');
        expect(payload.remainingQuota).toBe(3);
        expect(payload.quotaLimit).toBe(5);
        expect(payload.isAuthenticated).toBe(false);
        expect(Number.isNaN(Date.parse(payload.createdAt))).toBe(false);
    });
});

describe('buildRefinedVoiceResponse', () => {
    it('carries the voice context forward and swaps the draft', async () => {
        mockFetchSequence([
            { body: { choices: [{ message: { content: FAITHFUL_DRAFT } }] } },
        ]);

        const payload = await buildRefinedVoiceResponse({
            voiceContext: {
                sampleText: SAMPLE,
                analysis: ANALYSIS,
                voiceInsights: 'Reads like a founder note.',
                insightBullets: INSIGHT_BULLETS,
                latestTask: 'Write a launch update.',
            },
            previousOutput: 'An older, longer draft.',
            refineInstruction: 'Cut it in half.',
            remainingQuota: 1,
            quotaLimit: 5,
            isAuthenticated: true,
        });

        expect(payload.outputText).toBe(FAITHFUL_DRAFT);
        expect(payload.voiceContext.analysis).toEqual(ANALYSIS);
        expect(payload.isAuthenticated).toBe(true);
    });
});

describe('createTransientGenerationId', () => {
    it('returns RFC 4122 ids', () => {
        expect(createTransientGenerationId()).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
    });
});
