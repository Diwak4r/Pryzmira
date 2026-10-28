import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        exclude: ['node_modules', '.next'],
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        testTimeout: 10_000,
    },
    resolve: {
        alias: {
            '@': path.resolve(rootDir, 'src'),
        },
    },
});
