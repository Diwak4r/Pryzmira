import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { VoiceContext } from '@/lib/voice';

const SAMPLE = Array.from({ length: 60 }, (_, index) => `word${index}`).join(' ');

const VOICE_CONTEXT: VoiceContext = {
    sampleText: SAMPLE,
    analysis: {
        tone: 'warm but direct',
        sentenceRhythm: 'short, clipped lines',
        vocabularyHabits: 'plain nouns',
        transitions: 'straight cuts',
        languageMixing: 'English only',
        closingStyle: 'no sign-off',
    },
    voiceInsights: 'Sounds like a text, not an email.',
    insightBullets: ['one', 'two', 'three', 'four', 'five'],
    latestTask: 'Write an update.',
    latestInstructions: 'Keep it short.',
};

type VoiceStorageModule = typeof import('@/lib/voiceStorage');

let workDir: string;
let previousCwd: string;
let storage: VoiceStorageModule;

beforeAll(async () => {
    previousCwd = process.cwd();
    workDir = await mkdtemp(path.join(tmpdir(), 'pryzmira-storage-'));
    process.chdir(workDir);

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    vi.resetModules();
    storage = await import('@/lib/voiceStorage');
});

afterAll(async () => {
    process.chdir(previousCwd);
    await rm(workDir, { recursive: true, force: true });
    vi.unstubAllEnvs();
});

describe('hashAnonymousSubject', () => {
    it('is deterministic for the same IP and user agent', () => {
        expect(storage.hashAnonymousSubject('203.0.113.5', 'agent')).toBe(
            storage.hashAnonymousSubject('203.0.113.5', 'agent')
        );
    });

    it('changes when either the IP or the user agent changes', () => {
        const base = storage.hashAnonymousSubject('203.0.113.5', 'agent');

        expect(storage.hashAnonymousSubject('203.0.113.6', 'agent')).not.toBe(base);
        expect(storage.hashAnonymousSubject('203.0.113.5', 'other-agent')).not.toBe(base);
    });

    it('never leaks the raw identifiers', () => {
        const hash = storage.hashAnonymousSubject('203.0.113.5', 'secret-agent');

        expect(hash).toMatch(/^[a-f0-9]{64}$/);
        expect(hash).not.toContain('203.0.113.5');
        expect(hash).not.toContain('secret-agent');
    });
});

describe('enforceVoiceQuota (local store)', () => {
    it('grants five anonymous generations per hour and then blocks', async () => {
        const subjectKey = 'anonymous-subject-1';
        const remaining: number[] = [];

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const result = await storage.enforceVoiceQuota({ subjectKey, subjectType: 'anonymous' });
            expect(result.quotaLimit).toBe(5);
            remaining.push(result.remainingQuota);
        }

        expect(remaining).toEqual([4, 3, 2, 1, 0]);
        await expect(
            storage.enforceVoiceQuota({ subjectKey, subjectType: 'anonymous' })
        ).rejects.toThrowError(/anonymous quota reached/i);
    });

    it('tracks anonymous subjects separately', async () => {
        const result = await storage.enforceVoiceQuota({
            subjectKey: 'anonymous-subject-2',
            subjectType: 'anonymous',
        });

        expect(result.remainingQuota).toBe(4);
    });

    it('grants signed-in users a larger daily quota', async () => {
        const subjectKey = 'user-subject-1';

        for (let attempt = 0; attempt < 20; attempt += 1) {
            const result = await storage.enforceVoiceQuota({ subjectKey, subjectType: 'user' });
            expect(result.quotaLimit).toBe(20);
        }

        await expect(
            storage.enforceVoiceQuota({ subjectKey, subjectType: 'user' })
        ).rejects.toThrowError(/signed-in quota reached/i);
    });
});

describe('voice profile + generation storage', () => {
    it('saves a profile and returns it in the user history', async () => {
        const saved = await storage.saveVoiceProfileAndGeneration({
            userId: 'user-1',
            voiceContext: VOICE_CONTEXT,
            latestOutput: 'A saved draft in the author voice.',
            writingTask: 'Write an update.',
            extraInstructions: 'Keep it short.',
            preview: 'A saved draft in the author voice.',
        });

        expect(saved.profile.id).toBeTruthy();
        expect(saved.generation.profileId).toBe(saved.profile.id);
        expect(saved.generation.persisted).toBe(true);

        const history = await storage.getVoiceHistoryForUser('user-1');

        expect(history).toHaveLength(1);
        expect(history[0]).toMatchObject({
            id: saved.generation.id,
            writingTask: 'Write an update.',
            extraInstructions: 'Keep it short.',
            outputText: 'A saved draft in the author voice.',
            persisted: true,
            voiceInsights: VOICE_CONTEXT.voiceInsights,
        });
        expect(history[0].voiceContext.latestTask).toBe('Write an update.');
    });

    it('isolates history between users', async () => {
        await storage.saveVoiceProfileAndGeneration({
            userId: 'user-2',
            voiceContext: VOICE_CONTEXT,
            latestOutput: 'Second user draft.',
            writingTask: 'Second task.',
            preview: 'Second user draft.',
        });

        const firstUserHistory = await storage.getVoiceHistoryForUser('user-1');
        const secondUserHistory = await storage.getVoiceHistoryForUser('user-2');

        expect(firstUserHistory).toHaveLength(1);
        expect(secondUserHistory).toHaveLength(1);
        expect(secondUserHistory[0].writingTask).toBe('Second task.');
    });

    it('persists the local store as JSON on disk', async () => {
        const raw = await readFile(path.join(workDir, 'data', 'voice-store.json'), 'utf8');
        const parsed = JSON.parse(raw) as {
            voiceProfiles: unknown[];
            voiceGenerations: unknown[];
            voiceUsage: unknown[];
        };

        expect(parsed.voiceProfiles.length).toBeGreaterThanOrEqual(2);
        expect(parsed.voiceGenerations.length).toBeGreaterThanOrEqual(2);
        expect(parsed.voiceUsage.length).toBeGreaterThanOrEqual(3);
    });
});
