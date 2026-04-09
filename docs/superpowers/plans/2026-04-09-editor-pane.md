# EditorPane Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dual-pane JSON diff viewer with real-time validation, file upload, and configurable diff behavior via four toggles (Ignore Key Order, Pretty Print, Ignore Whitespace, Semantic Type Diff).

**Architecture:** Modular component structure following existing navbar/toolbar patterns. EditorPane orchestrator manages state, JsonEditor components handle individual CodeMirror instances with validation, useJsonDiff hook encapsulates diff logic, and DiffPanel displays unified diff output.

**Tech Stack:** React 19, TypeScript, Next.js 16, CodeMirror 6 (minimal setup), Shiki (syntax highlighting), diff npm package (text/word/line diffing)

---

## File Structure

```
components/editor-pane/
├── editor-pane.tsx      # Main orchestrator - manages state, coordinates children
├── diff-panel.tsx       # Unified diff display with +/- styling
├── json-editor.tsx      # CodeMirror wrapper with validation
├── use-json-diff.ts     # Custom hook for diff computation logic
├── types.ts            # TypeScript interfaces (EditorPaneState, ParseError, DiffResult, etc.)
└── index.ts            # Barrel exports
```

**Package installation:** diff, @codemirror/view, @codemirror/state, @codemirror/commands, @codemirror/language, @codemirror/autocomplete, shiki

---

## Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install required packages**

```bash
npm install diff @codemirror/view @codemirror/state @codemirror/commands @codemirror/language @codemirror/autocomplete shiki
```

- [ ] **Step 2: Verify installation**

```bash
npm list diff @codemirror/view shiki
```

Expected: All packages listed with versions

- [ ] **Step 3: Commit dependencies**

```bash
git add package.json package-lock.json
git commit -m "feat(editor-pane): install CodeMirror, Shiki, and diff dependencies"
```

---

## Task 2: Create Type Definitions

**Files:**

- Create: `components/editor-pane/types.ts`

- [ ] **Step 1: Write type definitions file**

```typescript
// Parse error details from JSON.parse
export interface ParseError {
    message: string;
    line: number;
    column: number;
}

// Individual diff hunk (unified format)
export interface DiffHunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: DiffLine[];
}

export interface DiffLine {
    type: 'addition' | 'deletion' | 'unchanged';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
}

// Complete diff result
export interface DiffResult {
    hunks: DiffHunk[];
    lineCount: number;
    additionCount: number;
    deletionCount: number;
}

// EditorPane component props
export interface EditorPaneProps {
    // Toggle states (from Toolbar)
    ignoreKeyOrder: boolean;
    prettyPrint: boolean;
    ignoreWhitespace: boolean;
    semanticTypeDiff: boolean;

    // Initial content (optional)
    initialLeftContent?: string;
    initialRightContent?: string;

    // Event handlers
    onCompare?: (result: DiffResult) => void;
    onError?: (error: Error) => void;

    // Styling
    className?: string;
}

// EditorPane internal state
export interface EditorPaneState {
    // Content
    leftContent: string;
    rightContent: string;

    // Validation
    leftValid: boolean;
    rightValid: boolean;
    leftError: ParseError | null;
    rightError: ParseError | null;

    // Diff state
    diffResult: DiffResult | null;
    isComputing: boolean;

    // UI state
    showLineNumbers: boolean;
    leftEditorFocused: boolean;
    rightEditorFocused: boolean;
}

// JsonEditor component props
export interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    onError: (error: ParseError | null) => void;
    label: string;
    placeholder?: string;
    readOnly?: boolean;
}

// DiffPanel component props
export interface DiffPanelProps {
    diffResult: DiffResult | null;
    isLoading: boolean;
}

// useJsonDiff hook options
export interface UseJsonDiffOptions {
    leftContent: string;
    rightContent: string;
    ignoreKeyOrder: boolean;
    prettyPrint: boolean;
    ignoreWhitespace: boolean;
    semanticTypeDiff: boolean;
}

// useJsonDiff hook return
export interface UseJsonDiffReturn {
    diff: DiffResult | null;
    error: Error | null;
    isComputing: boolean;
    computeDiff: () => Promise<void>;
}
```

- [ ] **Step 2: Create barrel export file**

