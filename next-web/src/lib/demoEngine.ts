import {
    createPreview,
    type VoiceAnalysis,
    type VoiceContext,
    type VoiceResponsePayload,
} from '@/lib/voice';

/**
 * Demo mode is a local, deterministic stand-in for the AI pipeline.
 *
 * It exists so the product can be walked end to end without provider keys.
 * It never calls a model, it never pretends to: drafts are scaffolds with
 * bracketed placeholders, and every response carries `demo: true` so the UI
 * can label it.
 */

type EnvLike = NodeJS.ProcessEnv | Record<string, string | undefined>;

// Stored as a source string so both global matching and boolean tests can use
// it without sharing `lastIndex` state.
const CONTRACTION_PATTERN =
    "\\b(?:i'm|i've|i'd|i'll|you're|you've|we're|we've|they're|it's|that's|there's|don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|couldn't|wouldn't|shouldn't|haven't|hasn't|hadn't)\\b";

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this', 'these', 'those',
    'to', 'of', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'about', 'as', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would',
    'can', 'could', 'should', 'my', 'your', 'our', 'their', 'his', 'her', 'its', 'it', 'i', 'you',
    'we', 'they', 'me', 'us', 'them', 'so', 'not', 'no', 'yes', 'just', 'really', 'very', 'also',
    'write', 'writing', 'email', 'message', 'note', 'short', 'please', 'make', 'need', 'want',
]);

const OPENERS = [
    'Quick note about',
    'Short update on',
    'Here is where things stand with',
    'A fast one about',
];

const CLOSERS = [
    'Let me know what you think.',
    'Tell me if I missed anything.',
    'Happy to change the approach if this does not land.',
    'I will follow up if anything shifts.',
];

