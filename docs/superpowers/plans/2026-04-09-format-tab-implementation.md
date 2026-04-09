# Format Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time JSON formatter with 2-column editor layout, automatic formatting, format options, and copy/download functionality.

**Architecture:** Create a new FormatPane component that manages two JsonEditor instances (left: input, right: read-only output) with real-time debounced formatting. Format options controlled via toolbar with localStorage persistence.

**Tech Stack:** React, TypeScript, Next.js, CodeMirror (via existing JsonEditor), shadcn/ui components

---

## File Structure

**New Files:**

- `components/format-pane/types.ts` - TypeScript interfaces
- `components/format-pane/use-format-json.ts` - Custom formatting hook
- `components/format-pane/format-actions.tsx` - Copy/download buttons
- `components/format-pane/format-pane.tsx` - Main container component

**Modified Files:**

- `app/page.tsx` - Integrate FormatPane into format tab

---

## Task 1: Create TypeScript Interfaces

**Files:**

- Create: `components/format-pane/types.ts`

- [ ] **Step 1: Write the interface file**

```typescript
import type { ParseError } from '../editor-pane/types';

export interface FormatPaneProps {
    indentation?: number;
    sortKeys?: boolean;
    removeTrailingCommas?: boolean;
    escapeUnicode?: boolean;
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    className?: string;
}

export interface FormatOptions {
    indentation: number;
    sortKeys: boolean;
    removeTrailingCommas: boolean;
    escapeUnicode: boolean;
}

export interface FormatResult {
    formatted: string;
    error: ParseError | null;
    isValid: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/format-pane/types.ts
git commit -m "feat(format): add TypeScript interfaces for format pane

Define FormatPaneProps, FormatOptions, and FormatResult interfaces
for the format tab feature."
```

---

## Task 2: Create Custom Formatting Hook

**Files:**

- Create: `components/format-pane/use-format-json.ts`

- [ ] **Step 1: Check if format utilities exist**

```bash
grep -r "formatJson\|minifyJson" components/editor-pane/utils/
```

Expected: Find formatJson, minifyJson functions in utils
If not found: Note that we need to implement format utilities

- [ ] **Step 2: Write the failing test for useFormatJson hook**

```typescript
// In components/format-pane/use-format-json.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFormatJson } from './use-format-json';

test('should format valid JSON', () => {
    const { result } = renderHook(() =>
        useFormatJson('{"a":1,"b":2}', {
            indentation: 2,
            sortKeys: false,
            removeTrailingCommas: false,
            escapeUnicode: false,
        }),
    );

    expect(result.current.formatted).toBe('{\n  "a": 1,\n  "b": 2\n}');
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
});

test('should handle invalid JSON', () => {
    const { result } = renderHook(() =>
        useFormatJson('{"a":1,', {
            indentation: 2,
            sortKeys: false,
            removeTrailingCommas: false,
            escapeUnicode: false,
        }),
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).not.toBeNull();
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- use-format-json.test.ts
```

Expected: FAIL with "useFormatJson not defined"

- [ ] **Step 4: Implement the useFormatJson hook**

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormatOptions, FormatResult } from './types';
import { validateJson } from '../editor-pane/utils/validation';

// Format utilities - will import or implement
const formatJsonWith = (json: string, options: FormatOptions): string => {
    try {
        const parsed = JSON.parse(json);

        // Apply sort keys if enabled
        let formatted = parsed;
        if (options.sortKeys) {
            formatted = sortObjectKeys(formatted);
        }

        // Format with indentation
        const indentStr = ' '.repeat(options.indentation);
        let result = JSON.stringify(formatted, null, indentStr);

        // Apply remove trailing commas if enabled
        if (options.removeTrailingCommas) {
            result = result.replace(/,(\s*[}\]])/g, '$1');
        }

        // Apply escape unicode if enabled
        if (options.escapeUnicode) {
            result = result.replace(
                /[\u007F-\uFFFF]/g,
                (c) => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4),
            );
        }

        return result;
    } catch (error) {
        throw error;
    }
};

