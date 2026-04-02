import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
    VoiceContext,
    VoiceGenerationRecord,
    VoiceProfileRecord,
    VoiceSavedGeneration,
} from '@/lib/voice';

interface VoiceUsageRecord {
    id: string;
    subjectKey: string;
    subjectType: 'anonymous' | 'user';
    windowKey: string;
    usageCount: number;
    limitCount: number;
    createdAt: string;
    updatedAt: string;
}

interface LocalVoiceStore {
    voiceProfiles: VoiceProfileRecord[];
    voiceGenerations: VoiceGenerationRecord[];
    voiceUsage: VoiceUsageRecord[];
}

interface VoiceSaveInput {
    userId: string;
    voiceContext: VoiceContext;
    latestOutput: string;
    writingTask: string;
    extraInstructions?: string;
    preview: string;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'voice-store.json');

function buildVoiceContextFromProfile(
    profile: VoiceProfileRecord,
    writingTask: string,
    extraInstructions: string | null | undefined
): VoiceContext {
    return {
        sampleText: profile.sampleText,
        analysis: profile.analysis,
        voiceInsights: profile.voiceInsights,
        insightBullets: profile.insightBullets,
        latestTask: writingTask,
        latestInstructions: extraInstructions || undefined,
    };
}

function getSupabaseUrl(): string | null {
    return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || null;
}

