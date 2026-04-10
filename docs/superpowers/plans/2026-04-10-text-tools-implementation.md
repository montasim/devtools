# Text Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a text tools page at `/text` with Diff and Transform tabs for text comparison and transformation operations.

**Architecture:** Follow existing JSON tools pattern with tab-based layout. Create new components (TextDiffPane, TextTransformPane) that reuse UI patterns (Tabs, Toolbar) but implement text-specific functionality using plain textareas instead of JSON editors.

**Tech Stack:** Next.js 15 (App Router), TypeScript, React hooks, diff library (v8.0.4 - already installed), react-diff-viewer-continued, shadcn/ui components, localStorage for persistence

---

## File Structure

```
app/text/page.tsx                              # Main page orchestrating tabs
app/globals.css                                # Add diff viewer CSS variables
components/text-tools/
├── shared/
│   └── types.ts                              # Shared TypeScript interfaces
├── diff-pane/
│   ├── types.ts                              # Diff-specific types
│   ├── use-text-diff.ts                      # Diff logic hook
│   ├── diff-results.tsx                      # Diff viewer component
│   └── diff-pane.tsx                         # Main diff container component
└── transform-pane/
    ├── types.ts                              # Transform-specific types
    ├── text-transformations.ts               # Transformation utility functions
    ├── use-text-transform.ts                 # Transform logic hook
    ├── transform-actions.tsx                 # Transformation button toolbar
    └── transform-pane.tsx                    # Main transform container component
components/ui/
├── textarea.tsx                              # New textarea component (reusable)
├── badge.tsx                                 # Badge component (for transform toolbar)
└── alert.tsx                                 # Alert component (for error banners)
```

---

## Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Add diff viewer library dependency**

Run: `pnpm add react-diff-viewer-continued@^3.2.6`

Expected: Dependency added to package.json and node_modules installed
Note: `diff@^8.0.4` is already installed

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(text-tools): install react-diff-viewer dependency"
```

---

## Task 2: Create Shared Types

**Files:**

- Create: `components/text-tools/shared/types.ts`

- [ ] **Step 1: Write shared TypeScript interfaces**

```typescript
// Error types for text operations
export interface TextError {
    message: string;
    type: 'validation' | 'processing' | 'storage';
}

// Common validation result
export interface ValidationResult {
    isValid: boolean;
    error?: TextError;
}

// Size limit constant
export const MAX_TEXT_SIZE = 1 * 1024 * 1024; // 1MB in bytes

// Helper function to check text size
export function exceedsSizeLimit(text: string): boolean {
    return new Blob([text]).size > MAX_TEXT_SIZE;
}

// Helper function to format size for display
export function formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/shared/types.ts
git commit -m "feat(text-tools): add shared types and utilities"
```

---

## Task 3: Create Textarea Component

**Files:**

- Create: `components/ui/textarea.tsx`

- [ ] **Step 1: Write textarea component**

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="relative">
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-destructive focus-visible:ring-destructive',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-destructive">{error}</p>
                )}
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/textarea.tsx
git commit -m "feat(ui): add Textarea component with error support"
```

---

## Task 4: Create Badge Component

**Files:**

- Create: `components/ui/badge.tsx`

- [ ] **Step 1: Write badge component**

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                outline: 'text-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/badge.tsx
git commit -m "feat(ui): add Badge component"
```

---

## Task 5: Create Alert Component

**Files:**

- Create: `components/ui/alert.tsx`

- [ ] **Step 1: Write alert component**

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive:
                    'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    />
));
Alert.displayName = 'Alert';

export { Alert };
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/alert.tsx
git commit -m "feat(ui): add Alert component for error banners"
```

---

## Task 6: Create Diff Pane Types

**Files:**

- Create: `components/text-tools/diff-pane/types.ts`

- [ ] **Step 1: Write diff-specific types**

```typescript
export interface TextDiffOptions {
    ignoreCase: boolean;
    ignoreWhitespace: boolean;
}

export interface TextDiffResult {
    leftLines: string[];
    rightLines: string[];
    hasChanges: boolean;
}

export interface TextDiffPaneProps {
    ignoreCase: boolean;
    ignoreWhitespace: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export interface TextDiffPaneRef {
    triggerCompare: () => Promise<void>;
    clear: () => void;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/diff-pane/types.ts
git commit -m "feat(text-tools): add diff pane types"
```

---

## Task 7: Create Debounced Save Hook

**Files:**

- Create: `components/text-tools/shared/use-debounced-save.ts`

- [ ] **Step 1: Write debounced localStorage save hook**