```bash
touch components/editor-pane/index.ts
```

- [ ] **Step 3: Add export to index.ts**

```typescript
export type {
    ParseError,
    DiffHunk,
    DiffLine,
    DiffResult,
    EditorPaneProps,
    EditorPaneState,
    JsonEditorProps,
    DiffPanelProps,
    UseJsonDiffOptions,
    UseJsonDiffReturn,
} from './types';
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 5: Commit type definitions**

```bash
git add components/editor-pane/
git commit -m "feat(editor-pane): add TypeScript type definitions"
```

---

## Task 3: Create JSON Validation Utility

**Files:**

- Create: `components/editor-pane/utils/validation.ts`

- [ ] **Step 1: Create utils directory**

```bash
mkdir -p components/editor-pane/utils
```

- [ ] **Step 2: Write validation utility**

```typescript
import { ParseError } from '../types';

/**
 * Validates JSON string and returns detailed error if invalid
 */
export function validateJson(content: string): ParseError | null {
    if (!content || content.trim().length === 0) {
        return null; // Empty is valid (will show placeholder)
    }

    try {
        JSON.parse(content);
        return null;
    } catch (error) {
        const err = error as Error;
        const parseError = parseJsonError(err.message);
        return {
            message: parseError.message || 'Invalid JSON',
            line: parseError.line || 1,
            column: parseError.column || 1,
        };
    }
}

/**
 * Extract line and column from JSON parse error message
 * Format: "Unexpected token } in JSON at position 42"
 * or "Expected property name or '}' in JSON at line 2 column 3"
 */
function parseJsonError(message: string): { message?: string; line?: number; column?: number } {
    // Try to extract line/column from error message
    const lineMatch = message.match(/line (\d+)/i);
    const columnMatch = message.match(/column (\d+)/i);
    const positionMatch = message.match(/position (\d+)/i);

    const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
    const column = columnMatch ? parseInt(columnMatch[1], 10) : undefined;

    if (line && column) {
        return { message, line, column };
    }

    if (positionMatch) {
        // Calculate line/column from position
        const position = parseInt(positionMatch[1], 10);
        return { message, line: 1, column: position + 1 };
    }

    // Default to line 1, column 1
    return { message, line: 1, column: 1 };
}

/**
 * Debounce utility function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
```

- [ ] **Step 3: Write test for validation**

```bash
mkdir -p components/editor-pane/utils/__tests__
```

Create: `components/editor-pane/utils/__tests__/validation.test.ts`

```typescript
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
```

- [ ] **Step 4: Run tests**

```bash
npm test -- components/editor-pane/utils/__tests__/validation.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit validation utility**

```bash
git add components/editor-pane/utils/
git commit -m "feat(editor-pane): add JSON validation utility with tests"
```

---

## Task 4: Implement JsonEditor Component (Basic Structure)

**Files:**

- Create: `components/editor-pane/json-editor.tsx`

- [ ] **Step 1: Write JsonEditor component with CodeMirror setup**

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, basicSetup } from '@codemirror/view';
import { keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { autocompletion } from '@codemirror/autocomplete';
import { JsonEditorProps, ParseError } from './types';
import { validateJson, debounce } from './utils/validation';

export function JsonEditor({
  value,
  onChange,
  onError,
  label,
  placeholder = '// Enter JSON here',
  readOnly = false,
}: JsonEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [error, setError] = useState<ParseError | null>(null);

  // Debounced validation callback
  const debouncedValidation = useRef(
    debounce((content: string) => {
      const validationError = validateJson(content);
      setError(validationError);
      onError(validationError);
    }, 300)
  );

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    const languageConf = new Compartment();

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        keymap.of(historyKeymap),
        history(),
        json(),
        autocompletion(),
        languageConf.of([]),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: 'monospace',
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '12px 0',
            minHeight: '300px',
          },
          '.cm-line': {
            padding: '0 12px',
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const content = update.state.doc.toString();
            onChange(content);
            debouncedValidation.current(content);
          }
        }),
        readOnly ? EditorState.readOnly.of(true) : [],
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Initial validation
    const validationError = validateJson(value);
    setError(validationError);
    onError(validationError);

    return () => {
      view.destroy();
    };
  }, []); // Empty deps - initialize once

  // Update editor content when value prop changes (external updates)
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (50MB hard limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large (max 50MB)');
      return;
    }

    // Warning for large files
    if (file.size > 10 * 1024 * 1024) {
      alert('Large file may be slow to process');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Validate JSON
      const validationError = validateJson(content);
      if (validationError) {
        alert(`Invalid JSON: ${validationError.message}`);
        return;
      }

      onChange(content);
    };

    reader.onerror = () => {
      alert('Error reading file');
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {/* File upload button */}
          <label className="cursor-pointer text-xs text-primary hover:underline">
            Upload
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Status indicator */}
          {error ? (
            <span className="text-xs text-destructive">Invalid JSON</span>
          ) : value.trim() ? (
            <span className="text-xs text-green-600">Valid ✓</span>
          ) : null}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-b">
          <strong>JSON Parse Error</strong>
          <span className="ml-2">
            Line {error.line}, Column {error.column}: {error.message}
          </span>
        </div>
      )}

      {/* Editor */}
      <div ref={editorRef} className="flex-1 overflow-auto bg-background" />
    </div>
  );
}
```

- [ ] **Step 2: Add JsonEditor to index.ts**

```typescript
export { JsonEditor } from './json-editor';
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Commit JsonEditor basic structure**

