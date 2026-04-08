export const MIN_SAMPLE_WORDS = 50;
export const MAX_SAMPLE_CHARACTERS = 8000;

export interface VoiceAnalysis {
    tone: string;
    sentenceRhythm: string;
    vocabularyHabits: string;
    transitions: string;
    languageMixing: string;
    closingStyle: string;
}

export interface VoiceContext {
    sampleText: string;
    analysis: VoiceAnalysis;
    voiceInsights: string;
    insightBullets: string[];
    latestTask?: string;
    latestInstructions?: string;
}

export interface VoiceResponsePayload {
    outputText: string;
    voiceInsights: string;
    insightBullets: string[];
    voiceContext: VoiceContext;
    preview: string;
    remainingQuota: number;
    quotaLimit: number;
    isAuthenticated: boolean;
    createdAt: string;
}

export interface VoiceHistoryItem {
    id: string;
    profileId?: string | null;
    writingTask: string;
    extraInstructions?: string | null;
    outputText: string;
    preview: string;
    createdAt: string;
    persisted: boolean;
}

export interface VoiceSavedGeneration extends VoiceHistoryItem {
    voiceInsights: string;
    insightBullets: string[];
    voiceContext: VoiceContext;
}

export interface VoiceProfileRecord {
    id: string;
    userId: string;
    sampleText: string;
    analysis: VoiceAnalysis;
    voiceInsights: string;
    insightBullets: string[];
    createdAt: string;
    updatedAt: string;
}

export interface VoiceGenerationRecord extends VoiceHistoryItem {
    userId: string;
}

export function normalizeMultilineInput(value: string): string {
    return value.replace(/\r\n/g, '\n').trim();
}

export function countWords(value: string): number {
    const normalized = normalizeMultilineInput(value);
    if (!normalized) {
        return 0;
    }

    return normalized.split(/\s+/).filter(Boolean).length;
}

export function sanitizeSampleText(value: string): string {
    const normalized = normalizeMultilineInput(value);
    if (normalized.length <= MAX_SAMPLE_CHARACTERS) {
        return normalized;
    }

    return normalized.slice(0, MAX_SAMPLE_CHARACTERS).trim();
}

export function sanitizeWritingTask(value: string): string {
    return normalizeMultilineInput(value);
}

export function sanitizeExtraInstructions(value: string | null | undefined): string {
    return normalizeMultilineInput(value || '');
}

export function createPreview(outputText: string): string {
    const compact = normalizeMultilineInput(outputText).replace(/\s+/g, ' ');
    if (compact.length <= 180) {
        return compact;
    }

    return `${compact.slice(0, 177).trim()}...`;
}

export function validateGenerateInput(input: {
    sampleText?: unknown;
    writingTask?: unknown;
    extraInstructions?: unknown;
}): { sampleText: string; writingTask: string; extraInstructions: string } {
    const sampleText = sanitizeSampleText(typeof input.sampleText === 'string' ? input.sampleText : '');
    const writingTask = sanitizeWritingTask(typeof input.writingTask === 'string' ? input.writingTask : '');
    const extraInstructions = sanitizeExtraInstructions(
        typeof input.extraInstructions === 'string' ? input.extraInstructions : ''
    );

    if (countWords(sampleText) < MIN_SAMPLE_WORDS) {
        throw new Error(
            `Your writing sample needs at least ${MIN_SAMPLE_WORDS} words so the voice analysis has enough signal.`
        );
    }

    if (!writingTask) {
        throw new Error('Describe what you want written.');
    }

    return {
        sampleText,
        writingTask,
        extraInstructions,
    };
}

export function validateRefineInput(input: {
    voiceContext?: unknown;
    previousOutput?: unknown;
    refineInstruction?: unknown;
}): { voiceContext: VoiceContext; previousOutput: string; refineInstruction: string } {
    if (!input.voiceContext) {
        throw new Error('Voice context is missing. Generate once before refining.');
    }

    const previousOutput = normalizeMultilineInput(typeof input.previousOutput === 'string' ? input.previousOutput : '');
    const refineInstruction = sanitizeWritingTask(
        typeof input.refineInstruction === 'string' ? input.refineInstruction : ''
    );

    if (!previousOutput) {
        throw new Error('Previous output is missing. Generate once before refining.');
    }

    if (!refineInstruction) {
        throw new Error('Refine instruction is required.');
    }

    return {
        voiceContext: input.voiceContext as VoiceContext,
        previousOutput,
        refineInstruction,
    };
}
