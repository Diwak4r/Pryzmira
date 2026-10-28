import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    BUILD_SOURCES,
    CAPABILITIES,
    ENV_VARS,
    FAQ,
    QUICKSTART_STEPS,
    RECIPES,
    TEST_SUITE,
    TROUBLESHOOTING,
} from '@/lib/guide';

const SRC_DIR = fileURLToPath(new URL('../..', import.meta.url));
const NEXT_WEB_DIR = path.resolve(SRC_DIR, '..');

/** Every source file, minus tests and the guide data itself. */
function sourceFiles(): string[] {
    return readdirSync(SRC_DIR, { recursive: true })
        .map((entry) => String(entry))
        .filter((entry) => /\.(ts|tsx)$/.test(entry))
        .filter((entry) => !entry.includes('__tests__'))
        .filter((entry) => !entry.includes(`lib${path.sep}guide.ts`) && !entry.endsWith('lib/guide.ts'));
}

const ALL_SOURCE = sourceFiles()
    .map((relative) => readFileSync(path.join(SRC_DIR, relative), 'utf8'))
    .join('\n');

describe('capability scan', () => {
    it('has unique ids and complete entries', () => {
        const ids = CAPABILITIES.map((capability) => capability.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(CAPABILITIES.length).toBeGreaterThanOrEqual(10);

        for (const capability of CAPABILITIES) {
            expect(capability.name.length).toBeGreaterThan(3);
            expect(capability.summary.length).toBeGreaterThan(40);
            expect(capability.where.length).toBeGreaterThan(0);
            expect(['stable', 'new', 'beta', 'needs-key']).toContain(capability.status);
        }
    });

    it('only lists capabilities whose env requirements are documented', () => {
        const documentedKeys = new Set(ENV_VARS.map((entry) => entry.key));

        for (const capability of CAPABILITIES) {
            const requirement = capability.requirements || '';
            for (const match of requirement.matchAll(/\b[A-Z][A-Z0-9_]{4,}\b/g)) {
                expect(documentedKeys.has(match[0])).toBe(true);
            }
        }
    });
});

describe('environment docs stay in sync with the code', () => {
    it('documents variables that are actually read somewhere', () => {
        for (const entry of ENV_VARS) {
            expect(ALL_SOURCE.includes(entry.key), `${entry.key} is documented but never read`).toBe(true);
        }
    });

    it('has a purpose and requirement note for every variable', () => {
        for (const entry of ENV_VARS) {
            expect(entry.key).toMatch(/^[A-Z][A-Z0-9_]+$/);
            expect(entry.required.length).toBeGreaterThan(2);
            expect(entry.purpose.length).toBeGreaterThan(20);
        }
    });
});

describe('routes referenced by the guide exist', () => {
    it.each([
        ['/', 'src/app/page.tsx'],
        ['/desk', 'src/app/desk/page.tsx'],
        ['/builds', 'src/app/builds/page.tsx'],
        ['/guide', 'src/app/guide/page.tsx'],
        ['/api/voice/generate', 'src/app/api/voice/generate/route.ts'],
        ['/api/voice/refine', 'src/app/api/voice/refine/route.ts'],
        ['/api/voice/save-current', 'src/app/api/voice/save-current/route.ts'],
        ['/api/voice/history', 'src/app/api/voice/history/route.ts'],
        ['/api/voice/health', 'src/app/api/voice/health/route.ts'],
        ['/api/voice/auth/session', 'src/app/api/voice/auth/session/route.ts'],
        ['/api/builds', 'src/app/api/builds/route.ts'],
        ['/auth/callback', 'src/app/auth/callback/route.ts'],
    ])('%s is backed by %s', (_route, relativePath) => {
        expect(existsSync(path.join(NEXT_WEB_DIR, relativePath))).toBe(true);
    });
});

describe('quickstart and recipes', () => {
    it('has an ordered quickstart', () => {
        expect(QUICKSTART_STEPS.length).toBeGreaterThanOrEqual(4);

        for (const step of QUICKSTART_STEPS) {
            expect(step.title.length).toBeGreaterThan(5);
            expect(step.body.length).toBeGreaterThan(40);
        }
    });

    it('has usable recipes', () => {
        const ids = RECIPES.map((recipe) => recipe.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(RECIPES.length).toBeGreaterThanOrEqual(5);

        for (const recipe of RECIPES) {
            expect(recipe.task.length).toBeGreaterThan(20);
            expect(recipe.instructions.length).toBeGreaterThan(10);
            expect(recipe.tags.length).toBeGreaterThan(0);
            expect(recipe.note.length).toBeGreaterThan(10);

            const href = `/?task=${encodeURIComponent(recipe.task)}&instructions=${encodeURIComponent(
                recipe.instructions
            )}`;
            expect(new URLSearchParams(href.split('?')[1]).get('task')).toBe(recipe.task);
        }
    });
});

describe('build source docs', () => {
    it('documents curated, X, GitHub, and custom sources', () => {
        expect(BUILD_SOURCES.map((source) => source.id)).toEqual(
            expect.arrayContaining(['curated', 'x', 'github', 'custom'])
        );
    });

    it('references env keys that exist', () => {
        const documentedKeys = new Set(ENV_VARS.map((entry) => entry.key));

        for (const source of BUILD_SOURCES) {
            if (source.envKey) {
                expect(documentedKeys.has(source.envKey)).toBe(true);
            }
        }
    });

    it('keeps the custom-source example aligned with the AiBuild fields', () => {
        const custom = BUILD_SOURCES.find((source) => source.id === 'custom');

        expect(custom?.code).toContain('AiBuild');
        expect(custom?.code).toContain('provenance');
        expect(custom?.code).toContain('addedAt');
    });
});

describe('troubleshooting and FAQ', () => {
    it('has a cause and a fix for every symptom', () => {
        expect(TROUBLESHOOTING.length).toBeGreaterThanOrEqual(6);

        for (const entry of TROUBLESHOOTING) {
            expect(entry.symptom.length).toBeGreaterThan(5);
            expect(entry.cause.length).toBeGreaterThan(10);
            expect(entry.fix.length).toBeGreaterThan(20);
        }
    });

    it('answers the privacy and demo-mode questions', () => {
        const questions = FAQ.map((entry) => entry.question.toLowerCase()).join(' | ');

        expect(questions).toContain('stored');
        expect(questions).toContain('demo');
        expect(questions).toContain('browse');

        for (const entry of FAQ) {
            expect(entry.answer.length).toBeGreaterThan(40);
        }
    });
});

describe('test suite docs', () => {
    it('describes test files that exist', () => {
        const roots = [path.join(SRC_DIR, 'lib', '__tests__'), path.join(SRC_DIR, 'lib', 'builds', '__tests__')];

        for (const entry of TEST_SUITE) {
            const [scope, file] = entry.file.includes('/')
                ? [roots[1], entry.file.split('/').slice(1).join('/')]
                : [roots[0], entry.file];
            const exists = existsSync(path.join(scope, file));
            expect(exists, `${entry.file} is listed in the guide but missing`).toBe(true);
            expect(entry.covers.length).toBeGreaterThan(15);
        }
    });
});