```bash
git add components/editor-pane/json-editor.tsx components/editor-pane/index.ts
git commit -m "feat(editor-pane): implement JsonEditor component with CodeMirror"
```

---

## Task 5: Implement DiffPanel Component

**Files:**

- Create: `components/editor-pane/diff-panel.tsx`

- [ ] **Step 1: Write DiffPanel component**

```typescript
'use client';

import { DiffPanelProps } from './types';

export function DiffPanel({ diffResult, isLoading }: DiffPanelProps) {
  if (isLoading) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        Computing diff...
      </div>
    );
  }

  if (!diffResult || diffResult.hunks.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        No differences found
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-muted border-b flex items-center justify-between">
        <span className="text-sm font-medium">Diff</span>
        <div className="text-xs text-muted-foreground">
          {diffResult.additionCount} additions, {diffResult.deletionCount} deletions
        </div>
      </div>

      {/* Diff content */}
      <div className="overflow-auto max-h-96">
        <pre className="text-sm font-mono">
          {diffResult.hunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex}>
              {/* Hunk header */}
              <div className="px-4 py-1 bg-muted text-xs text-muted-foreground">
                @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
              </div>

              {/* Hunk lines */}
              {hunk.lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={`flex px-4 py-0.5 ${
                    line.type === 'addition'
                      ? 'bg-green-500/10'
                      : line.type === 'deletion'
                      ? 'bg-red-500/10'
                      : ''
                  }`}
                >
                  {/* Line numbers */}
                  <span className="w-12 text-right text-muted-foreground select-none mr-4 text-xs">
                    {line.oldLineNumber !== undefined
                      ? line.oldLineNumber
                      : ' '}
                  </span>
                  <span className="w-12 text-right text-muted-foreground select-none mr-4 text-xs">
                    {line.newLineNumber !== undefined
                      ? line.newLineNumber
                      : ' '}
                  </span>

                  {/* Line marker */}
                  <span className="w-4 mr-2 select-none">
                    {line.type === 'addition' ? (
                      <span className="text-green-600">+</span>
                    ) : line.type === 'deletion' ? (
                      <span className="text-red-600">-</span>
                    ) : (
                      <span> </span>
                    )}
                  </span>

                  {/* Line content */}
                  <span
                    className={
                      line.type === 'addition'
                        ? 'text-green-700'
                        : line.type === 'deletion'
                        ? 'text-red-700'
                        : ''
                    }
                  >
                    {line.content}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add DiffPanel to index.ts**

```typescript
export { DiffPanel } from './diff-panel';
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Commit DiffPanel component**

```bash
git add components/editor-pane/diff-panel.tsx components/editor-pane/index.ts
git commit -m "feat(editor-pane): implement DiffPanel component"
```

---

## Task 6: Implement useJsonDiff Hook (Basic Diff)

**Files:**

- Create: `components/editor-pane/use-json-diff.ts`