function getSupabaseServiceKey(): string | null {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

function hasSupabaseRestConfig(): boolean {
    return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

function canUseLocalVoiceStore(): boolean {
    return process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_VOICE_STORAGE === 'true';
}

function assertLocalVoiceStoreAvailable(): void {
    if (canUseLocalVoiceStore()) {
        return;
    }

    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for production voice storage.');
}

async function readJsonStore(): Promise<LocalVoiceStore> {
    assertLocalVoiceStoreAvailable();

    try {
        const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
        const parsed = JSON.parse(raw) as Partial<LocalVoiceStore>;
        return {
            voiceProfiles: Array.isArray(parsed.voiceProfiles) ? parsed.voiceProfiles : [],
            voiceGenerations: Array.isArray(parsed.voiceGenerations) ? parsed.voiceGenerations : [],
            voiceUsage: Array.isArray(parsed.voiceUsage) ? parsed.voiceUsage : [],
        };
    } catch {
        return {
            voiceProfiles: [],
            voiceGenerations: [],
            voiceUsage: [],
        };
    }
}

async function writeJsonStore(value: LocalVoiceStore): Promise<void> {
    assertLocalVoiceStoreAvailable();
    await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await writeFile(LOCAL_STORE_PATH, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function supabaseRestRequest<T>(
    table: string,
    init: RequestInit = {},
    params?: URLSearchParams
): Promise<T> {
    const url = new URL(`${getSupabaseUrl()}/rest/v1/${table}`);
    if (params) {
        url.search = params.toString();
    }

    const response = await fetch(url.toString(), {
        ...init,
        headers: {
            apikey: getSupabaseServiceKey() as string,
            Authorization: `Bearer ${getSupabaseServiceKey()}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
        const message =
            payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
                ? payload.message
                : `Supabase request failed for ${table}.`;
        throw new Error(message);
    }

    return payload as T;
}

export function hashAnonymousSubject(ipAddress: string, userAgent: string): string {
    return createHash('sha256').update(`${ipAddress}::${userAgent}`).digest('hex');
}

function buildWindowKey(limitType: 'anonymous' | 'user', now = new Date()): string {
    if (limitType === 'anonymous') {
        const year = now.getUTCFullYear();
        const month = `${now.getUTCMonth() + 1}`.padStart(2, '0');
        const day = `${now.getUTCDate()}`.padStart(2, '0');
        const hour = `${now.getUTCHours()}`.padStart(2, '0');
        return `${year}-${month}-${day}-${hour}`;
    }

    return now.toISOString().slice(0, 10);
}

export async function enforceVoiceQuota(input: {
    subjectKey: string;
    subjectType: 'anonymous' | 'user';
}): Promise<{ remainingQuota: number; quotaLimit: number }> {
    const quotaLimit = input.subjectType === 'anonymous' ? 5 : 20;
    const now = new Date().toISOString();
    const windowKey = buildWindowKey(input.subjectType);

    if (hasSupabaseRestConfig()) {
        try {
            const params = new URLSearchParams();
            params.set('subject_key', `eq.${input.subjectKey}`);
            params.set('window_key', `eq.${windowKey}`);
            params.set('select', 'id,usage_count,limit_count');

            const existing = await supabaseRestRequest<
                Array<{ id: string; usage_count: number; limit_count: number }>
            >('voice_usage', { method: 'GET' }, params);

            if (existing[0]) {
                if (existing[0].usage_count >= quotaLimit) {
                    throw new Error(
                        input.subjectType === 'anonymous'
                            ? 'Anonymous quota reached. Try again in the next hour or sign in to save more generations.'
                            : 'Signed-in quota reached for today.'
                    );
                }

                const nextCount = existing[0].usage_count + 1;
                const patchParams = new URLSearchParams();
                patchParams.set('id', `eq.${existing[0].id}`);
                await supabaseRestRequest(
                    'voice_usage',
                    {
                        method: 'PATCH',
                        headers: {
                            Prefer: 'return=representation',
                        },
                        body: JSON.stringify({
                            usage_count: nextCount,
                            limit_count: quotaLimit,
                            updated_at: now,
                        }),
                    },
                    patchParams
                );

                return {
                    remainingQuota: Math.max(quotaLimit - nextCount, 0),
                    quotaLimit,
                };
            }

            await supabaseRestRequest(
                'voice_usage',
                {
                    method: 'POST',
                    headers: {
                        Prefer: 'return=representation',
                    },
                    body: JSON.stringify({
                        id: randomUUID(),
                        subject_key: input.subjectKey,
                        subject_type: input.subjectType,
                        window_key: windowKey,
                        usage_count: 1,
                        limit_count: quotaLimit,
                        created_at: now,
                        updated_at: now,
                    }),
                }
            );

            return {
                remainingQuota: quotaLimit - 1,
                quotaLimit,
            };
        } catch (quotaError) {
            const msg = quotaError instanceof Error ? quotaError.message : '';
            if (msg.includes('quota reached')) throw quotaError;
            console.error('Quota enforcement failed, allowing request:', quotaError);
            return { remainingQuota: quotaLimit - 1, quotaLimit };
        }
    }

    const store = await readJsonStore();
    const existing = store.voiceUsage.find(
        (entry) => entry.subjectKey === input.subjectKey && entry.windowKey === windowKey
    );

    if (existing) {
        if (existing.usageCount >= quotaLimit) {
            throw new Error(
                input.subjectType === 'anonymous'
                    ? 'Anonymous quota reached. Try again in the next hour or sign in to save more generations.'
                    : 'Signed-in quota reached for today.'
            );
        }

        existing.usageCount += 1;
        existing.limitCount = quotaLimit;
        existing.updatedAt = now;
        await writeJsonStore(store);

        return {
            remainingQuota: Math.max(quotaLimit - existing.usageCount, 0),
            quotaLimit,
        };
    }

    store.voiceUsage.push({
        id: randomUUID(),
        subjectKey: input.subjectKey,
        subjectType: input.subjectType,
        windowKey,
        usageCount: 1,
        limitCount: quotaLimit,
        createdAt: now,
        updatedAt: now,
    });
    await writeJsonStore(store);

    return {
        remainingQuota: quotaLimit - 1,
        quotaLimit,
    };
}

export async function saveVoiceProfileAndGeneration(input: VoiceSaveInput): Promise<{
    profile: VoiceProfileRecord;
    generation: VoiceGenerationRecord;
}> {
    const createdAt = new Date().toISOString();
    const profile: VoiceProfileRecord = {
        id: randomUUID(),
        userId: input.userId,
        sampleText: input.voiceContext.sampleText,
        analysis: input.voiceContext.analysis,
        voiceInsights: input.voiceContext.voiceInsights,
        insightBullets: input.voiceContext.insightBullets,
        createdAt,
        updatedAt: createdAt,
    };
    const generation: VoiceGenerationRecord = {
        id: randomUUID(),
        userId: input.userId,
        profileId: profile.id,
        writingTask: input.writingTask,
        extraInstructions: input.extraInstructions || null,
        outputText: input.latestOutput,
        preview: input.preview,
        createdAt,
        persisted: true,
    };

    if (hasSupabaseRestConfig()) {
        await supabaseRestRequest('voice_profiles', {
            method: 'POST',
            headers: {
                Prefer: 'return=representation',
            },
            body: JSON.stringify({
                id: profile.id,
                user_id: profile.userId,
                sample_text: profile.sampleText,
                analysis_json: profile.analysis,
                voice_insights: profile.voiceInsights,
                insight_bullets: profile.insightBullets,
                created_at: profile.createdAt,
                updated_at: profile.updatedAt,
            }),
        });

        await supabaseRestRequest('voice_generations', {
            method: 'POST',
            headers: {
                Prefer: 'return=representation',
            },
            body: JSON.stringify({
                id: generation.id,
                user_id: generation.userId,
                profile_id: generation.profileId,
                writing_task: generation.writingTask,
                extra_instructions: generation.extraInstructions,
                output_text: generation.outputText,
                preview: generation.preview,
                created_at: generation.createdAt,
            }),
        });

        return {
            profile,
            generation,
        };
    }

    const store = await readJsonStore();
    store.voiceProfiles.push(profile);
    store.voiceGenerations.push(generation);
    await writeJsonStore(store);

    return {
        profile,
        generation,
    };
}

export async function getVoiceHistoryForUser(userId: string): Promise<VoiceSavedGeneration[]> {
    if (hasSupabaseRestConfig()) {
        const params = new URLSearchParams();
        params.set('user_id', `eq.${userId}`);
        params.set('select', 'id,profile_id,writing_task,extra_instructions,output_text,preview,created_at');
        params.set('order', 'created_at.desc');

        const rows = await supabaseRestRequest<
            Array<{
                id: string;
                profile_id: string | null;
                writing_task: string;
                extra_instructions: string | null;
                output_text: string;
                preview: string;
                created_at: string;
            }>
        >('voice_generations', { method: 'GET' }, params);

        const profileIds = [...new Set(rows.map((row) => row.profile_id).filter(Boolean))] as string[];
        const profileMap = new Map<string, VoiceProfileRecord>();

        if (profileIds.length > 0) {
            const profileParams = new URLSearchParams();
            profileParams.set('id', `in.(${profileIds.join(',')})`);
            profileParams.set(
                'select',
                'id,user_id,sample_text,analysis_json,voice_insights,insight_bullets,created_at,updated_at'
            );

            const profiles = await supabaseRestRequest<
                Array<{
                    id: string;
                    user_id: string;
                    sample_text: string;
                    analysis_json: VoiceContext['analysis'];
                    voice_insights: string;
                    insight_bullets: string[];
                    created_at: string;
                    updated_at: string;
                }>
            >('voice_profiles', { method: 'GET' }, profileParams);

            profiles.forEach((profile) => {
                profileMap.set(profile.id, {
                    id: profile.id,
                    userId: profile.user_id,
                    sampleText: profile.sample_text,
                    analysis: profile.analysis_json,
                    voiceInsights: profile.voice_insights,
                    insightBullets: profile.insight_bullets,
                    createdAt: profile.created_at,
                    updatedAt: profile.updated_at,
                });
            });
        }

        return rows
            .map((row): VoiceSavedGeneration | null => {
                if (!row.profile_id) {
                    return null;
                }

                const profile = profileMap.get(row.profile_id);
                if (!profile) {
                    return null;
                }

                return {
                    id: row.id,
                    profileId: row.profile_id,
                    writingTask: row.writing_task,
                    extraInstructions: row.extra_instructions,
                    outputText: row.output_text,
                    preview: row.preview,
                    createdAt: row.created_at,
                    persisted: true,
                    voiceInsights: profile.voiceInsights,
                    insightBullets: profile.insightBullets,
                    voiceContext: buildVoiceContextFromProfile(
                        profile,
                        row.writing_task,
                        row.extra_instructions
                    ),
                };
            })
            .filter((entry): entry is VoiceSavedGeneration => entry !== null);
    }

    const store = await readJsonStore();
    return store.voiceGenerations
        .filter((entry) => entry.userId === userId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map((entry): VoiceSavedGeneration | null => {
            if (!entry.profileId) {
                return null;
            }

            const profile = store.voiceProfiles.find((candidate) => candidate.id === entry.profileId);
            if (!profile) {
                return null;
            }

            return {
                id: entry.id,
                profileId: entry.profileId,
                writingTask: entry.writingTask,
                extraInstructions: entry.extraInstructions,
                outputText: entry.outputText,
                preview: entry.preview,
                createdAt: entry.createdAt,
                persisted: true,
                voiceInsights: profile.voiceInsights,
                insightBullets: profile.insightBullets,
                voiceContext: buildVoiceContextFromProfile(
                    profile,
                    entry.writingTask,
                    entry.extraInstructions
                ),
            };
        })
        .filter((entry): entry is VoiceSavedGeneration => entry !== null);
}
