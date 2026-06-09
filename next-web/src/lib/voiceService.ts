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
const MAX_ANCHORS = 6;

const GENERIC_PHRASES = [
    'i hope this email finds you well',
    'i hope this message finds you well',
    'i wanted to reach out',
    'in conclusion',
    'furthermore',
    'moreover',
    'it is important to note',
    'please do not hesitate to',
    'if you have any questions, feel free',
    'in today\'s fast-paced world',
    'thank you for your time and consideration',
];

const STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'been',
    'but',
    'by',
    'for',
    'from',
    'had',
    'has',
    'have',
    'he',
    'her',
    'here',
    'him',
    'his',
    'i',
    'if',
    'in',
    'is',
    'it',
    'its',
    'just',
    'me',
    'my',
    'no',
    'not',
    'of',
    'on',
    'or',
    'our',
    'ours',
    'she',
    'so',
    'that',
    'the',
    'their',
    'them',
    'there',
    'they',
    'this',
    'to',
    'too',
    'us',
    'was',
    'we',
    'were',
    'what',
    'when',
    'where',
    'which',
    'who',
    'will',
    'with',
    'you',
    'your',
]);

interface VoiceSignals {
    averageSentenceWords: number;
    shortSentenceRatio: number;
    longSentenceRatio: number;
    contractionRate: number;
    usesContractions: boolean;
    questionRate: number;
    exclamationRate: number;
    lexicalAnchors: string[];
    phraseAnchors: string[];
}

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

async function dashscopeChatCompletion(messages: GroqMessage[], temperature: number): Promise<string> {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) throw new Error('DASHSCOPE_API_KEY is not configured.');

    const model = process.env.DASHSCOPE_MODEL || 'qwen-long';
    let response: Response;

    try {
        response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                temperature,
                messages,
            }),
            cache: 'no-store',
        });
    } catch (error) {
        console.error('DashScope transport failure', error);
        throw new Error(VOICE_ENGINE_UNAVAILABLE_MESSAGE);
    }

    const payload = (await response.json().catch(() => ({}))) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
    };

    if (!response.ok) {
        throw new Error(payload.error?.message || 'DashScope request failed.');
    }

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
        throw new Error('DashScope returned an empty response.');
    }

    return content;
}

async function chatCompletion(messages: GroqMessage[], model: string, temperature: number): Promise<string> {
    try {
        return await groqChatCompletion(messages, model, temperature);
    } catch (groqError) {
        console.warn('Groq failed, trying DashScope:', groqError instanceof Error ? groqError.message : groqError);

        const dashscopeKey = process.env.DASHSCOPE_API_KEY;
        if (dashscopeKey) {
            try {
                return await dashscopeChatCompletion(messages, temperature);
            } catch (dashscopeError) {
                console.warn('DashScope failed, falling back to OpenRouter:', dashscopeError instanceof Error ? dashscopeError.message : dashscopeError);
            }
        }

        const openRouterKey = getOpenRouterApiKey();
        if (!openRouterKey) throw groqError;

        console.warn('Groq & DashScope failed, falling back to OpenRouter:', groqError instanceof Error ? groqError.message : groqError);
        return openRouterChatCompletion(messages, temperature);
    }
}