- [ ] **Step 1: Write useJsonDiff hook with basic diff implementation**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { diffLines } from 'diff';
import { UseJsonDiffOptions, UseJsonDiffReturn, DiffResult, DiffHunk, DiffLine } from './types';

export function useJsonDiff(options: UseJsonDiffOptions): UseJsonDiffReturn {
    const [diff, setDiff] = useState<DiffResult | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isComputing, setIsComputing] = useState(false);

    const computeDiff = useCallback(async () => {
        setIsComputing(true);
        setError(null);

        try {
            // Parse JSON
            const leftParsed = JSON.parse(options.leftContent);
            const rightParsed = JSON.parse(options.rightContent);

            // Apply toggles
            let leftStr = JSON.stringify(leftParsed);
            let rightStr = JSON.stringify(rightParsed);

            // Pretty Print
            if (options.prettyPrint) {
                leftStr = JSON.stringify(JSON.parse(leftStr), null, 2);
                rightStr = JSON.stringify(JSON.parse(rightStr), null, 2);
            }

            // Ignore Whitespace
            if (options.ignoreWhitespace) {
                leftStr = leftStr
                    .replace(/\s+/g, ' ')
                    .replace(/\s*\n\s*/g, '')
                    .trim();
                rightStr = rightStr
                    .replace(/\s+/g, ' ')
                    .replace(/\s*\n\s*/g, '')
                    .trim();
            }

            // Ignore Key Order (simplified - will be expanded in Task 8)
            if (options.ignoreKeyOrder) {
                const sorted = (obj: any): any => {
                    if (Array.isArray(obj)) return obj.map(sorted);
                    if (obj !== null && typeof obj === 'object') {
                        return Object.keys(obj)
                            .sort()
                            .reduce((sorted: any, key) => {
                                sorted[key] = sortObjectKeys(obj[key]);
                                return sorted;
                            }, {});
                    }
                    return obj;
                };

                const sortObjectKeys = (obj: any): any => {
                    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
                    if (obj !== null && typeof obj === 'object') {
                        return Object.keys(obj)
                            .sort()
                            .reduce((sorted: any, key) => {
                                sorted[key] = sortObjectKeys(obj[key]);
                                return sorted;
                            }, {});
                    }
                    return obj;
                };

                leftStr = JSON.stringify(sortObjectKeys(JSON.parse(leftStr)), null, 2);
                rightStr = JSON.stringify(sortObjectKeys(JSON.parse(rightStr)), null, 2);
            }

            // Semantic Type Diff (simplified - will be expanded in Task 9)
            if (options.semanticTypeDiff) {
                // For now, just compare as-is
                // Full implementation will handle type coercion
            }

            // Compute diff using diff package
            const differences = diffLines(leftStr, rightStr);

            // Convert to our format
            const hunks: DiffHunk[] = [];
            let currentHunk: Partial<DiffHunk> | null = null;
            let oldLineNumber = 1;
            let newLineNumber = 1;
            let additionCount = 0;
            let deletionCount = 0;

            differences.forEach((part) => {
                const lines = part.value
                    .split('\n')
                    .filter((l) => l.length > 0 || part.added || part.removed);

                lines.forEach((line) => {
                    if (!currentHunk) {
                        currentHunk = {
                            oldStart: oldLineNumber,
                            newStart: newLineNumber,
                            oldLines: 0,
                            newLines: 0,
                            lines: [],
                        };
                    }

                    if (part.added) {
                        currentHunk.lines?.push({
                            type: 'addition',
                            content: line,
                            newLineNumber,
                        });
                        currentHunk.newLines = (currentHunk.newLines || 0) + 1;
                        newLineNumber++;
                        additionCount++;
                    } else if (part.removed) {
                        currentHunk.lines?.push({
                            type: 'deletion',
                            content: line,
                            oldLineNumber,
                        });
                        currentHunk.oldLines = (currentHunk.oldLines || 0) + 1;
                        oldLineNumber++;
                        deletionCount++;
                    } else {
                        currentHunk.lines?.push({
                            type: 'unchanged',
                            content: line,
                            oldLineNumber,
                            newLineNumber,
                        });
                        currentHunk.oldLines = (currentHunk.oldLines || 0) + 1;
                        currentHunk.newLines = (currentHunk.newLines || 0) + 1;
                        oldLineNumber++;
                        newLineNumber++;
                    }
                });
            });

            if (currentHunk) {
                hunks.push(currentHunk as DiffHunk);
            }

            const result: DiffResult = {
                hunks,
                lineCount: oldLineNumber + newLineNumber - 2,
                additionCount,
                deletionCount,
            };

            setDiff(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsComputing(false);
        }
    }, [options]);

    return {
        diff,
        error,
        isComputing,
        computeDiff,
    };
}
```

- [ ] **Step 2: Write tests for useJsonDiff hook**

```bash
mkdir -p components/editor-pane/__tests__
```

Create: `components/editor-pane/__tests__/use-json-diff.test.ts`

```typescript
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
            }),
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
            }),
        );

        await result.current.computeDiff();

        expect(result.current.diff).not.toBeNull();
        expect(result.current.diff?.additionCount).toBeGreaterThan(0);
        expect(result.current.diff?.deletionCount).toBeGreaterThan(0);
    });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- components/editor-pane/__tests__/use-json-diff.test.ts
