import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateJson, debounce } from '../validation';

describe('validateJson', () => {
  it('should return null for valid JSON', () => {
    const result = validateJson('{"name": "John"}');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = validateJson('');
    expect(result).toBeNull();
  });

  it('should return error for invalid JSON', () => {
    const result = validateJson('{"name": "John"');
    expect(result).not.toBeNull();
    expect(result?.message).toBe('Expected \',\' or \'}\' after property value in JSON at position 15 (line 1 column 16)');
  });

  it('should extract line and column from error', () => {
    const result = validateJson('{"name": "John"\n"age": }');
    expect(result).not.toBeNull();
    expect(result?.line).toBe(2);
    expect(result?.column).toBe(1);
    expect(result?.message).toBe('Expected \',\' or \'}\' after property value in JSON at position 16 (line 2 column 1)');
  });

  it('should handle position-based errors', () => {
    const result = validateJson('{ "name": }');
    expect(result).not.toBeNull();
    expect(result?.message).toBe('Unexpected token \'}\', "{ "name": }" is not valid JSON');
    expect(result?.line).toBe(1);
    expect(result?.column).toBe(1);
  });

  it('should handle empty content with whitespace', () => {
    const result = validateJson('   \n  \t  ');
    expect(result).toBeNull();
  });
});

describe('debounce', () => {
  let mockFn: ReturnType<typeof vi.fn>;
  let debouncedFn: ReturnType<typeof debounce>;
  let setTimeoutSpy: ReturnType<typeof vi.spyOn>;
  let clearTimeoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFn = vi.fn();
    debouncedFn = debounce(mockFn, 100);
    setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call the function after delay', () => {
    debouncedFn('test', 1);
    expect(mockFn).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith('test', 1);
  });

  it('should not call the function immediately', () => {
    debouncedFn('test');
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should reset timeout on subsequent calls', () => {
    debouncedFn('first');
    debouncedFn('second');

    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should handle multiple arguments correctly', () => {
    const testFn = vi.fn<[string, number, boolean], void>();
    const debouncedTestFn = debounce(testFn, 100);

    debouncedTestFn('hello', 42, true);
    vi.advanceTimersByTime(100);

    expect(testFn).toHaveBeenCalledWith('hello', 42, true);
  });
});