```typescript
import { useEffect, useRef } from 'react';

/**
 * Custom hook for debounced localStorage saves
 * Follows pattern from format-pane.tsx (lines 46-55)
 */
export function useDebouncedSave(key: string, value: string, delay: number = 500) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initialValueRef = useRef(value);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Save to localStorage with debouncing
    useEffect(() => {
        // Don't save on initial render
        if (value === initialValueRef.current) {
            initialValueRef.current = value;
            return;
        }

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.error(`Failed to save ${key} to localStorage:`, error);
            }
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, value, delay]);
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/shared/use-debounced-save.ts
git commit -m "feat(text-tools): add debounced localStorage save hook"
```

---

## Task 8: Create Diff Logic Hook

**Files:**

- Create: `components/text-tools/diff-pane/use-text-diff.ts`

- [ ] **Step 1: Write diff computation hook**

```typescript
import { useState, useCallback } from 'react';
import { diffLines } from 'diff';
import type { TextDiffOptions, TextDiffResult } from './types';

export function useTextDiff(leftText: string, rightText: string, options: TextDiffOptions) {
    const [result, setResult] = useState<TextDiffResult | null>(null);
    const [isComputing, setIsComputing] = useState(false);

    const computeDiff = useCallback(async () => {
        setIsComputing(true);

        try {
            // Apply text preprocessing based on options
            let processedLeft = leftText;
            let processedRight = rightText;

            if (options.ignoreCase) {
                processedLeft = processedLeft.toLowerCase();
                processedRight = processedRight.toLowerCase();
            }

            if (options.ignoreWhitespace) {
                processedLeft = processedLeft.replace(/\s+/g, ' ').trim();
                processedRight = processedRight.replace(/\s+/g, ' ').trim();
            }

            // Compute line-by-line diff
            const diff = diffLines(processedLeft, processedRight);

            const leftLines: string[] = [];
            const rightLines: string[] = [];
            let hasChanges = false;

            diff.forEach((part) => {
                const lines = part.value
                    .split('\n')
                    .filter((line) => line.length > 0 || part.value.includes('\n'));

                if (part.added) {
                    rightLines.push(...lines);
                    hasChanges = true;
                } else if (part.removed) {
                    leftLines.push(...lines);
                    hasChanges = true;
                } else {
                    leftLines.push(...lines);
                    rightLines.push(...lines);
                }
            });

            setResult({
                leftLines,
                rightLines,
                hasChanges,
            });
        } catch (error) {
            console.error('Diff computation failed:', error);
            throw error;
        } finally {
            setIsComputing(false);
        }
    }, [leftText, rightText, options]);

    return {
        result,
        isComputing,
        computeDiff,
    };
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/diff-pane/use-text-diff.ts
git commit -m "feat(text-tools): add diff computation hook"
```

---

## Task 9: Create Diff Results Viewer

**Files:**

- Create: `components/text-tools/diff-pane/diff-results.tsx`

- [ ] **Step 1: Write diff viewer component**