const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
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

export const useFormatJson = (json: string, options: FormatOptions): FormatResult => {
    const [result, setResult] = useState<FormatResult>({
        formatted: '',
        error: null,
        isValid: false,
    });

    const optionsRef = useRef(options);
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                if (!json.trim()) {
                    setResult({
                        formatted: '',
                        error: null,
                        isValid: false,
                    });
                    return;
                }

                const validationError = validateJson(json);
                if (validationError) {
                    setResult({
                        formatted: json, // Show original with error
                        error: validationError,
                        isValid: false,
                    });
                    return;
                }

                const formatted = formatJsonWith(json, optionsRef.current);
                setResult({
                    formatted,
                    error: null,
                    isValid: true,
                });
            } catch (error) {
                const parseError = {
                    message: (error as Error).message,
                    line: 1,
                    column: 1,
                };
                setResult({
                    formatted: json,
                    error: parseError,
                    isValid: false,
                });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [json, options]);

    return result;
};
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- use-format-json.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/format-pane/use-format-json.ts components/format-pane/use-format-json.test.ts
git commit -m "feat(format): implement useFormatJson hook with debouncing

Add custom hook for real-time JSON formatting with options support.
Includes 300ms debounce and error handling."
```

---

## Task 3: Create FormatActions Component

**Files:**

- Create: `components/format-pane/format-actions.tsx`

- [ ] **Step 1: Write the FormatActions component**

```typescript
'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface FormatActionsProps {
    formattedContent: string;
    isValid: boolean;
    onCopySuccess?: () => void;
    onDownloadSuccess?: () => void;
    onCopyError?: (error: Error) => void;
    onDownloadError?: (error: Error) => void;
}

