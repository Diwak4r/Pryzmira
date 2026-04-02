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

function getGroqApiKey(): string {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured.');
    }

    return apiKey;
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
        'You analyze a real writing sample and extract specific voice traits.',
        'Study only the sample.',
        'Do not invent biography, intent, or facts outside the sample.',
        'If the sample mixes Nepali and English, describe that precisely. If it does not, say so.',
        'Return strict JSON with these keys only: tone, sentenceRhythm, vocabularyHabits, transitions, languageMixing, closingStyle, voiceInsights, insightBullets.',
        'insightBullets must contain 5 to 7 concrete observations.',
    ].join(' ');

    const userPrompt = `Analyze this writing sample:\n\n${sampleText}`;
    const raw = await groqChatCompletion(
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
        'You are a personal writing voice model.',
        'Write the requested text so it sounds like the user who wrote the sample.',
        'Preserve tone, rhythm, vocabulary, and code-switching only when the sample actually shows it.',
        'Do not invent facts, claims, experience, or details not implied by the task or sample.',
        'Do not produce generic AI phrasing.',
        'Do not copy the sample verbatim unless the task clearly requires a phrase from it.',
        'Do not reproduce accidental typos or broken grammar unless they are clearly part of the writer style.',
        'Return only the requested final text.',
    ].join(' ');

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

    return groqChatCompletion(
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