```typescript
'use client';

import React from 'react';
import { ReactDiffViewer, ReactDiffViewerStylesOverride } from 'react-diff-viewer-continued';
import type { TextDiffResult } from './types';

interface DiffResultsProps {
    result: TextDiffResult;
    leftLabel?: string;
    rightLabel?: string;
}

export function DiffResults({ result, leftLabel = 'Original', rightLabel = 'Modified' }: DiffResultsProps) {
    // Custom styles to match the app theme
    const styles: ReactDiffViewerStylesOverride = {
        variables: {
            dark: {
                diffViewerBackground: 'hsl(var(--background))',
                diffViewerTitleBackground: 'hsl(var(--muted))',
                diffViewerTitleColor: 'hsl(var(--foreground))',
                diffViewerTitleBorderColor: 'hsl(var(--border))',
                addedBackground: 'hsl(var(--diff-added-bg, 144 85% 90% / 0.3))',
                addedColor: 'hsl(var(--diff-added-text, 144 70% 25%))',
                removedBackground: 'hsl(var(--diff-removed-bg, 0 85% 90% / 0.3))',
                removedColor: 'hsl(var(--diff-removed-text, 0 70% 25%))',
                wordAddedBackground: 'hsl(var(--diff-word-added-bg, 144 85% 85% / 0.5))',
                wordRemovedBackground: 'hsl(var(--diff-word-removed-bg, 0 85% 85% / 0.5))',
                addedGutterBackground: 'hsl(var(--diff-gutter-added, 144 70% 90%))',
                removedGutterBackground: 'hsl(var(--diff-gutter-removed, 0 70% 90%))',
                gutterBackground: 'hsl(var(--diff-gutter, 0 0% 90%))',
                gutterBackgroundDark: 'hsl(var(--diff-gutter-dark, 0 0% 20%))',
                highlightBackground: 'hsl(var(--diff-highlight, 255 255% 50% / 0.3))',
                highlightGutterBackground: 'hsl(var(--diff-highlight-gutter, 255 255% 60% / 0.3))',
                codeFoldGutterBackground: 'hsl(var(--diff-fold-gutter, 0 0% 85%))',
                codeFoldBackground: 'hsl(var(--diff-fold, 0 0% 90%))',
                emptyLineBackground: 'hsl(var(--diff-empty-line, 0 0% 95%))',
            },
        },
        line: {
            padding: '4px 8px',
            fontSize: '13px',
            fontFamily: 'var(--font-mono, monospace)',
        },
        gutter: {
            padding: '0 8px',
            minWidth: '32px',
            fontSize: '12px',
        },
        contentText: {
            fontSize: '13px',
            lineHeight: '1.6',
        },
        diffContainer: {
            borderRadius: '6px',
            border: '1px solid hsl(var(--border))',
        },
    };

    const leftText = result.leftLines.join('\n');
    const rightText = result.rightLines.join('\n');

    return (
        <div className="w-full">
            <ReactDiffViewer
                oldValue={leftText}
                newValue={rightText}
                leftTitle={leftLabel}
                rightTitle={rightLabel}
                splitView={true}
                useDarkTheme={false}
                styles={styles}
                hideLineNumbers={false}
                showDiffOnly={false}
            />
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/diff-pane/diff-results.tsx
git commit -m "feat(text-tools): add diff results viewer component"
```

---

## Task 10: Create Diff Pane Component

**Files:**

- Create: `components/text-tools/diff-pane/diff-pane.tsx`

- [ ] **Step 1: Write diff pane container component**

```typescript
'use client';

import { useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { exceedsSizeLimit, formatSize } from '../shared/types';
import { useDebouncedSave } from '../shared/use-debounced-save';
import type { TextDiffPaneProps, TextDiffPaneRef } from './types';
import { useTextDiff } from './use-text-diff';
import { DiffResults } from './diff-results';

export const TextDiffPane = ({
    ignoreCase,
    ignoreWhitespace,
    onValidationChange,
    onError,
    className = '',
}: TextDiffPaneProps) => {
    // State for left and right text areas with localStorage persistence
    const [leftText, setLeftText] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem('text-diff-left-content') || '';
        } catch {
            return '';
        }
    });

    const [rightText, setRightText] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem('text-diff-right-content') || '';
        } catch {
            return '';
        }
    });

    const [leftError, setLeftError] = useState<string>('');
    const [rightError, setRightError] = useState<string>('');
    const [storageError, setStorageError] = useState<string>('');

    // Computed diff using custom hook
    const { result, isComputing, computeDiff } = useTextDiff(leftText, rightText, {
        ignoreCase,
        ignoreWhitespace,
    });

    // Debounced localStorage saves
    useDebouncedSave('text-diff-left-content', leftText, 500);
    useDebouncedSave('text-diff-right-content', rightText, 500);

    // Validation
    useEffect(() => {
        const isValid = leftText.trim().length > 0 && rightText.trim().length > 0 &&
                       !leftError && !rightError;
        onValidationChange?.(isValid);
    }, [leftText, rightText, leftError, rightError, onValidationChange]);

    // Validate left text
    useEffect(() => {
        if (!leftText) {
            setLeftError('');
            return;
        }

        if (exceedsSizeLimit(leftText)) {
            const size = formatSize(new Blob([leftText]).size);
            setLeftError(`Text exceeds 1MB limit (current: ${size}). Large texts may cause performance issues.`);
        } else {
            setLeftError('');
        }
    }, [leftText]);

    // Validate right text
    useEffect(() => {
        if (!rightText) {
            setRightError('');
            return;
        }

        if (exceedsSizeLimit(rightText)) {
            const size = formatSize(new Blob([rightText]).size);
            setRightError(`Text exceeds 1MB limit (current: ${size}). Large texts may cause performance issues.`);
        } else {
            setRightError('');
        }
    }, [rightText]);

    // Handle storage errors
    useEffect(() => {
        const handleStorageError = () => {
            setStorageError('Warning: Unable to save to browser storage (quota exceeded). Your work is not being saved. Try clearing your browser data or using smaller texts.');
            onError?.(new Error(storageError));
        };

        // Listen for storage errors (simplified - in real app would use more robust detection)
        window.addEventListener('storage', handleStorageError);
        return () => window.removeEventListener('storage', handleStorageError);
    }, [storageError, onError]);

    // Handle left text change
    const handleLeftChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLeftText(e.target.value);
    }, []);

    // Handle right text change
    const handleRightChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRightText(e.target.value);
    }, []);

    // Clear both panes
    const handleClear = useCallback(() => {
        setLeftText('');
        setRightText('');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('text-diff-left-content');
            localStorage.removeItem('text-diff-right-content');
        }
    }, []);

    // Expose methods via ref
    useImperativeHandle<any, TextDiffPaneRef>(null, () => ({
        triggerCompare: async () => {
            await computeDiff();
        },
        clear: handleClear,
    }));

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Storage error banner */}
            {storageError && (
                <Alert variant="destructive">
                    {storageError}
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Pane */}
                <div className="space-y-2">
                    <label htmlFor="diff-left" className="text-sm font-medium">
                        Original Text
                    </label>
                    <Textarea
                        id="diff-left"
                        value={leftText}
                        onChange={handleLeftChange}
                        error={leftError}
                        placeholder="Enter original text here..."
                        className="min-h-[400px] font-mono text-sm"
                    />
                </div>

                {/* Right Pane */}
                <div className="space-y-2">
                    <label htmlFor="diff-right" className="text-sm font-medium">
                        Modified Text
                    </label>
                    <Textarea
                        id="diff-right"
                        value={rightText}
                        onChange={handleRightChange}
                        error={rightError}
                        placeholder="Enter modified text here..."
                        className="min-h-[400px] font-mono text-sm"
                    />
                </div>
            </div>

            {/* Diff Results */}
            {result && (
                <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-medium">Diff Results</h3>
                    <DiffResults result={result} />
                </div>
            )}

            {isComputing && (
                <div className="text-center text-sm text-muted-foreground py-4">
                    Computing diff...
                </div>
            )}
        </div>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/diff-pane/diff-pane.tsx
git commit -m "feat(text-tools): add diff pane component with debounced localStorage persistence"
```