export const FormatActions = ({
    formattedContent,
    isValid,
    onCopySuccess,
    onDownloadSuccess,
    onCopyError,
    onDownloadError,
}: FormatActionsProps) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedContent);
            onCopySuccess?.();
        } catch (error) {
            onCopyError?.(error as Error);
        }
    };

    const handleDownload = () => {
        try {
            const blob = new Blob([formattedContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formatted.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            onDownloadSuccess?.();
        } catch (error) {
            onDownloadError?.(error as Error);
        }
    };

    const isDisabled = !isValid || !formattedContent;

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={isDisabled}
                className="gap-2"
            >
                <Copy className="w-4 h-4" />
                Copy
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDisabled}
                className="gap-2"
            >
                <Download className="w-4 h-4" />
                Download
            </Button>
        </div>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add components/format-pane/format-actions.tsx
git commit -m "feat(format): add FormatActions component

Add copy and download buttons for formatted JSON output.
Buttons disabled when content is invalid or empty."
```

---

## Task 4: Create FormatPane Container Component

**Files:**

- Create: `components/format-pane/format-pane.tsx`

- [ ] **Step 1: Write the FormatPane component**

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { FormatActions } from './format-actions';
import { useFormatJson } from './use-format-json';
import type { FormatPaneProps, FormatOptions } from './types';

export const FormatPane = ({
    indentation = 2,
    sortKeys = false,
    removeTrailingCommas = false,
    escapeUnicode = false,
    onError,
    onValidationChange,
    className,
}: FormatPaneProps) => {
    const [leftContent, setLeftContent] = useState('');
    const [leftValid, setLeftValid] = useState(false);

    // Load format options from localStorage on mount
    const [formatOptions, setFormatOptions] = useState<FormatOptions>(() => {
        if (typeof window === 'undefined') {
            return { indentation: indentation || 2, sortKeys, removeTrailingCommas, escapeUnicode };
        }

        try {
            const saved = localStorage.getItem('format-options');
            if (saved) {
                return { ...JSON.parse(saved), indentation: indentation || 2 };
            }
        } catch (error) {
            console.error('Failed to load format options:', error);
        }

        return { indentation: indentation || 2, sortKeys, removeTrailingCommas, escapeUnicode };
    });

    // Save format options to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem('format-options', JSON.stringify(formatOptions));
        } catch (error) {
            console.error('Failed to save format options:', error);
        }
    }, [formatOptions]);

    // Format JSON
    const formatResult = useFormatJson(leftContent, formatOptions);

    // Handle validation changes
    useEffect(() => {
        onValidationChange?.(formatResult.isValid);
    }, [formatResult.isValid, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (formatResult.error) {
            onError?.(new Error(formatResult.error.message));
        }
    }, [formatResult.error, onError]);

    // Handle copy success
    const handleCopySuccess = useCallback(() => {
        // Could show toast notification here
        console.log('Copied to clipboard');
    }, []);

    // Handle download success
    const handleDownloadSuccess = useCallback(() => {
        // Could show toast notification here
        console.log('Downloaded file');
    }, []);

    // Handle copy error
    const handleCopyError = useCallback((error: Error) => {
        console.error('Failed to copy:', error);
        onError?.(error);
    }, [onError]);

    // Handle download error
    const handleDownloadError = useCallback((error: Error) => {
        console.error('Failed to download:', error);
        onError?.(error);
    }, [onError]);

    return (
        <div className={className}>
            {/* Format Actions Toolbar */}
            <div className="flex items-center justify-between mb-4 px-4">
                <div className="text-sm text-muted-foreground">
                    Format Options: {formatOptions.indentation} spaces
                    {formatOptions.sortKeys && ', Sort Keys'}
                    {formatOptions.removeTrailingCommas && ', No Trailing Commas'}
                    {formatOptions.escapeUnicode && ', Escape Unicode'}
                </div>
                <FormatActions
                    formattedContent={formatResult.formatted}
                    isValid={formatResult.isValid}
                    onCopySuccess={handleCopySuccess}
                    onDownloadSuccess={handleDownloadSuccess}
                    onCopyError={handleCopyError}
                    onDownloadError={handleDownloadError}
                />
            </div>

            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <JsonEditor
                        label="Unformatted JSON"
                        value={leftContent}
                        onChange={setLeftContent}
                        onError={(error) => {
                            setLeftValid(error === null && leftContent.trim().length > 0);
                        }}
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2">
                    <JsonEditor
                        label="Formatted JSON"
                        value={formatResult.formatted}
                        onChange={() => {}}
                        onError={() => {}}
                        readOnly={true}
                    />
                </div>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Export from index**

```typescript
// In components/format-pane/index.ts
export { FormatPane } from './format-pane';
export type { FormatPaneProps, FormatOptions, FormatResult } from './types';
```

- [ ] **Step 3: Commit**

```bash
git add components/format-pane/format-pane.tsx components/format-pane/index.ts
git commit -m "feat(format): implement FormatPane container component

Add main FormatPane component with two-column editor layout.
Supports real-time formatting, format options with localStorage
persistence, and error handling."
```

---

## Task 5: Integrate FormatPane into App Page

**Files:**

- Modify: `app/page.tsx`

- [ ] **Step 1: Add format option state**

Add state variables after line 13 (after `semanticTypeDiff` state):

```typescript
const [formatIndentation, setFormatIndentation] = useState(2);
const [formatSortKeys, setFormatSortKeys] = useState(false);
const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);
const [canFormat, setCanFormat] = useState(false);
```

- [ ] **Step 2: Add import for FormatPane**

Add import after line 5:

```typescript
import { FormatPane } from '@/components/format-pane';
```

- [ ] **Step 3: Replace format tab placeholder content**

Replace lines 176-193 (the entire TabsContent for "format") with:

```typescript
<TabsContent value="format" className="mt-0">
    <div>
        <Toolbar
            toggles={[
                {
                    id: 'indentation',
                    label: 'Indentation',
                    checked: formatIndentation === 4,
                    onChange: () => setFormatIndentation(formatIndentation === 2 ? 4 : 2),
                },
                {
                    id: 'sortKeys',
                    label: 'Sort Keys',
                    checked: formatSortKeys,
                    onChange: setFormatSortKeys,
                },
                {
                    id: 'removeTrailingCommas',
                    label: 'Remove Trailing Commas',
                    checked: formatRemoveTrailingCommas,
                    onChange: setFormatRemoveTrailingCommas,
                },
                {
                    id: 'escapeUnicode',
                    label: 'Escape Unicode',
                    checked: formatEscapeUnicode,
                    onChange: setFormatEscapeUnicode,
                },
            ]}
            actions={[
                {
                    id: 'clear',
                    label: 'Clear All',
                    onClick: handleClear,
                    variant: 'outline',
                },
            ]}
        />

        <div className="mx-auto">
            <FormatPane
                indentation={formatIndentation}
                sortKeys={formatSortKeys}
                removeTrailingCommas={formatRemoveTrailingCommas}
                escapeUnicode={formatEscapeUnicode}
                onError={handleError}
                onValidationChange={setCanFormat}
            />
        </div>
    </div>
