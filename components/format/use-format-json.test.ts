import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFormatJson } from './use-format-json';

describe('useFormatJson', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should format JSON with default options', async () => {
        const { result } = renderHook(() => useFormatJson('{"name":"John","age":30}'));

        // Initial state should have the unformatted content
        expect(result.current.formatted).toBe('{"name":"John","age":30}');
        expect(result.current.isValid).toBe(true);
        expect(result.current.error).toBeNull();

        // Fast-forward timers to trigger debounced formatting
        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "name": "John",\n  "age": 30\n}');
        expect(result.current.isValid).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should format JSON with custom indentation', async () => {
        const { result } = renderHook(() => useFormatJson('{"name":"John"}', { indentation: 4 }));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n    "name": "John"\n}');
    });

    it('should sort keys when option is enabled', async () => {
        const { result } = renderHook(() =>
            useFormatJson('{"z":1,"a":2,"m":3}', { sortKeys: true }),
        );

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "a": 2,\n  "m": 3,\n  "z": 1\n}');
    });

    it('should escape unicode when option is enabled', async () => {
        const { result } = renderHook(() =>
            useFormatJson('{"name":"日本語"}', { escapeUnicode: true }),
        );

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toContain('\\u');
    });

    it('should handle invalid JSON', async () => {
        const { result } = renderHook(() => useFormatJson('{"name":"John"'));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.isValid).toBe(false);
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toContain('JSON');
    });

    it('should debounce formatting with 300ms delay', async () => {
        const { result } = renderHook(() => useFormatJson('{"name":"John"}'));

        // Change content multiple times rapidly
        await act(async () => {
            result.current.setContent('{"name":"Jane"}');
            vi.advanceTimersByTime(100);

            result.current.setContent('{"name":"Bob"}');
            vi.advanceTimersByTime(100);

            result.current.setContent('{"name":"Alice"}');
            vi.advanceTimersByTime(100);
        });

        // Should not have formatted yet
        expect(result.current.formatted).toBe('{"name":"Alice"}');

        // After 300ms, should format
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current.formatted).toBe('{\n  "name": "Alice"\n}');
    });

    it('should update format options and re-format', async () => {
        const { result } = renderHook(() => useFormatJson('{"z":1,"a":2}', { sortKeys: false }));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "z": 1,\n  "a": 2\n}');

        // Update options
        await act(async () => {
            result.current.setOptions({ sortKeys: true });
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "a": 2,\n  "z": 1\n}');
    });

    it('should update content and re-format', async () => {
        const { result } = renderHook(() => useFormatJson('{"name":"John"}'));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "name": "John"\n}');

        // Update content
        await act(async () => {
            result.current.setContent('{"name":"Jane"}');
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "name": "Jane"\n}');
    });

    it('should handle empty string', async () => {
        const { result } = renderHook(() => useFormatJson(''));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.isValid).toBe(false);
        expect(result.current.error).not.toBeNull();
    });

    it('should handle whitespace-only string', async () => {
        const { result } = renderHook(() => useFormatJson('   '));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.isValid).toBe(false);
        expect(result.current.error).not.toBeNull();
    });

    it('should handle valid JSON arrays', async () => {
        const { result } = renderHook(() => useFormatJson('[1,2,3]'));

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('[\n  1,\n  2,\n  3\n]');
        expect(result.current.isValid).toBe(true);
    });

    it('should handle complex nested JSON', async () => {
        const { result } = renderHook(() =>
            useFormatJson('{"user":{"name":"John","age":30},"tags":["a","b"]}'),
        );

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe(
            '{\n  "user": {\n    "name": "John",\n    "age": 30\n  },\n  "tags": [\n    "a",\n    "b"\n  ]\n}',
        );
        expect(result.current.isValid).toBe(true);
    });

    it('should format on initial mount', async () => {
        const { result } = renderHook(() => useFormatJson('{"name":"John"}'));

        // Should have initial content immediately
        expect(result.current.formatted).toBe('{"name":"John"}');

        // After debounce, should be formatted
        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.formatted).toBe('{\n  "name": "John"\n}');
    });
});