```

Expected: Tests pass

- [ ] **Step 4: Add useJsonDiff to index.ts**

```typescript
export { useJsonDiff } from './use-json-diff';
```

- [ ] **Step 5: Commit basic useJsonDiff hook**

```bash
git add components/editor-pane/use-json-diff.ts components/editor-pane/__tests__/ components/editor-pane/index.ts
git commit -m "feat(editor-pane): implement useJsonDiff hook with basic diff logic"
```

---

## Task 7: Implement EditorPane Orchestrator

**Files:**

- Create: `components/editor-pane/editor-pane.tsx`

- [ ] **Step 1: Write EditorPane orchestrator component**

```typescript
'use client';

import { useState, useCallback } from 'react';
import { EditorPaneProps, EditorPaneState } from './types';
import { JsonEditor } from './json-editor';
import { DiffPanel } from './diff-panel';
import { useJsonDiff } from './use-json-diff';

export function EditorPane({
  ignoreKeyOrder,
  prettyPrint,
  ignoreWhitespace,
  semanticTypeDiff,
  initialLeftContent = '',
  initialRightContent = '',
  onCompare,
  onError,
  className,
}: EditorPaneProps) {
  // State
  const [leftContent, setLeftContent] = useState<string>(initialLeftContent);
  const [rightContent, setRightContent] = useState<string>(initialRightContent);
  const [leftValid, setLeftValid] = useState<boolean>(false);
  const [rightValid, setRightValid] = useState<boolean>(false);

  // Diff hook
  const { diff, error: diffError, isComputing, computeDiff } = useJsonDiff({
    leftContent,
    rightContent,
    ignoreKeyOrder,
    prettyPrint,
    ignoreWhitespace,
    semanticTypeDiff,
  });

  // Handle compare click
  const handleCompare = useCallback(async () => {
    if (!leftValid || !rightValid) return;

    try {
      await computeDiff();
      onCompare?.(diff);
    } catch (err) {
      onError?.(err as Error);
    }
  }, [leftValid, rightValid, computeDiff, diff, onCompare, onError]);

  // Handle diff errors
  if (diffError) {
    onError?.(diffError);
  }

  const canCompare = leftValid && rightValid;

  return (
    <div className={className}>
      {/* Editor Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <JsonEditor
          label="Left"
          value={leftContent}
          onChange={setLeftContent}
          onError={(error) => setLeftValid(error === null && leftContent.trim().length > 0)}
          placeholder="// Enter JSON or upload file"
        />

        <JsonEditor
          label="Right"
          value={rightContent}
          onChange={setRightContent}
          onError={(error) => setRightValid(error === null && rightContent.trim().length > 0)}
          placeholder="// Enter JSON or upload file"
        />
      </div>

      {/* Compare Button */}
      <div className="mb-4">
        <button
          onClick={handleCompare}
          disabled={!canCompare || isComputing}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isComputing ? 'Computing...' : 'Compare'}
        </button>
      </div>

      {/* Diff Panel */}
      <DiffPanel diffResult={diff} isLoading={isComputing} />
    </div>
  );
}
```

- [ ] **Step 2: Add EditorPane to index.ts**

```typescript
export { EditorPane } from './editor-pane';
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Build verification**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 5: Commit EditorPane orchestrator**