function normalizePromptText(value: string): string {
    return value.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function splitSentences(value: string): string[] {
    return value
        .replace(/\r\n/g, '\n')
        .split(/(?<=[.!?])\s+|\n+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function countWordsInText(value: string): number {
    const words = value.match(/\b[\p{L}\p{N}'-]+\b/gu);
    return words?.length || 0;
}

function extractTopLexicalAnchors(sampleText: string, maxItems = MAX_ANCHORS): string[] {
    const words = sampleText.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
    const counts = new Map<string, number>();

    for (const word of words) {
        const normalized = word.replace(/^'+|'+$/g, '');
        if (normalized.length < 4 || STOP_WORDS.has(normalized)) {
            continue;
        }

        counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }

    return Array.from(counts.entries())
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return b[0].length - a[0].length;
        })
        .slice(0, maxItems)
        .map(([token]) => token);
}

function extractTopPhraseAnchors(sampleText: string, maxItems = 4): string[] {
    const words = sampleText.toLowerCase().match(/[a-z][a-z'-]{1,}/g) || [];
    const counts = new Map<string, number>();

    for (let index = 0; index < words.length - 1; index += 1) {
        const first = words[index];
        const second = words[index + 1];

        if (STOP_WORDS.has(first) && STOP_WORDS.has(second)) {
            continue;
        }

        const phrase = `${first} ${second}`.trim();
        if (phrase.length < 8) {
            continue;
        }

        counts.set(phrase, (counts.get(phrase) || 0) + 1);
    }

    return Array.from(counts.entries())
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return b[0].length - a[0].length;
        })
        .slice(0, maxItems)
        .map(([phrase]) => phrase);
}

function buildVoiceSignals(sampleText: string): VoiceSignals {
    const normalized = normalizePromptText(sampleText);
    const sentences = splitSentences(normalized);
    const sentenceWordCounts = sentences.map((sentence) => countWordsInText(sentence));
    const totalWords = countWordsInText(normalized);
    const shortSentenceCount = sentenceWordCounts.filter((count) => count > 0 && count <= 10).length;
    const longSentenceCount = sentenceWordCounts.filter((count) => count >= 22).length;
    const contractionCount =
        normalized.match(/\b[\w]+(?:'ll|'re|'ve|n't|'m|'d|'s)\b/gi)?.length || 0;
    const questionCount = sentences.filter((sentence) => sentence.includes('?')).length;
    const exclamationCount = sentences.filter((sentence) => sentence.includes('!')).length;
    const sentenceCount = Math.max(sentences.length, 1);
    const averageSentenceWords =
        sentenceWordCounts.length > 0
            ? Math.round(
                  (sentenceWordCounts.reduce((sum, count) => sum + count, 0) / sentenceWordCounts.length) *
                      10
              ) / 10
            : 12;

    return {
        averageSentenceWords: Math.max(6, averageSentenceWords),
        shortSentenceRatio: shortSentenceCount / sentenceCount,
        longSentenceRatio: longSentenceCount / sentenceCount,
        contractionRate: totalWords > 0 ? contractionCount / totalWords : 0,
        usesContractions: contractionCount > 0,
        questionRate: questionCount / sentenceCount,
        exclamationRate: exclamationCount / sentenceCount,
        lexicalAnchors: extractTopLexicalAnchors(normalized),
        phraseAnchors: extractTopPhraseAnchors(normalized),
    };
}

function buildVoiceContractLines(input: {
    analysis: VoiceAnalysis;
    voiceInsights?: string;
    insightBullets?: string[];
    signals: VoiceSignals;
}): string[] {
    const { analysis, voiceInsights, insightBullets, signals } = input;
    const sentencePacingLine =
        signals.shortSentenceRatio >= 0.5
            ? `The writer favors short lines. Keep sentence length near ${signals.averageSentenceWords} words.`
            : signals.longSentenceRatio >= 0.35
              ? `The writer tolerates longer flow. Keep sentence length near ${signals.averageSentenceWords} words with controlled variety.`
              : `Use mixed sentence length centered around ${signals.averageSentenceWords} words.`;
    const contractionLine = signals.usesContractions
        ? `Contractions are normal in this voice (rate ~${Math.round(signals.contractionRate * 100)}%). Keep them natural.`
        : 'Contractions are rare in this voice. Use them sparingly.';
    const punctuationLine =
        signals.questionRate > 0.2
            ? 'Questions are part of this writer style. Use direct questions when relevant.'
            : signals.exclamationRate > 0.12
              ? 'Exclamation marks appear in this voice. Keep them minimal and intentional.'
              : 'Punctuation style is calm and controlled. Avoid dramatic punctuation.';

    const lines = [
        sentencePacingLine,
        contractionLine,
        punctuationLine,
        `Tone target: ${analysis.tone}`,
        `Rhythm target: ${analysis.sentenceRhythm}`,
        `Vocabulary habits: ${analysis.vocabularyHabits}`,
        `Transitions: ${analysis.transitions}`,
        `Language mixing: ${analysis.languageMixing}`,
        `Closing style: ${analysis.closingStyle}`,
    ];

    if (voiceInsights) {
        lines.push(`Voice summary: ${voiceInsights}`);
    }

    if (insightBullets && insightBullets.length > 0) {
        lines.push(`Critical style markers: ${insightBullets.slice(0, 5).join(' | ')}`);
    }

    if (signals.lexicalAnchors.length > 0) {
        lines.push(`Lexical anchors from sample: ${signals.lexicalAnchors.join(', ')}`);
    }

    if (signals.phraseAnchors.length > 0) {
        lines.push(`Phrase anchors from sample: ${signals.phraseAnchors.join(' | ')}`);
    }

    return lines;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countGenericPhraseHits(outputText: string): number {
    const normalized = outputText.toLowerCase();
    return GENERIC_PHRASES.filter((phrase) => normalized.includes(phrase)).length;
}

function shouldRetryForGenericness(outputText: string, signals: VoiceSignals): boolean {
    const normalized = normalizePromptText(outputText);
    if (!normalized) return true;

    const genericHits = countGenericPhraseHits(normalized);
    if (genericHits > 0) {
        return true;
    }

    const sentences = splitSentences(normalized);
    const sentenceCount = Math.max(sentences.length, 1);
    const totalWords = countWordsInText(normalized);
    const averageSentenceWords = totalWords / sentenceCount;
    const shortSentenceRatio =
        sentences.filter((sentence) => {
            const wordCount = countWordsInText(sentence);
            return wordCount > 0 && wordCount <= 10;
        }).length / sentenceCount;
    const contractionCount =
        normalized.match(/\b[\w]+(?:'ll|'re|'ve|n't|'m|'d|'s)\b/gi)?.length || 0;

    if (signals.shortSentenceRatio > 0.45 && shortSentenceRatio < 0.2) {
        return true;
    }

    if (averageSentenceWords > signals.averageSentenceWords + 7) {
        return true;
    }

    if (signals.usesContractions && contractionCount === 0 && totalWords > 45) {
        return true;
    }

    if (signals.lexicalAnchors.length > 0 && totalWords > 60) {
        const anchorHit = signals.lexicalAnchors.some((anchor) =>
            new RegExp(`\\b${escapeRegExp(anchor)}\\b`, 'i').test(normalized)
        );

        if (!anchorHit) {
            return true;
        }
    }

    return false;
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
        '- sentenceRhythm: How sentences flow - length variation, fragments, run-ons, pacing patterns.',
        '- vocabularyHabits: Specific word choices, jargon, slang, repeated phrases, formality level.',
        '- transitions: How ideas connect - abrupt cuts, smooth segues, conjunctions, paragraph breaks.',
        '- languageMixing: Code-switching patterns (e.g., "Nepali words mid-sentence for emphasis"), or "English only" if none.',
        '- closingStyle: How the writer ends messages/paragraphs - trailing off, strong conclusions, calls to action, casual sign-offs.',
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
    voiceInsights?: string;
    insightBullets?: string[];
    writingTask: string;
    extraInstructions?: string;
    previousOutput?: string;
    refineInstruction?: string;
}): Promise<string> {
    const signals = buildVoiceSignals(input.sampleText);
    const voiceContract = buildVoiceContractLines({
        analysis: input.analysis,
        voiceInsights: input.voiceInsights,
        insightBullets: input.insightBullets,
        signals,
    });
    const systemPrompt = [
        'You are Pryzmira Voice Engine, a high-fidelity ghostwriter.',
        'Your output must read like this exact person wrote it.',
        '',
        'Non-negotiable writing rules:',
        '- Use simple English: short, familiar words and direct sentence construction.',
        '- Match this person voice exactly using the dynamic contract below.',
        '- Keep wording concrete and human.',
        '- Preserve their tone, rhythm, vocabulary habits, transitions, and closing style.',
        '- Follow language mixing only when analysis says it is present.',
        '- Never output generic assistant/corporate phrases.',
        '- Never add facts, claims, or biography not requested.',
        '- Never output prefaces, labels, or explanations. Output only the final draft text.',
        '',
        'Dynamic voice contract:',
        ...voiceContract.map((line) => `- ${line}`),
    ].join('\n');

    const analysisBlock = JSON.stringify(input.analysis, null, 2);
    const insightsBlock =
        input.insightBullets && input.insightBullets.length > 0
            ? input.insightBullets.map((entry, index) => `${index + 1}. ${entry}`).join('\n')
            : 'No extra insight bullets available.';
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
        `Voice insight bullets:\n${insightsBlock}`,
        `Writing task:\n${input.writingTask}`,
        extraBlock.trim(),
        refineBlock.trim(),
    ]
        .filter(Boolean)
        .join('\n\n');
    const model = getGroqModel('generate');
    const firstDraft = await chatCompletion(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        model,
        0.55
    );

    if (!shouldRetryForGenericness(firstDraft, signals)) {
        return firstDraft;
    }

    const retryInstruction = [
        'The previous draft is too generic, too formal, or not close enough to the writer style.',
        'Rewrite it now with higher fidelity to the voice contract.',
        'Keep simple English and avoid boilerplate phrasing.',
        'Keep the same task and intent.',
        'Output only the rewritten text.',
    ].join('\n');

    try {
        return await chatCompletion(
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
                { role: 'assistant', content: firstDraft },
                { role: 'user', content: retryInstruction },
            ],
            model,
            0.45
        );
    } catch (retryError) {
        console.warn('Genericness retry failed, using first draft', retryError);
        return firstDraft;
    }
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
        voiceInsights: analyzed.voiceInsights,
        insightBullets: analyzed.insightBullets,
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
        voiceInsights: input.voiceContext.voiceInsights,
        insightBullets: input.voiceContext.insightBullets,
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