const FORMAL_MAP: Array<[RegExp, string]> = [
    [/\bi'm\b/gi, 'I am'],
    [/\bi've\b/gi, 'I have'],
    [/\bi'd\b/gi, 'I would'],
    [/\bi'll\b/gi, 'I will'],
    [/\byou're\b/gi, 'you are'],
    [/\bwe're\b/gi, 'we are'],
    [/\bwe've\b/gi, 'we have'],
    [/\bit's\b/gi, 'it is'],
    [/\bthat's\b/gi, 'that is'],
    [/\bdon't\b/gi, 'do not'],
    [/\bdoesn't\b/gi, 'does not'],
    [/\bdidn't\b/gi, 'did not'],
    [/\bcan't\b/gi, 'cannot'],
    [/\bwon't\b/gi, 'will not'],
    [/\bisn't\b/gi, 'is not'],
    [/\bcan't\b/gi, 'cannot'],
];

export function isDemoModeEnabled(env: EnvLike = process.env): boolean {
    const explicit = env.PRYZMIRA_DEMO_MODE?.trim().toLowerCase();
    if (explicit === 'true') {
        return true;
    }

    if (explicit === 'false') {
        return false;
    }

    const hasKey = (value: string | undefined): boolean => Boolean(value?.trim());

    return (
        !hasKey(env.GROQ_API_KEY) && !hasKey(env.OPENROUTER_API_KEY) && !hasKey(env.DASHSCOPE_API_KEY)
    );
}

export type ProviderId = 'groq' | 'dashscope' | 'openrouter';

export function configuredProviders(env: EnvLike = process.env): ProviderId[] {
    const providers: ProviderId[] = [];
    if (env.GROQ_API_KEY?.trim()) providers.push('groq');
    if (env.DASHSCOPE_API_KEY?.trim()) providers.push('dashscope');
    if (env.OPENROUTER_API_KEY?.trim()) providers.push('openrouter');
    return providers;
}

function splitSentences(text: string): string[] {
    return text
        .replace(/\r\n/g, '\n')
        .split(/(?<=[.!?])\s+|\n+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function countWords(text: string): number {
    return (text.match(/\b[\p{L}\p{N}'-]+\b/gu) || []).length;
}

function topKeywords(text: string, max = 4): string[] {
    const counts = new Map<string, number>();

    for (const match of text.toLowerCase().matchAll(/\b[\p{L}][\p{L}'-]{3,}\b/gu)) {
        const word = match[0];
        if (STOP_WORDS.has(word)) {
            continue;
        }

        counts.set(word, (counts.get(word) || 0) + 1);
    }

    return [...counts.entries()]
        .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
        .slice(0, max)
        .map(([word]) => word);
}

function hashString(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }

    return hash;
}

function pick<T>(items: T[], seed: number): T {
    return items[seed % items.length];
}

export interface DemoAnalysis {
    analysis: VoiceAnalysis;
    voiceInsights: string;
    insightBullets: string[];
}

/**
 * A local approximation of the analysis step. It measures real properties of
 * the sample (length, contraction rate, repetition) rather than inventing
 * stylistic claims, and every value stays short enough for the desk grid.
 */
export function analyzeSampleLocally(sampleText: string): DemoAnalysis {
    const normalized = sampleText.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
    const sentences = splitSentences(normalized);
    const totalWords = countWords(normalized);
    const wordCounts = sentences.map((sentence) => countWords(sentence)).filter((count) => count > 0);
    const averageSentenceWords = wordCounts.length
        ? Math.round((wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length) * 10) / 10
        : 0;
    const contractionCount = (normalized.match(new RegExp(CONTRACTION_PATTERN, 'gi')) || []).length;
    const contractionRate = totalWords > 0 ? Math.round((contractionCount / totalWords) * 100) : 0;
    const questionCount = sentences.filter((sentence) => sentence.includes('?')).length;
    const questionRate = sentences.length ? Math.round((questionCount / sentences.length) * 100) : 0;
    const keywords = topKeywords(normalized);
    const closing = sentences[sentences.length - 1] || normalized;
    const hasNonLatin = /[^\u0000-\u024f]/.test(normalized);

    const analysis: VoiceAnalysis = {
        tone:
            contractionRate >= 2
                ? 'informal and conversational (local estimate)'
                : 'measured and formal (local estimate)',
        sentenceRhythm: `${averageSentenceWords} words per sentence on average across ${sentences.length} ${
            sentences.length === 1 ? 'sentence' : 'sentences'
        }${questionRate > 20 ? ', with regular questions' : ''}`,
        vocabularyHabits: keywords.length
            ? `Most distinctive words: ${keywords.slice(0, 3).join(', ')}`
            : 'No strong repeated words in this sample',
        transitions: (() => {
            const count = (normalized.match(/\b(but|so|because|then|instead|anyway)\b/gi) || []).length;
            return `${count} simple joining ${count === 1 ? 'word' : 'words'} (but, so, because)`;
        })(),
        languageMixing: hasNonLatin ? 'Contains non-Latin script or symbols' : 'English only (as detected locally)',
        closingStyle: closing.length > 60 ? `${closing.slice(0, 57).trim()}...` : closing || 'No closing sentence',
    };

    const voiceInsights = [
        `Local estimate only: this sample runs ${totalWords} words across ${sentences.length} sentences,`,
        `with an average of ${averageSentenceWords} words per sentence and a contraction rate of about ${contractionRate}%.`,
        keywords.length ? `The words it returns to most are ${keywords.join(', ')}.` : '',
    ]
        .filter(Boolean)
        .join(' ');

    const insightBullets = [
        `Average sentence length: ${averageSentenceWords} words.`,
        `Contractions: ${contractionCount} in ${totalWords} words (~${contractionRate}%).`,
        questionRate > 0 ? `Questions: ${questionCount} of ${sentences.length} sentences.` : 'No questions in the sample.',
        keywords.length ? `Repeated vocabulary: ${keywords.join(', ')}.` : 'No repeated vocabulary detected.',
        `Opening line: ${sentences[0] || 'not available'}.`,
        `Closing line: ${closing || 'not available'}.`,
        'Everything on this panel was measured locally, not generated by a model.',
    ];

    return { analysis, voiceInsights, insightBullets };
}

function taskKeywords(writingTask: string): string[] {
    return topKeywords(writingTask, 5);
}

/**
 * Pulls a natural subject out of the task. "Write a short email to my teammate
 * about the migration plan" becomes "migration plan" rather than a bag of
 * keywords, which keeps the demo opener readable.
 */
const LEADING_TASK_VERBS = new Set([
    'write', 'draft', 'compose', 'create', 'make', 'summarize', 'summarise', 'explain',
    'tell', 'send', 'give', 'prepare', 'describe', 'turn',
]);

function extractTopic(writingTask: string, keywords: string[]): string {
    const afterPreposition = writingTask.match(/\b(?:about|regarding|on|for|re)\b\s+(.+)$/i);
    const raw = (afterPreposition ? afterPreposition[1] : writingTask)
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .trim();
    const words = raw.split(/\s+/).filter(Boolean);

    if (!afterPreposition) {
        while (words.length > 1 && LEADING_TASK_VERBS.has(words[0].toLowerCase())) {
            words.shift();
        }
    }

    if (words.length) {
        return words.slice(0, 5).join(' ');
    }

    return keywords.slice(0, 3).join(' ') || 'the thing you asked for';
}

function contractionWord(sampleText: string): string {
    return new RegExp(CONTRACTION_PATTERN, 'i').test(sampleText) ? "I'd" : 'I would';
}

/**
 * Builds a scaffold that mirrors the writer's measured habits while leaving
 * the facts to the human. Placeholders are deliberate: a demo draft must never
 * look like a finished model generation.
 */
export function composeDemoDraft(input: {
    sampleText: string;
    writingTask: string;
    extraInstructions?: string;
}): string {
    const sentences = splitSentences(input.sampleText);
    const averageSentenceWords = Math.round(
        (sentences.reduce((sum, sentence) => sum + countWords(sentence), 0) || 120) /
            Math.max(sentences.length, 1)
    );
    const seed = hashString(`${input.sampleText.slice(0, 120)}|${input.writingTask}`);
    const keywords = taskKeywords(input.writingTask);
    const topic = extractTopic(input.writingTask, keywords);
    const opener = pick(OPENERS, seed);
    const closer = pick(CLOSERS, seed >> 3);
    const contraction = contractionWord(input.sampleText);
    const shortPacing = averageSentenceWords <= 14;

    const secondSentence = shortPacing
        ? `The short version: [one sentence on where it stands right now].`
        : `Here is the honest version, with the parts that matter and the parts I am still working through: [one sentence on where it stands right now].`;

    const paragraphs = [
        `${opener} ${topic}. ${secondSentence}`,
        [
            `[The one specific detail that makes this real - a date, a number, a name.]`,
            `${contraction} rather be clear now than fix it later.`,
            `[What you are doing about it, in one line.]`,
        ].join(' '),
        `[What you need from the reader, stated plainly.] ${closer}`,
    ];

    if (input.extraInstructions?.trim()) {
        paragraphs.push(`[Constraint to keep: ${input.extraInstructions.trim()}]`);
    }

    return paragraphs.join('\n\n');
}

/**
 * Deterministic "refinements" for demo mode. Only transformations that can be
 * done honestly without a model are applied; anything else says so.
 */
export function applyDemoRefine(previousOutput: string, instruction: string): string {
    const normalized = instruction.toLowerCase();
    const paragraphs = previousOutput.split(/\n{2,}/).filter(Boolean);

    if (/short|cut|trim|tighten|concise/.test(normalized) && paragraphs.length > 1) {
        return paragraphs.slice(0, Math.max(1, Math.ceil(paragraphs.length / 2))).join('\n\n');
    }

    if (/formal|professional/.test(normalized)) {
        let formal = previousOutput;
        for (const [pattern, replacement] of FORMAL_MAP) {
            formal = formal.replace(pattern, replacement);
        }
        return formal;
    }

    if (/warm|friendly|softer/.test(normalized)) {
        return `Hey - ${previousOutput.charAt(0).toLowerCase()}${previousOutput.slice(1)}`;
    }

    if (/long|detail|add|expand/.test(normalized)) {
        return `${previousOutput}\n\n[Add one more concrete detail here - a number, a date, or an example.]`;
    }

    return `${previousOutput}\n\n[Demo mode: "${instruction.trim()}" was noted but not applied. Connect a model key for real refinement.]`;
}

export interface DemoResponseInput {
    sampleText: string;
    writingTask: string;
    extraInstructions?: string;
    remainingQuota: number;
    quotaLimit: number;
    isAuthenticated: boolean;
    now?: Date;
}

export function buildDemoVoiceResponse(
    input: DemoResponseInput
): VoiceResponsePayload & { demo: true } {
    const analyzed = analyzeSampleLocally(input.sampleText);
    const outputText = composeDemoDraft({
        sampleText: input.sampleText,
        writingTask: input.writingTask,
        extraInstructions: input.extraInstructions,
    });
    const createdAt = (input.now || new Date()).toISOString();

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
        demo: true,
    };
}

export function buildDemoRefineResponse(input: {
    voiceContext: VoiceContext;
    previousOutput: string;
    refineInstruction: string;
    remainingQuota: number;
    quotaLimit: number;
    isAuthenticated: boolean;
    now?: Date;
}): VoiceResponsePayload & { demo: true } {
    const outputText = applyDemoRefine(input.previousOutput, input.refineInstruction);
    const createdAt = (input.now || new Date()).toISOString();

    return {
        outputText,
        voiceInsights: input.voiceContext.voiceInsights,
        insightBullets: input.voiceContext.insightBullets,
        voiceContext: { ...input.voiceContext },
        preview: createPreview(outputText),
        remainingQuota: input.remainingQuota,
        quotaLimit: input.quotaLimit,
        isAuthenticated: input.isAuthenticated,
        createdAt,
        demo: true,
    };
}