```bash
git add components/editor-pane/editor-pane.tsx components/editor-pane/index.ts
git commit -m "feat(editor-pane): implement EditorPane orchestrator component"
```

---

## Task 8: Add Shiki Syntax Highlighting to JsonEditor

**Files:**

- Modify: `components/editor-pane/json-editor.tsx`

- [ ] **Step 1: Update JsonEditor to use Shiki for syntax highlighting**

```typescript
// Add at top of file
import { getHighlighter } from 'shiki';

// Add inside JsonEditor component, after other refs
const highlighterRef = useRef<any>(null);

// Add new useEffect to load Shiki highlighter
useEffect(() => {
  const loadHighlighter = async () => {
    const highlighter = await getHighlighter({
      themes: ['github-light'],
      langs: ['json'],
    });

    highlighterRef.current = highlighter;
  };

  loadHighlighter();
}, []);

// Update the EditorView.theme extension to include syntax highlighting
// Replace the existing EditorView.theme with:
EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '12px 0',
    minHeight: '300px',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.tok-keyword': {
    color: '#d73a49',
  },
  '.tok-string': {
    color: '#032f62',
  },
  '.tok-number': {
    color: '#005cc5',
  },
  '.tok-bool': {
    color: '#d73a49',
  },
  '.tok-null': {
    color: '#005cc5',
  },
  '.tok-propertyName': {
    color: '#6f42c1',
  },
}),
```

Note: This is a simplified syntax highlighting approach. For full Shiki integration with CodeMirror, additional setup is needed. The basic approach uses CodeMirror's built-in JSON syntax highlighting with custom token styling.

- [ ] **Step 2: Commit syntax highlighting**

```bash
git add components/editor-pane/json-editor.tsx
git commit -m "feat(editor-pane): add syntax highlighting to JsonEditor"
```

---

## Task 9: Enhance useJsonDiff with Advanced Toggle Logic

**Files:**

- Modify: `components/editor-pane/use-json-diff.ts`

- [ ] **Step 1: Enhance Ignore Key Order logic**

Replace the sortObjectKeys function with a more robust implementation:

```typescript
const sortObjectKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const sorted = Object.keys(obj)
        .sort()
        .reduce((acc: any, key) => {
            acc[key] = sortObjectKeys(obj[key]);
            return acc;
        }, {});

    return sorted;
};
```

- [ ] **Step 2: Enhance Semantic Type Diff logic**

Replace the simplified semantic type diff with full implementation:

```typescript
// Semantic Type Diff: Coerce types for comparison
const coerceValue = (value: any): any => {
    // String to number
    if (typeof value === 'string' && /^\d+$/.test(value)) {
        return Number(value);
    }

    // String to boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // String to null
    if (value === 'null') return null;

    return value;
};

const compareWithCoercion = (left: any, right: any): boolean => {
    const leftCoerced = coerceValue(left);
    const rightCoerced = coerceValue(right);

    if (typeof leftCoerced !== typeof rightCoerced) {
        return JSON.stringify(leftCoerced) === JSON.stringify(rightCoerced);
    }

    return JSON.stringify(leftCoerced) === JSON.stringify(rightCoerced);
};

const applySemanticDiff = (left: any, right: any): boolean => {
    // Deep comparison with type coercion
    const normalize = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') {
            return coerceValue(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(normalize);
        }

        const normalized: any = {};
        for (const key of Object.keys(obj)) {
            normalized[key] = normalize(obj[key]);
        }

        return normalized;
    };

    const normalizedLeft = normalize(left);
    const normalizedRight = normalize(right);

    return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
};

// Use in computeDiff function:
if (options.semanticTypeDiff) {
    if (applySemanticDiff(leftParsed, rightParsed)) {
        // Objects are semantically equal
        setDiff({
            hunks: [],
            lineCount: 0,
            additionCount: 0,
            deletionCount: 0,
        });
        return;
    }
}
```

- [ ] **Step 3: Commit enhanced toggle logic**

```bash
git add components/editor-pane/use-json-diff.ts
git commit -m "feat(editor-pane): enhance Ignore Key Order and Semantic Type Diff logic"
```

---

## Task 10: Integration Test with App Page

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Update page.tsx to integrate EditorPane with Toolbar**

