import { describe, expect, it } from 'vitest';
import {
    AI_MODELS,
    AI_TOOLS,
    BUILD_CATEGORIES,
    BUILD_PLATFORMS,
    getCategory,
    getModel,
    getPlatform,
    getTool,
    isAiTool,
    isKnownModel,
    isKnownTool,
    modelLabel,
    modelVendors,
    toolLabel,
    vendorOfModel,
} from '@/lib/builds/catalog';
import { CURATED_BUILDS } from '@/lib/builds/curated';
import { isBuildCategory, isBuildPlatform } from '@/lib/builds/normalize';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('model catalog', () => {
    it('has unique ids and non-empty keywords', () => {
        const ids = AI_MODELS.map((model) => model.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(AI_MODELS.length).toBeGreaterThanOrEqual(15);

        for (const model of AI_MODELS) {
            expect(model.label.length).toBeGreaterThan(0);
            expect(model.vendor.length).toBeGreaterThan(0);
            expect(model.abilities.length).toBeGreaterThan(0);
            expect(model.keywords.length).toBeGreaterThan(0);
            for (const keyword of model.keywords) {
                expect(keyword).toBe(keyword.toLowerCase());
                expect(keyword.trim().length).toBeGreaterThan(0);
            }
        }
    });

    it('exposes vendor and label helpers', () => {
        expect(vendorOfModel('claude-sonnet-4-5')).toBe('Anthropic');
        expect(vendorOfModel('nope')).toBeUndefined();
        expect(modelLabel('gpt-5')).toBe('GPT-5');
        expect(modelLabel('nope')).toBe('nope');
        expect(modelVendors()).toContain('Anthropic');
        expect(modelVendors()).toContain('OpenAI');
    });

    it('flags AI-native tools explicitly', () => {
        expect(isAiTool('cursor')).toBe(true);
        expect(isAiTool('claude-code')).toBe(true);
        expect(isAiTool('python')).toBe(false);
        expect(isAiTool('react')).toBe(false);
        expect(isAiTool('nope')).toBe(false);

        for (const tool of AI_TOOLS) {
            expect(typeof tool.ai).toBe('boolean');
        }

        expect(AI_TOOLS.filter((tool) => tool.ai).length).toBeGreaterThanOrEqual(15);
    });

    it('looks up models, tools, categories, and platforms', () => {
        expect(getModel('flux-1')?.vendor).toBe('Black Forest Labs');
        expect(getTool('cursor')?.kind).toBe('editor');
        expect(getCategory('agent')?.label).toBe('Agents');
        expect(getPlatform('x')?.label).toBe('X (Twitter)');
        expect(isKnownModel('gpt-5')).toBe(true);
        expect(isKnownModel('gpt-9')).toBe(false);
        expect(isKnownTool('ollama')).toBe(true);
        expect(isKnownTool('photoshop')).toBe(false);
        expect(toolLabel('open-webui')).toBe('Open WebUI');
        expect(toolLabel('unknown-tool')).toBe('unknown-tool');
    });
});

describe('tool catalog', () => {
    it('has unique ids and keywords', () => {
        const ids = AI_TOOLS.map((tool) => tool.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(AI_TOOLS.length).toBeGreaterThanOrEqual(20);

        for (const tool of AI_TOOLS) {
            expect(tool.label.length).toBeGreaterThan(0);
            expect(tool.keywords.length).toBeGreaterThan(0);
        }
    });
});

describe('category and platform registries', () => {
    it('expose every category and platform exactly once', () => {
        expect(new Set(BUILD_CATEGORIES.map((entry) => entry.id)).size).toBe(BUILD_CATEGORIES.length);
        expect(new Set(BUILD_PLATFORMS.map((entry) => entry.id)).size).toBe(BUILD_PLATFORMS.length);

        for (const category of BUILD_CATEGORIES) {
            expect(isBuildCategory(category.id)).toBe(true);
            expect(category.label.length).toBeGreaterThan(0);
            expect(category.description.length).toBeGreaterThan(0);
        }

        for (const platform of BUILD_PLATFORMS) {
            expect(isBuildPlatform(platform.id)).toBe(true);
        }
    });
});

describe('curated builds', () => {
    it('is internally consistent', () => {
        expect(CURATED_BUILDS.length).toBeGreaterThanOrEqual(12);
        expect(new Set(CURATED_BUILDS.map((build) => build.id)).size).toBe(CURATED_BUILDS.length);
        expect(new Set(CURATED_BUILDS.map((build) => build.source.url)).size).toBe(
            CURATED_BUILDS.length
        );

        for (const build of CURATED_BUILDS) {
            expect(build.id.startsWith('curated:')).toBe(true);
            expect(build.title.trim().length).toBeGreaterThan(2);
            expect(build.summary.length).toBeGreaterThan(30);
            expect(build.summary.length).toBeLessThanOrEqual(260);
            expect(build.maker.name.trim().length).toBeGreaterThan(0);
            expect(isBuildCategory(build.category)).toBe(true);
            expect(isBuildPlatform(build.source.platform)).toBe(true);
            expect(build.provenance).toBe('curated');
            expect(build.addedAt).toMatch(ISO_DATE);
            expect(Number.isNaN(Date.parse(build.addedAt))).toBe(false);

            const url = new URL(build.source.url);
            expect(url.protocol).toBe('https:');

            for (const modelId of build.models) {
                expect(isKnownModel(modelId)).toBe(true);
            }

            for (const toolId of build.tools) {
                expect(isKnownTool(toolId)).toBe(true);
            }

            for (const tag of build.tags) {
                expect(tag).toBe(tag.toLowerCase());
            }
        }
    });

    it('covers a useful spread of categories', () => {
        const categories = new Set(CURATED_BUILDS.map((build) => build.category));

        expect(categories.has('app')).toBe(true);
        expect(categories.has('devtool')).toBe(true);
        expect(categories.has('creative')).toBe(true);
        expect(categories.has('agent')).toBe(true);
        expect(categories.size).toBeGreaterThanOrEqual(5);
    });

    it('documents at least one model for most entries', () => {
        const withModels = CURATED_BUILDS.filter((build) => build.models.length > 0);

        expect(withModels.length).toBeGreaterThanOrEqual(7);
    });
});
