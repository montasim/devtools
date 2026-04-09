import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJsonDiff } from '../use-json-diff';

describe('useJsonDiff', () => {
    it('should detect no differences for identical JSON', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name": "John"}',
                rightContent: '{"name": "John"}',
                ignoreKeyOrder: false,
                prettyPrint: false,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        expect(result.current.diff?.additionCount).toBe(0);
        expect(result.current.diff?.deletionCount).toBe(0);
    });

    it('should detect differences for different JSON', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name": "John"}',
                rightContent: '{"name": "Jane"}',
                ignoreKeyOrder: false,
                prettyPrint: false,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        expect(result.current.diff?.additionCount).toBeGreaterThan(0);
        expect(result.current.diff?.deletionCount).toBeGreaterThan(0);
    });

    it('should ignore key order when toggle is enabled', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name": "John", "age": 30}',
                rightContent: '{"age": 30, "name": "John"}',
                ignoreKeyOrder: true,
                prettyPrint: false,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        expect(result.current.diff?.additionCount).toBe(0);
        expect(result.current.diff?.deletionCount).toBe(0);
    });

    it('should pretty print JSON when toggle is enabled', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name":"John"}',
                rightContent: '{"name":"John"}',
                ignoreKeyOrder: false,
                prettyPrint: true,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        // Pretty print should add whitespace but not differences
        expect(result.current.diff?.additionCount).toBe(0);
        expect(result.current.diff?.deletionCount).toBe(0);
    });

    it('should ignore whitespace when toggle is enabled', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{\n  "name": "John"\n}',
                rightContent: '{"name":"John"}',
                ignoreKeyOrder: false,
                prettyPrint: false,
                ignoreWhitespace: true,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        expect(result.current.diff?.additionCount).toBe(0);
        expect(result.current.diff?.deletionCount).toBe(0);
    });

    it('should handle invalid JSON', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name": "John"',
                rightContent: '{"name": "John"}',
                ignoreKeyOrder: false,
                prettyPrint: false,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.error).not.toBeNull();
        expect(result.current.diff).toBeNull();
    });

    it('should set isComputing to true during computation', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name": "John"}',
                rightContent: '{"name": "Jane"}',
                ignoreKeyOrder: false,
                prettyPrint: false,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        const computePromise = result.current.computeDiff();
        expect(result.current.isComputing).toBe(true);

        await computePromise;
        expect(result.current.isComputing).toBe(false);
    });

    it('should generate correct diff hunks with line numbers', async () => {
        const { result } = renderHook(() =>
            useJsonDiff({
                leftContent: '{"name": "John"}',
                rightContent: '{"name": "Jane"}',
                ignoreKeyOrder: false,
                prettyPrint: false,
                ignoreWhitespace: false,
                semanticTypeDiff: false,
            })
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        expect(result.current.diff?.hunks.length).toBeGreaterThan(0);

        const hunk = result.current.diff?.hunks[0];
        expect(hunk).toBeDefined();
        expect(hunk?.lines.length).toBeGreaterThan(0);

        const deletionLine = hunk?.lines.find((line) => line.type === 'deletion');
        const additionLine = hunk?.lines.find((line) => line.type === 'addition');

        expect(deletionLine).toBeDefined();
        expect(additionLine).toBeDefined();
        expect(deletionLine?.content).toContain('John');
        expect(additionLine?.content).toContain('Jane');
    });
});