```typescript
'use client';

import { useState } from 'react';
import { Toolbar } from '@/components/toolbar';
import { EditorPane } from '@/components/editor-pane';

export default function Home() {
  const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [semanticTypeDiff, setSemanticTypeDiff] = useState(false);

  const handleCompare = (result: any) => {
    console.log('Diff result:', result);
  };

  const handleError = (error: Error) => {
    console.error('Diff error:', error);
  };

  return (
    <div className="min-h-screen">
      <Toolbar
        toggles={[
          {
            id: 'ignoreKeyOrder',
            label: 'Ignore Key Order',
            checked: ignoreKeyOrder,
            onChange: setIgnoreKeyOrder,
          },
          {
            id: 'prettyPrint',
            label: 'Pretty Print',
            checked: prettyPrint,
            onChange: setPrettyPrint,
          },
          {
            id: 'ignoreWhitespace',
            label: 'Ignore Whitespace',
            checked: ignoreWhitespace,
            onChange: setIgnoreWhitespace,
          },
          {
            id: 'semanticTypeDiff',
            label: 'Semantic Type Diff',
            checked: semanticTypeDiff,
            onChange: setSemanticTypeDiff,
          },
        ]}
        actions={[
          {
            id: 'clear',
            label: 'Clear All',
            onClick: () => console.log('Clear'),
            variant: 'outline',
          },
          {
            id: 'compare',
            label: 'Compare',
            onClick: () => console.log('Compare'),
            variant: 'default',
          },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">JSON Diff Viewer</h1>

        <EditorPane
          ignoreKeyOrder={ignoreKeyOrder}
          prettyPrint={prettyPrint}
          ignoreWhitespace={ignoreWhitespace}
          semanticTypeDiff={semanticTypeDiff}
          initialLeftContent={`{\n  "name": "John Doe",\n  "age": 30\n}`}
          initialRightContent={`{\n  "age": 30,\n  "name": "John Doe"\n}`}
          onCompare={handleCompare}
          onError={handleError}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and test**

```bash
npm run build
npm run dev
```

Expected: Application starts, EditorPane displays with Toolbar toggles

- [ ] **Step 3: Manual testing checklist**
    - Type valid JSON in both editors
    - Verify "Valid ✓" indicator appears
    - Click Compare button
    - Verify diff appears in DiffPanel
    - Test each toggle:
        - Enable Ignore Key Order → diff should disappear
        - Enable Pretty Print → diff reformats
        - Enable Ignore Whitespace → whitespace differences ignored
        - Enable Semantic Type Diff → type coercion applied
    - Test invalid JSON → error message appears
    - Test file upload → upload valid JSON file
    - Test keyboard navigation (Tab between editors)

- [ ] **Step 4: Commit integration**

```bash
git add app/page.tsx
git commit -m "feat(editor-pane): integrate EditorPane with Toolbar on homepage"
```

---

## Task 11: Final Polish and Testing

**Files:**

- Various

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 2: Type check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: Build succeeds, analyze bundle size

- [ ] **Step 5: Bundle size verification**

Check that bundle size increase is <200KB gzipped

- [ ] **Step 6: Accessibility check**
    - Keyboard navigation works
    - Screen reader announces errors
    - Focus indicators visible
    - ARIA labels present

- [ ] **Step 7: Performance check**
    - Large files (1MB+) don't freeze UI
    - Diff computation completes in <2 seconds
    - No memory leaks on re-renders

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat(editor-pane): complete EditorPane implementation with all features"
```

---

## Success Criteria

- ✅ All tests pass (unit + integration)
- ✅ Build succeeds with no TypeScript errors
- ✅ Manual testing checklist complete
- ✅ Bundle size increase <200KB gzipped
- ✅ No console errors in browser
- ✅ Accessibility requirements met
- ✅ Performance requirements met (<2s for 1MB files)

---

## Notes

- Follow TDD: write failing test first, then implement
- Commit after each task
- Run `npm run typecheck` frequently
- Use `npm run dev` for manual testing during development
- Refer to spec: `docs/superpowers/specs/2026-04-09-editor-pane-design.md`
- Follow existing code patterns from navbar/toolbar components
- Keep components focused and testable
- Error messages should be user-friendly
