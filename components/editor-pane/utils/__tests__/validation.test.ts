import { describe, it, expect } from 'vitest';
import { validateJson } from '../validation';

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
    expect(result?.message).toContain('JSON');
  });

  it('should extract line and column from error', () => {
    const result = validateJson('{"name": "John"\n"age": }');
    expect(result).not.toBeNull();
    expect(result?.line).toBeGreaterThan(0);
    expect(result?.column).toBeGreaterThan(0);
  });
});