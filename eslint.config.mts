import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import type { Linter } from 'eslint';

export default defineConfig([
    // Next.js core web vitals — includes react, react-hooks, next plugin
    ...nextVitals,

    // TypeScript-specific rules from typescript-eslint
    ...nextTs,

    // Prettier — disables formatting rules that conflict with Prettier
    // MUST be last to override all other configs
    prettier,

    // Type-aware linting for TypeScript files
    {
        name: 'project/type-aware-linting',
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    // Custom project rules
    {
        name: 'project/custom-rules',
        files: ['**/*.{ts,tsx}'],
        rules: {
            // TypeScript
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                },
            ],
            '@typescript-eslint/no-empty-object-type': 'off',

            // Type-aware rules (require type checking)
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',

            // React
            'react/self-closing-comp': 'warn',
            'react/jsx-sort-props': [
                'warn',
                {
                    callbacksLast: true,
                    shorthandFirst: true,
                    reservedFirst: true,
                },
            ],

            // General
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'warn',
        },
    },

    // Global ignores
    globalIgnores([
        '.next/',
        'out/',
        'build/',
        'dist/',
        'coverage/',
        'node_modules/',
        'public/',
        '.vercel/',
        'next-env.d.ts',
        '*.tsbuildinfo',
    ]),
]) satisfies Linter.Config[];