</TabsContent>
```

- [ ] **Step 4: Test the format tab**

```bash
npm run dev
```

Navigate to http://localhost:3000, click "Format" tab, and verify:

- Two editors display side-by-side
- Toolbar controls work
- Typing in left editor updates right editor
- Copy and download buttons work

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat(format): integrate FormatPane into format tab

Replace placeholder content with functional FormatPane component.
Add toolbar controls for format options and state management."
```

---

## Task 6: Verify Existing Utilities

**Files:**

- Check: `components/editor-pane/utils/json-operations.ts`
- Check: `components/editor-pane/utils/validation.ts`

- [ ] **Step 1: Verify format utilities exist**

```bash
cat components/editor-pane/utils/json-operations.ts | grep -A 5 "export.*formatJson"
```

Expected: Find formatJson export

If formatJson exists: Update use-format-json.ts to import it
If formatJson doesn't exist: The implementation in Task 2 handles it

- [ ] **Step 2: Verify validation utilities exist**

```bash
cat components/editor-pane/utils/validation.ts | grep -A 5 "export.*validateJson"
```

Expected: Find validateJson export

- [ ] **Step 3: Update imports if needed**

If utilities exist, update use-format-json.ts line 4:

```typescript
import { validateJson } from '../editor-pane/utils/validation';
```

- [ ] **Step 4: Test build**

```bash
npm run build
```

Expected: Build succeeds without errors

- [ ] **Step 5: Commit any updates**

```bash
git add components/format-pane/use-format-json.ts
git commit -m "fix(format): update imports to use existing utilities

Import formatJson and validateJson from editor-pane utils
instead of duplicating implementations."
```

---

## Task 7: Add Toast Notifications (Optional Enhancement)

**Files:**

- Modify: `components/format-pane/format-pane.tsx`
- Modify: `components/format-pane/format-actions.tsx`

- [ ] **Step 1: Check if toast component exists**

```bash
find components -name "*toast*" -o -name "*toast*" -o -name "*sonner*" 2>/dev/null
```

If toast component exists: Add toast notifications
If not: Skip this task or add toast library

- [ ] **Step 2: Add toast to FormatActions**

If toast component exists, update format-actions.tsx to show success/error toasts

- [ ] **Step 3: Test toast notifications**

Verify copy and download show appropriate feedback

- [ ] **Step 4: Commit**

```bash
git add components/format-pane/format-actions.tsx
git commit -m "feat(format): add toast notifications for copy/download

Show success/error toasts when copying to clipboard or
downloading formatted JSON."
```

---

## Task 8: Responsive Layout Testing

**Files:**

- No changes needed

- [ ] **Step 1: Test mobile layout**

```bash
npm run dev
```

Open browser DevTools, enable mobile view (iPhone SE size):

- Verify editors stack vertically
- Verify toolbar controls are accessible
- Verify separator changes from vertical to horizontal

- [ ] **Step 2: Test tablet layout**

Set viewport to iPad size (768px):

- Verify editors are side-by-side
- Verify layout is responsive

- [ ] **Step 3: Test desktop layout**

Set viewport to 1920px:

- Verify editors are side-by-side with proper spacing
- Verify toolbar is centered

- [ ] **Step 4: Add responsive fixes if needed**

If issues found, add CSS fixes to format-pane.tsx

- [ ] **Step 5: Commit any fixes**

```bash
git add components/format-pane/format-pane.tsx
git commit -m "fix(format): improve responsive layout

Add CSS fixes for mobile, tablet, and desktop layouts."
```

---

## Task 9: Accessibility Testing

**Files:**

- No changes needed

- [ ] **Step 1: Test keyboard navigation**

- Tab to toolbar controls
- Use Enter/Space to toggle switches
- Verify focus indicators are visible

- [ ] **Step 2: Test screen reader compatibility**

Enable screen reader (VoiceOver/NVDA):

- Verify editor labels are announced
- Verify toolbar controls are properly labeled
- Verify error messages are announced

- [ ] **Step 3: Add ARIA labels if needed**

If issues found, add appropriate ARIA labels

- [ ] **Step 4: Commit any fixes**

```bash
git add components/format-pane/
git commit -m "fix(format): improve accessibility

Add ARIA labels and improve keyboard navigation."
```

---

## Task 10: Performance Testing

**Files:**

- No changes needed

- [ ] **Step 1: Test with large JSON**

Create test file with 1MB JSON:

- Paste into left editor
- Verify debounce prevents lag
- Verify right editor updates smoothly
- Verify loading indicator appears (if implemented)

- [ ] **Step 2: Test with deeply nested objects**

Create deeply nested JSON (10+ levels):

- Verify formatting completes
- Verify no stack overflow errors

- [ ] **Step 3: Test with special characters**

Create JSON with Unicode, emojis, escape sequences:

- Verify characters display correctly
- Verify escape unicode option works

- [ ] **Step 4: Add performance optimizations if needed**

If issues found, add optimizations (memoization, web workers, etc.)

- [ ] **Step 5: Commit any optimizations**

```bash
git add components/format-pane/
git commit -m "perf(format): optimize for large JSON files

Add performance optimizations for formatting large JSON
documents and deeply nested objects."
```

---

## Task 11: Final Integration Testing

**Files:**

- No changes needed

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 2: Build production version**

```bash
npm run build
```

Expected: Build succeeds without errors

- [ ] **Step 3: Test in production mode**

```bash
npm run start
```

Test all features in production build

- [ ] **Step 4: Verify localStorage persistence**

- Change format options
- Refresh page
- Verify options are restored

- [ ] **Step 5: Create test report**

Document any issues found and fixes applied

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "test(format): complete integration testing

All features tested and working. Format tab is production-ready."
```

---

## Success Criteria Verification

- [ ] Users can paste unformatted JSON in left editor
- [ ] Right editor shows formatted version in real-time
- [ ] Invalid JSON shows clear error messages
- [ ] Format options work correctly (indentation, sort keys, etc.)
- [ ] Copy and download functionality works
- [ ] Responsive layout works on mobile and desktop
- [ ] No performance issues with large JSON files
- [ ] localStorage persists user preferences

---

## Testing Checklist

- [ ] Unit tests for useFormatJson hook
- [ ] Integration tests for FormatPane component
- [ ] Format options apply correctly
- [ ] Error handling for invalid JSON
- [ ] Copy/download functionality
- [ ] localStorage persistence
- [ ] Responsive layout (mobile/tablet/desktop)
- [ ] Accessibility (keyboard, screen reader)
- [ ] Performance with large files
- [ ] Edge cases (empty, minified, already formatted)

---

## Notes

- **TDD Approach:** Each task follows test-first development where applicable
- **Frequent Commits:** Each task commits independently for easy rollback
- **DRY Principle:** Reuses existing JsonEditor, Toolbar, and utility functions
- **YAGNI Principle:** Only implements features specified in design
- **Error Handling:** Comprehensive error handling at every layer
- **Performance:** Debounced formatting prevents excessive re-renders
- **Accessibility:** WCAG compliant with keyboard navigation and ARIA labels