---

## Task 11: Create Transform Pane Types

**Files:**

- Create: `components/text-tools/transform-pane/types.ts`

- [ ] **Step 1: Write transform-specific types**

```typescript
export type TransformationType =
    | 'toUpperCase'
    | 'toLowerCase'
    | 'toTitleCase'
    | 'toSentenceCase'
    | 'base64Encode'
    | 'base64Decode'
    | 'urlEncode'
    | 'urlDecode'
    | 'trim'
    | 'normalizeSpaces'
    | 'removeExtraLines'
    | 'reverseText'
    | 'shuffleWords';

export interface Transformation {
    type: TransformationType;
    label: string;
    category: 'Case' | 'Encoding' | 'Whitespace' | 'Other';
    description?: string;
}

export interface TextTransformPaneProps {
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    className?: string;
}

export interface TransformResult {
    output: string;
    error?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/transform-pane/types.ts
git commit -m "feat(text-tools): add transform pane types"
```

---

## Task 12: Create Transformation Utility Functions

**Files:**

- Create: `components/text-tools/transform-pane/text-transformations.ts`

- [ ] **Step 1: Write transformation functions**

```typescript
import type { TransformationType } from './types';

export interface TransformFunction {
    (input: string): string;
}

// Transformation function map
export const transformationFunctions: Record<TransformationType, TransformFunction> = {
    // Case conversions
    toUpperCase: (input: string): string => {
        return input.toUpperCase();
    },

    toLowerCase: (input: string): string => {
        return input.toLowerCase();
    },

    toTitleCase: (input: string): string => {
        return input
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    toSentenceCase: (input: string): string => {
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    },

    // Encoding/Decoding
    base64Encode: (input: string): string => {
        try {
            return btoa(input);
        } catch (error) {
            throw new Error('Base64 encode failed: string contains invalid characters');
        }
    },

    base64Decode: (input: string): string => {
        try {
            return atob(input);
        } catch (error) {
            throw new Error('Invalid Base64 string: unable to decode');
        }
    },

    urlEncode: (input: string): string => {
        return encodeURIComponent(input);
    },

    urlDecode: (input: string): string => {
        try {
            return decodeURIComponent(input);
        } catch (error) {
            const match = input.match(/%([0-9A-Fa-f]{2})/g);
            const pos = match ? input.indexOf(match[0] || '') : 0;
            throw new Error(`URL decode failed: malformed percent encoding at position ${pos}`);
        }
    },

    // Whitespace operations
    trim: (input: string): string => {
        return input.trim();
    },

    normalizeSpaces: (input: string): string => {
        return input.replace(/\s+/g, ' ').trim();
    },

    removeExtraLines: (input: string): string => {
        return input.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    },

    // Other
    reverseText: (input: string): string => {
        return input.split('').reverse().join('');
    },

    shuffleWords: (input: string): string => {
        const words = input.split(' ');
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        return words.join(' ');
    },
};

// Transform function with error handling
export function transformText(type: TransformationType, input: string): string {
    const transformFn = transformationFunctions[type];
    if (!transformFn) {
        throw new Error(`Unknown transformation type: ${type}`);
    }

    return transformFn(input);
}

// Get all transformations organized by category
export function getTransformationsByCategory(): Record<string, TransformationType[]> {
    return {
        Case: ['toUpperCase', 'toLowerCase', 'toTitleCase', 'toSentenceCase'],
        Encoding: ['base64Encode', 'base64Decode', 'urlEncode', 'urlDecode'],
        Whitespace: ['trim', 'normalizeSpaces', 'removeExtraLines'],
        Other: ['reverseText', 'shuffleWords'],
    };
}

// Transformation labels for display
export const transformationLabels: Record<TransformationType, string> = {
    toUpperCase: 'Uppercase',
    toLowerCase: 'Lowercase',
    toTitleCase: 'Title Case',
    toSentenceCase: 'Sentence Case',
    base64Encode: 'Base64 Encode',
    base64Decode: 'Base64 Decode',
    urlEncode: 'URL Encode',
    urlDecode: 'URL Decode',
    trim: 'Trim',
    normalizeSpaces: 'Normalize Spaces',
    removeExtraLines: 'Remove Extra Lines',
    reverseText: 'Reverse Text',
    shuffleWords: 'Shuffle Words',
};
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/transform-pane/text-transformations.ts
git commit -m "feat(text-tools): add text transformation utility functions"
```

