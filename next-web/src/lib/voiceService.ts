import { randomUUID } from 'node:crypto';
import {
    createPreview,
    type VoiceAnalysis,
    type VoiceContext,
    type VoiceResponsePayload,
} from '@/lib/voice';
import { VOICE_ENGINE_UNAVAILABLE_MESSAGE } from '@/lib/voiceRequestError';

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface AnalyzeResult {
    analysis: VoiceAnalysis;
    voiceInsights: string;
    insightBullets: string[];
}

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

function getGroqApiKey(): string {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured.');
    }

    return apiKey;
}

function getOpenRouterApiKey(): string | null {
    return process.env.OPENROUTER_API_KEY || null;
}

function getGroqModel(name: 'analyze' | 'generate'): string {
    if (name === 'analyze') {
        return process.env.GROQ_ANALYZE_MODEL || DEFAULT_GROQ_MODEL;
    }

    return process.env.GROQ_GENERATE_MODEL || DEFAULT_GROQ_MODEL;
}

async function groqChatCompletion(messages: GroqMessage[], model: string, temperature: number): Promise<string> {
    let response: Response;

    try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getGroqApiKey()}`,
            },
            body: JSON.stringify({
                model,
                temperature,
                messages,
            }),
            cache: 'no-store',
        });
    } catch (error) {
        console.error('Groq chat completion transport failure', {
            model,
            error,
        });
        throw new Error(VOICE_ENGINE_UNAVAILABLE_MESSAGE);
    }

    const payload = (await response.json().catch(() => ({}))) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
    };

    if (!response.ok) {
        throw new Error(payload.error?.message || 'Groq request failed.');
    }

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new Error('Groq returned an empty response.');
    }

    return content;
}

async function openRouterChatCompletion(messages: GroqMessage[], temperature: number): Promise<string> {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured.');

    let response: Response;

    try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://pryzmira.diwakaryadav.com.np',
                'X-Title': 'Pryzmira',
            },
            body: JSON.stringify({
                model: DEFAULT_OPENROUTER_MODEL,
                temperature,
                messages,
            }),
            cache: 'no-store',
        });
    } catch (error) {
        console.error('OpenRouter transport failure', error);
        throw new Error(VOICE_ENGINE_UNAVAILABLE_MESSAGE);
    }

    const payload = (await response.json().catch(() => ({}))) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
    };

    if (!response.ok) {
        throw new Error(payload.error?.message || 'OpenRouter request failed.');
    }

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new Error('OpenRouter returned an empty response.');
    }

    return content;
}

async function chatCompletion(messages: GroqMessage[], model: string, temperature: number): Promise<string> {
    try {
        return await groqChatCompletion(messages, model, temperature);
    } catch (groqError) {
        const openRouterKey = getOpenRouterApiKey();
        if (!openRouterKey) throw groqError;

        console.warn('Groq failed, falling back to OpenRouter:', groqError instanceof Error ? groqError.message : groqError);
        return openRouterChatCompletion(messages, temperature);
    }
}

function extractJsonObject(raw: string): Record<string, unknown> {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
        throw new Error('Voice analysis returned invalid JSON.');
    }

    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

function normalizeAnalysisPayload(raw: string): AnalyzeResult {
    const parsed = extractJsonObject(raw);
    const insightBullets = Array.isArray(parsed.insightBullets)
        ? parsed.insightBullets.filter((entry): entry is string => typeof entry === 'string').slice(0, 7)
        : [];

    if (insightBullets.length < 5) {
        throw new Error('Voice analysis did not return enough insight bullets.');
    }

    return {
        analysis: {
            tone: typeof parsed.tone === 'string' ? parsed.tone : 'Unclear from sample',
            sentenceRhythm:
                typeof parsed.sentenceRhythm === 'string'
                    ? parsed.sentenceRhythm
                    : 'Unclear from sample',
            vocabularyHabits:
                typeof parsed.vocabularyHabits === 'string'
                    ? parsed.vocabularyHabits
                    : 'Unclear from sample',
            transitions:
                typeof parsed.transitions === 'string'
                    ? parsed.transitions
                    : 'Unclear from sample',
            languageMixing:
                typeof parsed.languageMixing === 'string'
                    ? parsed.languageMixing
                    : 'Unclear from sample',
            closingStyle:
                typeof parsed.closingStyle === 'string'
                    ? parsed.closingStyle
                    : 'Unclear from sample',
        },
        voiceInsights:
            typeof parsed.voiceInsights === 'string'
                ? parsed.voiceInsights
                : 'Voice analysis is ready.',
        insightBullets,
    };
}

export async function analyzeVoice(sampleText: string): Promise<AnalyzeResult> {
    const systemPrompt = [
        'You are an expert linguist and voice analyst.',
        'Your task is to analyze a real writing sample and extract the writer\'s unique voice fingerprint.',
        'Study ONLY what is present in the sample. Do not infer biography, intent, or facts not in the text.',
        '',
        'Analyze these dimensions precisely:',
        '- tone: The emotional register (e.g., "warm but direct", "sarcastically playful", "professionally casual"). Avoid generic labels.',
        '- sentenceRhythm: How sentences flow — length variation, fragments, run-ons, pacing patterns.',
        '- vocabularyHabits: Specific word choices, jargon, slang, repeated phrases, formality level.',
        '- transitions: How ideas connect — abrupt cuts, smooth segues, conjunctions, paragraph breaks.',
        '- languageMixing: Code-switching patterns (e.g., "Nepali words mid-sentence for emphasis"), or "English only" if none.',
        '- closingStyle: How the writer ends messages/paragraphs — trailing off, strong conclusions, calls to action, casual sign-offs.',
        '',
        'For voiceInsights: Write a 2-3 sentence narrative summary of what makes this writer\'s voice distinctive. Be specific, not generic.',
        'For insightBullets: List 5-7 concrete, actionable observations that a ghostwriter would need to replicate this voice. Each bullet should be specific enough to distinguish this writer from others.',
        '',
        'Return strict JSON: { tone, sentenceRhythm, vocabularyHabits, transitions, languageMixing, closingStyle, voiceInsights, insightBullets }',
    ].join('\n');

    const userPrompt = `Analyze this writing sample:\n\n${sampleText}`;
    const raw = await chatCompletion(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        getGroqModel('analyze'),
        0.2
    );

    return normalizeAnalysisPayload(raw);
}

export async function generateInVoice(input: {
    sampleText: string;
    analysis: VoiceAnalysis;
    writingTask: string;
    extraInstructions?: string;
    previousOutput?: string;
    refineInstruction?: string;
}): Promise<string> {
    const systemPrompt = [
        'You are a personal voice model — a ghostwriter who has deeply studied the writer\'s style.',
        'Your job: write the requested text so it is indistinguishable from what the original writer would produce.',
        '',
        'Voice replication rules:',
        '- Match the exact tone, sentence rhythm, and vocabulary level from the analysis.',
        '- If the writer uses short punchy sentences, you use short punchy sentences. If they write long flowing paragraphs, you do too.',
        '- Replicate their specific word choices and formality level, not a sanitized version.',
        '- Preserve code-switching patterns ONLY if the analysis shows them. Do not add language mixing that isn\'t in the sample.',
        '- Match their transition style — if they jump between ideas, you jump. If they use smooth connectors, you do too.',
        '- Match their closing style precisely.',
        '',
        'Absolute prohibitions:',
        '- Never produce generic AI phrasing ("I hope this email finds you well", "In conclusion", "I wanted to reach out").',
        '- Never add formality the writer doesn\'t use.',
        '- Never remove informality the writer does use.',
        '- Never invent facts, credentials, experiences, or claims not implied by the task.',
        '- Never copy the sample verbatim unless the task explicitly requires it.',
        '- Never add emoji unless the sample shows emoji usage.',
        '',
        'Output ONLY the requested text. No meta-commentary, no "Here\'s the text:", no labels.',
    ].join('\n');

    const analysisBlock = JSON.stringify(input.analysis, null, 2);
    const refineBlock =
        input.previousOutput && input.refineInstruction
            ? `Previous output:\n${input.previousOutput}\n\nRefine instruction:\n${input.refineInstruction}\n\n`
            : '';
    const extraBlock = input.extraInstructions
        ? `Extra instructions:\n${input.extraInstructions}\n\n`
        : '';

    const userPrompt = [
        `Writing sample:\n${input.sampleText}`,
        `Voice analysis:\n${analysisBlock}`,
        `Writing task:\n${input.writingTask}`,
        extraBlock.trim(),
        refineBlock.trim(),
    ]
        .filter(Boolean)
        .join('\n\n');

    return chatCompletion(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        getGroqModel('generate'),
        0.65
    );
}

export async function buildVoiceResponse(input: {
    sampleText: string;
    writingTask: string;
    extraInstructions?: string;
    remainingQuota: number;
    quotaLimit: number;
    isAuthenticated: boolean;
}): Promise<VoiceResponsePayload> {
    const analyzed = await analyzeVoice(input.sampleText);
    const outputText = await generateInVoice({
        sampleText: input.sampleText,
        analysis: analyzed.analysis,
        writingTask: input.writingTask,
        extraInstructions: input.extraInstructions,
    });
    const createdAt = new Date().toISOString();

    return {
        outputText,
        voiceInsights: analyzed.voiceInsights,
        insightBullets: analyzed.insightBullets,
        voiceContext: {
            sampleText: input.sampleText,
            analysis: analyzed.analysis,
            voiceInsights: analyzed.voiceInsights,
            insightBullets: analyzed.insightBullets,
            latestTask: input.writingTask,
            latestInstructions: input.extraInstructions,
        },
        preview: createPreview(outputText),
        remainingQuota: input.remainingQuota,
        quotaLimit: input.quotaLimit,
        isAuthenticated: input.isAuthenticated,
        createdAt,
    };
}

export async function buildRefinedVoiceResponse(input: {
    voiceContext: VoiceContext;
    previousOutput: string;
    refineInstruction: string;
    remainingQuota: number;
    quotaLimit: number;
    isAuthenticated: boolean;
}): Promise<VoiceResponsePayload> {
    const outputText = await generateInVoice({
        sampleText: input.voiceContext.sampleText,
        analysis: input.voiceContext.analysis,
        writingTask: input.voiceContext.latestTask || 'Refine the existing draft.',
        extraInstructions: input.voiceContext.latestInstructions,
        previousOutput: input.previousOutput,
        refineInstruction: input.refineInstruction,
    });
    const createdAt = new Date().toISOString();

    return {
        outputText,
        voiceInsights: input.voiceContext.voiceInsights,
        insightBullets: input.voiceContext.insightBullets,
        voiceContext: {
            ...input.voiceContext,
        },
        preview: createPreview(outputText),
        remainingQuota: input.remainingQuota,
        quotaLimit: input.quotaLimit,
        isAuthenticated: input.isAuthenticated,
        createdAt,
    };
}

export function createTransientGenerationId(): string {
    return randomUUID();
}
