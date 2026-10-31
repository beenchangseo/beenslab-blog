import {defineConfig} from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const noParentImports = {
    group: ['../*'],
    message: "Import through the '@/' alias instead of a parent-relative path.",
};

const noPrisma = {
    name: '@/lib/prisma',
    message: 'Reads go through src/lib/posts.ts, writes through src/app/actions.',
};

export default defineConfig([
    {
        ignores: [
            '.next/**',
            'test-results/**',
            'playwright-report/**',
            'next-env.d.ts',
            '.gstack/**',
        ],
    },
    {
        extends: [...nextCoreWebVitals, ...nextTypescript],
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': ['error', {patterns: [noParentImports]}],
        },
    },
    {
        files: ['src/app/**/*.{ts,tsx}'],
        ignores: ['src/app/actions/**'],
        rules: {
            'no-restricted-imports': ['error', {paths: [noPrisma], patterns: [noParentImports]}],
        },
    },
    {
        files: ['src/components/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        noPrisma,
                        {name: '@/lib/redis', message: 'Components do not talk to Redis.'},
                        {name: '@prisma/client', message: 'Components use the DTOs in src/types.'},
                    ],
                    patterns: [noParentImports],
                },
            ],
        },
    },
]);