---

## Task 13: Create Transform Logic Hook

**Files:**

- Create: `components/text-tools/transform-pane/use-text-transform.ts`

- [ ] **Step 1: Write transform logic hook**

```typescript
import { useState, useCallback } from 'react';
import { transformText } from './text-transformations';
import type { TransformationType, TransformResult } from './types';

export function useTextTransform() {
    const [result, setResult] = useState<TransformResult | null>(null);
    const [isTransforming, setIsTransforming] = useState(false);

    const applyTransform = useCallback(async (type: TransformationType, input: string) => {
        setIsTransforming(true);
        setResult(null);

        try {
            const output = transformText(type, input);
            setResult({ output });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Transformation failed';
            setResult({ output: '', error: message });
        } finally {
            setIsTransforming(false);
        }
    }, []);

    const clearResult = useCallback(() => {
        setResult(null);
    }, []);

    return {
        result,
        isTransforming,
        applyTransform,
        clearResult,
    };
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/transform-pane/use-text-transform.ts
git commit -m "feat(text-tools): add transform logic hook"
```

---

## Task 14: Create Transform Actions Toolbar

**Files:**

- Create: `components/text-tools/transform-pane/transform-actions.tsx`

- [ ] **Step 1: Write transformation button toolbar**

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TransformationType } from './types';
import { getTransformationsByCategory, transformationLabels } from './text-transformations';

interface TransformActionsProps {
    onTransform: (type: TransformationType) => void;
    disabled?: boolean;
    isTransforming?: boolean;
}

export function TransformActions({ onTransform, disabled = false, isTransforming = false }: TransformActionsProps) {
    const categories = getTransformationsByCategory();

    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([category, transformations]) => (
                <div key={category} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {category}
                    </Badge>
                    <div className="flex gap-1">
                        {transformations.map((type) => (
                            <Button
                                key={type}
                                variant="outline"
                                size="sm"
                                onClick={() => onTransform(type as TransformationType)}
                                disabled={disabled || isTransforming}
                                className="text-xs"
                            >
                                {transformationLabels[type as TransformationType]}
                            </Button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/transform-pane/transform-actions.tsx
git commit -m "feat(text-tools): add transformation actions toolbar"
```

---

## Task 15: Create Transform Pane Component

**Files:**

- Create: `components/text-tools/transform-pane/transform-pane.tsx`

- [ ] **Step 1: Write transform pane container component**

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { exceedsSizeLimit, formatSize } from '../shared/types';
import { useDebouncedSave } from '../shared/use-debounced-save';
import { TransformActions } from './transform-actions';
import { useTextTransform } from './use-text-transform';
import type { TextTransformPaneProps, TransformationType } from './types';

export const TextTransformPane = ({
    onError,
    onValidationChange,
    className = '',
}: TextTransformPaneProps) => {
    // State for input text with localStorage persistence
    const [inputText, setInputText] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem('text-transform-input') || '';
        } catch {
            return '';
        }
    });

    const [inputError, setInputError] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [storageError, setStorageError] = useState<string>('');

    // Debounced localStorage save
    useDebouncedSave('text-transform-input', inputText, 500);

    // Transform hook
    const { result, isTransforming, applyTransform, clearResult } = useTextTransform();

    // Validation
    useEffect(() => {
        const isValid = inputText.trim().length > 0 && !inputError;
        onValidationChange?.(isValid);
    }, [inputText, inputError, onValidationChange]);

    // Validate input text
    useEffect(() => {
        if (!inputText) {
            setInputError('');
            return;
        }

        if (exceedsSizeLimit(inputText)) {
            const size = formatSize(new Blob([inputText]).size);
            setInputError(`Text exceeds 1MB limit (current: ${size}). Large texts may cause performance issues.`);
        } else {
            setInputError('');
        }
    }, [inputText]);

    // Handle storage errors
    useEffect(() => {
        const handleStorageError = () => {
            const errorMsg = 'Warning: Unable to save to browser storage (quota exceeded). Your work is not being saved. Try clearing your browser data or using smaller texts.';
            setStorageError(errorMsg);
            onError?.(new Error(errorMsg));
        };

        window.addEventListener('storage', handleStorageError);
        return () => window.removeEventListener('storage', handleStorageError);
    }, [onError]);

    // Handle input text change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        clearResult(); // Clear previous result when input changes
    }, [clearResult]);

    // Handle transformation button click
    const handleTransform = useCallback((type: TransformationType) => {
        if (!inputText.trim()) {
            setInputError('Please enter text to transform');
            return;
        }

        if (inputError) {
            return; // Don't transform if there's an error
        }

        applyTransform(type, inputText);
    }, [inputText, inputError, applyTransform]);

    // Handle copy output
    const handleCopy = useCallback(async () => {
        if (!result?.output) return;

        try {
            await navigator.clipboard.writeText(result.output);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            onError?.(new Error('Failed to copy to clipboard'));
        }
    }, [result?.output, onError]);

    // Handle clear all
    const handleClear = useCallback(() => {
        setInputText('');
        clearResult();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('text-transform-input');
            localStorage.removeItem('text-transform-output');
        }
    }, [clearResult]);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Storage error banner */}
            {storageError && (
                <Alert variant="destructive">
                    {storageError}
                </Alert>
            )}

            {/* Transformation toolbar */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Transformations</label>
                <TransformActions
                    onTransform={handleTransform}
                    disabled={!inputText.trim() || !!inputError}
                    isTransforming={isTransforming}
                />
            </div>

            {/* Input/Output split view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input */}
                <div className="space-y-2">
                    <label htmlFor="transform-input" className="text-sm font-medium">
                        Input
                    </label>
                    <Textarea
                        id="transform-input"
                        value={inputText}
                        onChange={handleInputChange}
                        error={inputError}
                        placeholder="Enter text to transform..."
                        className="min-h-[400px] font-mono text-sm"
                    />
                </div>

                {/* Output */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="transform-output" className="text-sm font-medium">
                            Output
                        </label>
                        {result?.output && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7"
                            >
                                <Copy className="h-3 w-3 mr-1" />
                                {copySuccess ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </div>
                    <Textarea
                        id="transform-output"
                        value={result?.output || ''}
                        readOnly
                        placeholder="Transformed text will appear here..."
                        className="min-h-[400px] font-mono text-sm bg-muted"
                    />
                    {result?.error && (
                        <Alert variant="destructive">
                            {result.error}
                        </Alert>
                    )}
                    {isTransforming && (
                        <div className="text-sm text-muted-foreground">
                            Transforming...
                        </div>
                    )}
                </div>
            </div>

            {/* Clear button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={handleClear}
                    className="gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                </Button>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add components/text-tools/transform-pane/transform-pane.tsx
git commit -m "feat(text-tools): add transform pane component with debounced localStorage persistence"
```

---

## Task 16: Add Diff Viewer CSS Variables

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Add CSS variables for diff viewer colors**

Add to your global CSS file (app/globals.css):

```css
:root {
    /* Diff viewer colors - required for proper theming */
    --diff-added-bg: 144 85% 90%;
    --diff-added-text: 144 70% 25%;
    --diff-removed-bg: 0 85% 90%;
    --diff-removed-text: 0 70% 25%;
    --diff-word-added-bg: 144 85% 85%;
    --diff-word-removed-bg: 0 85% 85%;
    --diff-gutter-added: 144 70% 90%;
    --diff-gutter-removed: 0 70% 90%;
    --diff-gutter: 0 0% 90%;
    --diff-gutter-dark: 0 0% 20%;
    --diff-highlight: 255 255% 50%;
    --diff-highlight-gutter: 255 255% 60%;
    --diff-fold-gutter: 0 0% 85%;
    --diff-fold: 0 0% 90%;
    --diff-empty-line: 0 0% 95%;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style(text-tools): add CSS variables for diff viewer theming"
```

---

## Task 17: Create Main Text Page with Tabs

**Files:**

- Modify: `app/text/page.tsx`

- [ ] **Step 1: Write main text tools page**

```typescript
'use client';

import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toolbar } from '@/components/toolbar/toolbar';
import { TextDiffPane } from '@/components/text-tools/diff-pane/diff-pane';
import { TextTransformPane } from '@/components/text-tools/transform-pane/transform-pane';
import type { TextDiffPaneRef } from '@/components/text-tools/diff-pane/types';
import { GitCompare, Wand2, Trash2 } from 'lucide-react';

export default function TextToolsPage() {
    // Tab state
    const [activeTab, setActiveTab] = useState('diff');

    // Diff tab state
    const [ignoreCase, setIgnoreCase] = useState(false);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [canCompare, setCanCompare] = useState(false);
    const [isComputing, setIsComputing] = useState(false);

    // Transform tab state
    const [canTransform, setCanTransform] = useState(false);

    // Ref for diff pane
    const diffPaneRef = useRef<TextDiffPaneRef>(null);

    // Error handling
    const handleError = (error: Error) => {
        console.error('Text tools error:', error);
        // Could add a toast notification here
    };

    // Handle compare click
    const handleCompareClick = async () => {
        if (!canCompare || !diffPaneRef.current) return;

        setIsComputing(true);
        try {
            await diffPaneRef.current.triggerCompare();
        } catch (error) {
            handleError(error as Error);
        } finally {
            setIsComputing(false);
        }
    };

    // Handle clear all
    const handleClear = () => {
        // Clear appropriate pane based on active tab
        if (activeTab === 'diff' && diffPaneRef.current) {
            diffPaneRef.current.clear();
        } else {
            // For transform tab, reload page
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b">
                    <div className="mx-auto py-4">
                        <TabsList
                            variant="line"
                            className="h-auto p-0 bg-transparent border-0 w-full justify-start"
                        >
                            <div className="flex gap-2">
                                {[
                                    { value: 'diff', label: 'Diff', icon: GitCompare },
                                    { value: 'transform', label: 'Transform', icon: Wand2 },
                                ].map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="gap-2 data-[icon=true]:pr-4"
                                    >
                                        <Icon data-icon="true" className="w-4 h-4" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </div>
                        </TabsList>
                    </div>
                </div>

                {/* Diff Tab */}
                <TabsContent value="diff" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[
                                {
                                    id: 'ignoreCase',
                                    label: 'Ignore Case',
                                    checked: ignoreCase,
                                    onChange: setIgnoreCase,
                                },
                                {
                                    id: 'ignoreWhitespace',
                                    label: 'Ignore Whitespace',
                                    checked: ignoreWhitespace,
                                    onChange: setIgnoreWhitespace,
                                },
                            ]}
                            actions={[
                                {
                                    id: 'compare',
                                    label: isComputing ? 'Computing...' : 'Compare',
                                    onClick: handleCompareClick,
                                    variant: 'default',
                                    disabled: !canCompare || isComputing,
                                },
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <div className="mx-auto">
                            <TextDiffPane
                                ref={diffPaneRef}
                                ignoreCase={ignoreCase}
                                ignoreWhitespace={ignoreWhitespace}
                                onValidationChange={setCanCompare}
                                onError={handleError}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Transform Tab */}
                <TabsContent value="transform" className="mt-0">
                    <div>
                        <Toolbar
                            toggles={[]}
                            actions={[
                                {
                                    id: 'clear',
                                    label: 'Clear All',
                                    onClick: handleClear,
                                    variant: 'outline',
                                    icon: <Trash2 className="h-4 w-4" />,
                                },
                            ]}
                        />

                        <div className="mx-auto">
                            <TextTransformPane
                                onValidationChange={setCanTransform}
                                onError={handleError}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

- [ ] **Step 2: Fix TextDiffPane to support ref forwarding**

Modify `components/text-tools/diff-pane/diff-pane.tsx`:

Replace the export line with:

```typescript
export const TextDiffPane = React.forwardRef<any, TextDiffPaneProps>(({ ... }, ref) => {
    // ... component code

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        triggerCompare: async () => {
            await computeDiff();
        },
        clear: handleClear,
    }));

    // ... rest of component
});
TextDiffPane.displayName = 'TextDiffPane';
```

- [ ] **Step 3: Commit**

```bash
git add app/text/page.tsx components/text-tools/diff-pane/diff-pane.tsx
git commit -m "feat(text-tools): create main text tools page with Diff and Transform tabs"
```

---

## Task 18: Build and Test

- [ ] **Step 1: Build the application**

Run: `pnpm build`

Expected: Successful build with no TypeScript or lint errors

- [ ] **Step 2: Start development server**

Run: `pnpm dev`

Expected: Development server starts successfully

- [ ] **Step 3: Manual testing checklist**

Test in browser at `http://localhost:3000/text`:

**Diff Tab:**

- [ ] Enter text in both left and right panes
- [ ] Verify text is saved to localStorage and persists across page reload
- [ ] Verify Compare button is disabled when inputs are empty
- [ ] Toggle "Ignore Case" and click Compare - verify case differences are ignored
- [ ] Toggle "Ignore Whitespace" and click Compare - verify spacing differences are ignored
- [ ] Verify diff results show correctly with green/red highlighting
- [ ] Click "Clear All" and verify both panes are cleared
- [ ] Test with text > 1MB and verify warning message appears
- [ ] Try entering empty text and verify validation works
- [ ] Check browser DevTools Application > LocalStorage - verify debounced saves (500ms delay)

**Transform Tab:**

- [ ] Enter text in input pane
- [ ] Verify text is saved to localStorage and persists across page reload
- [ ] Test each transformation type:
    - [ ] Case: Uppercase, Lowercase, Title Case, Sentence Case
    - [ ] Encoding: Base64 Encode, Base64 Decode, URL Encode, URL Decode
    - [ ] Whitespace: Trim, Normalize Spaces, Remove Extra Lines
    - [ ] Other: Reverse Text, Shuffle Words
- [ ] Verify output appears in right pane
- [ ] Click "Copy" button and verify text is copied to clipboard
- [ ] Click "Clear All" and verify both panes are cleared
- [ ] Test invalid Base64 decode and verify error message appears in red alert banner
- [ ] Test with text > 1MB and verify warning message appears
- [ ] Try transforming empty text and verify validation works
- [ ] Check browser DevTools Application > LocalStorage - verify debounced saves (500ms delay)

**General:**

- [ ] Switch between Diff and Transform tabs and verify state is preserved
- [ ] Verify responsive design works on mobile viewport
- [ ] Check browser console for no errors or warnings
- [ ] Verify diff viewer colors match app theme

- [ ] **Step 4: Fix any issues found during testing**

Document any issues and fixes

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat(text-tools): complete text tools implementation with Diff and Transform tabs

- Added Diff tab with side-by-side comparison
- Added Transform tab with 13 text transformations
- Implemented debounced localStorage saves (500ms)
- Added error banners for validation and storage errors
- Added Compare button to trigger diff computation
- Added responsive split-view layout for transform tab
- Integrated with existing Tabs and Toolbar components
- Added diff viewer CSS theming variables
```

---

## Testing Notes

**Manual Testing Required:**

- All text transformations should work correctly with edge cases (empty strings, special characters, large texts)
- localStorage persistence should survive page refreshes and browser restarts
- Debounced saves should have ~500ms delay (verify in DevTools Network tab)
- Error messages should display in red alert banners above panes
- Compare button should only enable when both panes have valid input
- Performance should remain acceptable with texts up to 1MB

**Browser Compatibility:**

- Modern browsers (Chrome, Firefox, Safari, Edge) with ES2020+ support
- localStorage API availability
- Clipboard API for copy functionality

**Accessibility:**

- Keyboard navigation for all buttons and textareas
- Proper ARIA labels for transformation buttons
- Error messages are announced to screen readers via role="alert"
- Sufficient color contrast for diff highlighting
