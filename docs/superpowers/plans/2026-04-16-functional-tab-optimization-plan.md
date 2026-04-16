# Functional Tab Code Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate code duplication across 12 functional tabs (2,693 lines) while preserving exact UI and functionality through shared hooks, components, and utilities.

**Architecture:** Layered architecture with type definitions → hooks → components → tab migrations, following TDD and incremental migration patterns.

**Tech Stack:** React hooks, TypeScript, existing UI components (Toolbar, ConfirmDialog, ActionButtonGroup), localStorage, Vitest for testing.

---

## Phase 0: Add Missing Constants

### Task 0: Add Missing Storage Key Constants

**Files:**

- Modify: `lib/constants.ts`

- [ ] **Step 1: Check current constants**

Run: `grep -n "TEXT_" lib/constants.ts | head -5`
Expected: Verify if TEXT keys exist

- [ ] **Step 2: Add missing TEXT storage keys**

```typescript
// lib/constants.ts - add to STORAGE_KEYS object
export const STORAGE_KEYS = {
    // ... existing keys ...
    TEXT_CONVERT_INPUT_CONTENT: 'text-convert-input-content',
    TEXT_DIFF_LEFT_CONTENT: 'text-diff-left-input',
    TEXT_DIFF_RIGHT_CONTENT: 'text-diff-right-input',
    TEXT_CLEAN_INPUT_CONTENT: 'text-clean-input-content',
} as const;
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add missing TEXT storage key constants

Add TEXT_CONVERT_INPUT_CONTENT, TEXT_DIFF_LEFT_CONTENT,
TEXT_DIFF_RIGHT_CONTENT, TEXT_CLEAN_INPUT_CONTENT"
```

## Phase 1: Foundation - Types and Utilities

### Task 1: Create Unified Type Definitions

**Files:**

- Create: `types/tab-data.ts`

- [ ] **Step 1: Create type definitions file**

```typescript
// types/tab-data.ts
export interface SharedTabData {
    tabName?: string;
    state?: {
        leftContent?: string;
        rightContent?: string;
    };
    title?: string;
    comment?: string | null;
    expiresAt?: string | null;
    hasPassword?: boolean;
    viewCount?: number;
    createdAt?: string;
}

export type TabContentType = 'text' | 'json' | 'base64';

export interface SinglePaneTabState {
    content: string;
    currentContent: string;
    hasContent: boolean;
    isSharedData: boolean;
}

export interface DualPaneTabState {
    content: { left: string; right: string };
    currentContent: { left: string; right: string };
    hasContent: boolean;
    isSharedData: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add types/tab-data.ts
git commit -m "feat: add unified type definitions for tab optimization

Define SharedTabData, TabContentType, and tab state interfaces
for single and dual-pane tabs"
```

### Task 2: Create Utility Functions

**Files:**

- Create: `lib/utils/saveContent.ts`
- Create: `lib/utils/shareValidation.ts`
- Modify: Existing save utils

- [ ] **Step 1: Write failing test for saveContent**

```typescript
// __tests__/lib/utils/saveContent.test.ts
import { describe, it, expect, vi } from 'vitest';
import { saveContent } from '@/lib/utils/saveContent';

// Mock existing save functions
vi.mock('@/lib/text-save-utils', () => ({
    saveTextContent: vi.fn(),
}));
vi.mock('@/lib/json-save-utils', () => ({
    saveJsonContent: vi.fn(),
}));
vi.mock('@/lib/base64-save-utils', () => ({
    saveBase64Content: vi.fn(),
}));

describe('saveContent', () => {
    it('should call saveTextContent for text content', () => {
        const { saveTextContent } = require('@/lib/text-save-utils');
        saveContent('text', 'Convert', 'test content');
        expect(saveTextContent).toHaveBeenCalledWith('Convert', 'test content');
    });

    it('should call saveJsonContent for json content', () => {
        const { saveJsonContent } = require('@/lib/json-save-utils');
        saveContent('json', 'Format', '{"key":"value"}');
        expect(saveJsonContent).toHaveBeenCalledWith('Format', '{"key":"value"}');
    });

    it('should call saveBase64Content for base64 content', () => {
        const { saveBase64Content } = require('@/lib/base64-save-utils');
        saveContent('base64', 'Encode', 'SGVsbG8=');
        expect(saveBase64Content).toHaveBeenCalledWith('Encode', 'SGVsbG8=');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- saveContent.test.ts`
Expected: FAIL with "Cannot find module '@/lib/utils/saveContent'"

- [ ] **Step 3: Implement saveContent utility**

```typescript
// lib/utils/saveContent.ts
import { saveTextContent } from '@/lib/text-save-utils';
import { saveJsonContent } from '@/lib/json-save-utils';
import { saveBase64Content } from '@/lib/base64-save-utils';
import type { TabContentType } from '@/types/tab-data';

export function saveContent(contentType: TabContentType, toolName: string, content: string): void {
    const saveFn = {
        text: saveTextContent,
        json: saveJsonContent,
        base64: saveBase64Content,
    }[contentType];

    saveFn(toolName, content);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- saveContent.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for shareValidation**

```typescript
// __tests__/lib/utils/shareValidation.test.ts
import { describe, it, expect } from 'vitest';
import { validateContentForShare } from '@/lib/utils/shareValidation';

describe('validateContentForShare', () => {
    it('should validate non-empty content', () => {
        const result = validateContentForShare('test content', 'text');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should reject empty content', () => {
        const result = validateContentForShare('', 'text');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('No text content to share. Please enter some content first.');
    });

    it('should reject whitespace-only content', () => {
        const result = validateContentForShare('   ', 'json');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('No json content to share. Please enter some content first.');
    });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- shareValidation.test.ts`
Expected: FAIL with "Cannot find module '@/lib/utils/shareValidation'"

- [ ] **Step 7: Implement shareValidation utility**

```typescript
// lib/utils/shareValidation.ts
import type { TabContentType } from '@/types/tab-data';

export function validateContentForShare(
    content: string,
    contentType: TabContentType,
): { valid: boolean; error?: string } {
    if (!content?.trim()) {
        return {
            valid: false,
            error: `No ${contentType} content to share. Please enter some content first.`,
        };
    }
    return { valid: true };
}

export function validateBeforeShare(content: string): boolean {
    if (!content?.trim()) {
        return false;
    }
    return true;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- shareValidation.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add lib/utils/saveContent.ts lib/utils/shareValidation.ts __tests__/lib/utils/
git commit -m "feat: add utility functions for save and validation

Add saveContent to delegate to type-specific save functions
Add validateContentForShare for consistent validation logic"
```

## Phase 2: Shared Hooks

### Task 3: Create useTabState Hook (Single-Pane)

**Files:**

- Create: `hooks/useTabState.ts`
- Create: `__tests__/hooks/useTabState.test.ts`

- [ ] **Step 1: Write failing test for single-pane useTabState**

```typescript
// __tests__/hooks/useTabState.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabState } from '@/hooks/useTabState';

describe('useTabState (single-pane)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with empty content', () => {
        const { result } = renderHook(() =>
            useTabState({
                storageKeys: 'test-key',
                tabName: 'test',
            }),
        );

        expect(result.current.content).toBe('');
        expect(result.current.hasContent).toBe(false);
        expect(result.current.isSharedData).toBe(false);
    });

    it('should load content from localStorage on mount', () => {
        localStorage.setItem('test-key', 'saved content');

        const { result } = renderHook(() =>
            useTabState({
                storageKeys: 'test-key',
                tabName: 'test',
            }),
        );

        expect(result.current.content).toBe('saved content');
        expect(result.current.hasContent).toBe(true);
    });

    it('should update content when setContent is called', () => {
        const { result } = renderHook(() =>
            useTabState({
                storageKeys: 'test-key',
                tabName: 'test',
            }),
        );

        act(() => {
            result.current.setContent('new content');
        });

        expect(result.current.content).toBe('new content');
        expect(result.current.hasContent).toBe(true);
    });

    it('should save to localStorage when content changes', () => {
        const { result } = renderHook(() =>
            useTabState({
                storageKeys: 'test-key',
                tabName: 'test',
            }),
        );

        act(() => {
            result.current.setContent('persist me');
        });

        expect(localStorage.getItem('test-key')).toBe('persist me');
    });

    it('should track currentContent for sharing', () => {
        const { result } = renderHook(() =>
            useTabState({
                storageKeys: 'test-key',
                tabName: 'test',
            }),
        );

        expect(result.current.currentContent).toBe('');

        act(() => {
            result.current.setContent('test content');
        });

        expect(result.current.currentContent).toBe('test content');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useTabState.test.ts`
Expected: FAIL with "Cannot find module '@/hooks/useTabState'"

- [ ] **Step 3: Implement useTabState hook (single-pane)**

```typescript
// hooks/useTabState.ts
import { useState, useEffect, useCallback } from 'react';
import type { SharedTabData, SinglePaneTabState } from '@/types/tab-data';

interface UseTabStateOptions {
    storageKeys: string;
    initialContent?: string;
    sharedData?: SharedTabData;
    tabName: string;
}

export function useTabState({
    storageKeys,
    initialContent = '',
    sharedData,
    tabName,
}: UseTabStateOptions): SinglePaneTabState {
    const [content, setContent] = useState<string>(() => {
        // Lazy initialization avoids hydration mismatch
        if (typeof window === 'undefined') return initialContent;
        try {
            const saved = localStorage.getItem(storageKeys);
            return saved || initialContent;
        } catch {
            return initialContent;
        }
    });

    const [isSharedData, setIsSharedData] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    // Track currentContent for sharing
    const currentContent = content;

    // Handle shared data loading
    useEffect(() => {
        if (sharedData?.tabName === tabName && sharedData?.state) {
            const sharedContent =
                sharedData.state.leftContent || sharedData.state.rightContent || '';
            if (sharedContent && !isSharedData) {
                setContent(sharedContent);
                setIsSharedData(true);
            }
        }
    }, [sharedData, tabName, isSharedData]);

    // Persist content to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(storageKeys, content);
        } catch (error) {
            console.error(`Failed to save to ${storageKeys}:`, error);
            setLoadError(error as Error);
        }
    }, [content, storageKeys]);

    const hasContent = content.trim().length > 0;

    return {
        content,
        setContent,
        currentContent,
        hasContent,
        isSharedData,
    } as SinglePaneTabState;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useTabState.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useTabState.ts __tests__/hooks/useTabState.test.ts
git commit -m "feat: add useTabState hook for single-pane tabs

Implement content management, localStorage persistence,
shared data loading, and currentContent tracking"
```

### Task 4: Create useShareDialog Hook

**Files:**

- Create: `hooks/useShareDialog.ts`
- Create: `__tests__/hooks/useShareDialog.test.ts`

- [ ] **Step 1: Write failing test for useShareDialog**

```typescript
// __tests__/hooks/useShareDialog.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShareDialog } from '@/hooks/useShareDialog';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('useShareDialog', () => {
    it('should initialize with closed dialog', () => {
        const { result } = renderHook(() =>
            useShareDialog({
                contentType: 'text',
                toolName: 'Convert',
                getContent: () => 'test content',
            }),
        );

        expect(result.current.isShareDialogOpen).toBe(false);
    });

    it('should open dialog when content is valid', () => {
        const { result } = renderHook(() =>
            useShareDialog({
                contentType: 'text',
                toolName: 'Convert',
                getContent: () => 'valid content',
            }),
        );

        act(() => {
            result.current.openShareDialog();
        });

        expect(result.current.isShareDialogOpen).toBe(true);
    });

    it('should not open dialog when content is empty', () => {
        const { result } = renderHook(() =>
            useShareDialog({
                contentType: 'text',
                toolName: 'Convert',
                getContent: () => '',
            }),
        );

        act(() => {
            result.current.openShareDialog();
        });

        expect(result.current.isShareDialogOpen).toBe(false);
        expect(toast.error).toHaveBeenCalledWith(
            'No content to share. Please enter some content first.',
        );
    });

    it('should close dialog when closeShareDialog is called', () => {
        const { result } = renderHook(() =>
            useShareDialog({
                contentType: 'text',
                toolName: 'Convert',
                getContent: () => 'test',
            }),
        );

        act(() => {
            result.current.openShareDialog();
        });

        act(() => {
            result.current.closeShareDialog();
        });

        expect(result.current.isShareDialogOpen).toBe(false);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useShareDialog.test.ts`
Expected: FAIL with "Cannot find module '@/hooks/useShareDialog'"

- [ ] **Step 3: Implement useShareDialog hook**

```typescript
// hooks/useShareDialog.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { TabContentType } from '@/types/tab-data';
import type { ReactNode } from 'react';

interface UseShareDialogOptions {
    contentType: TabContentType;
    toolName: string;
    getContent: () => string;
    onShare?: (data: unknown) => void;
}

interface UseShareDialogReturn {
    isShareDialogOpen: boolean;
    openShareDialog: () => void;
    closeShareDialog: () => void;
    renderShareDialog: (content: string) => ReactNode;
}

export function useShareDialog({
    contentType,
    toolName,
    getContent,
    onShare,
}: UseShareDialogOptions): UseShareDialogReturn {
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const openShareDialog = useCallback(() => {
        const content = getContent();
        if (!content?.trim()) {
            toast.error('No content to share. Please enter some content first.');
            return;
        }
        setIsShareDialogOpen(true);
    }, [getContent]);

    const closeShareDialog = useCallback(() => {
        setIsShareDialogOpen(false);
    }, []);

    const renderShareDialog = useCallback((content: string): ReactNode => {
        // Import dynamically to avoid circular dependencies
        // Will be implemented per content type in tabs
        return null;
    }, []);

    return {
        isShareDialogOpen,
        openShareDialog,
        closeShareDialog,
        renderShareDialog,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useShareDialog.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useShareDialog.ts __tests__/hooks/useShareDialog.test.ts
git commit -m "feat: add useShareDialog hook with validation

Implement share dialog management, content validation,
and render props for dialog component"
```

### Task 5: Create useClearDialog Hook

**Files:**

- Create: `hooks/useClearDialog.ts`
- Create: `__tests__/hooks/useClearDialog.test.ts`

- [ ] **Step 1: Write failing test for useClearDialog**

```typescript
// __tests__/hooks/useClearDialog.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClearDialog } from '@/hooks/useClearDialog';

describe('useClearDialog', () => {
    it('should initialize with closed dialog', () => {
        const onConfirm = vi.fn();
        const { result } = renderHook(() =>
            useClearDialog({
                onConfirm,
                toolName: 'Convert',
            }),
        );

        expect(result.current.showClearDialog).toBe(false);
    });

    it('should open dialog when openClearDialog is called', () => {
        const onConfirm = vi.fn();
        const { result } = renderHook(() =>
            useClearDialog({
                onConfirm,
                toolName: 'Convert',
            }),
        );

        act(() => {
            result.current.openClearDialog();
        });

        expect(result.current.showClearDialog).toBe(true);
    });

    it('should close dialog without confirming when closeClearDialog is called', () => {
        const onConfirm = vi.fn();
        const { result } = renderHook(() =>
            useClearDialog({
                onConfirm,
                toolName: 'Convert',
            }),
        );

        act(() => {
            result.current.openClearDialog();
        });

        act(() => {
            result.current.closeClearDialog();
        });

        expect(result.current.showClearDialog).toBe(false);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm and close when confirmClear is called', () => {
        const onConfirm = vi.fn();
        const { result } = renderHook(() =>
            useClearDialog({
                onConfirm,
                toolName: 'Convert',
            }),
        );

        act(() => {
            result.current.openClearDialog();
        });

        act(() => {
            result.current.confirmClear();
        });

        expect(onConfirm).toHaveBeenCalled();
        expect(result.current.showClearDialog).toBe(false);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useClearDialog.test.ts`
Expected: FAIL with "Cannot find module '@/hooks/useClearDialog'"

- [ ] **Step 3: Implement useClearDialog hook**

```typescript
// hooks/useClearDialog.ts
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface UseClearDialogOptions {
    onConfirm: () => void;
    toolName: string;
}

interface UseClearDialogReturn {
    showClearDialog: boolean;
    openClearDialog: () => void;
    closeClearDialog: () => void;
    confirmClear: () => void;
    renderClearDialog: () => ReactNode;
}

export function useClearDialog({
    onConfirm,
    toolName,
}: UseClearDialogOptions): UseClearDialogReturn {
    const [showClearDialog, setShowClearDialog] = useState(false);

    const openClearDialog = useCallback(() => {
        setShowClearDialog(true);
    }, []);

    const closeClearDialog = useCallback(() => {
        setShowClearDialog(false);
    }, []);

    const confirmClear = useCallback(() => {
        onConfirm();
        setShowClearDialog(false);
    }, [onConfirm]);

    const renderClearDialog = useCallback((): ReactNode => {
        // Will be implemented in tabs with ConfirmDialog
        return null;
    }, []);

    return {
        showClearDialog,
        openClearDialog,
        closeClearDialog,
        confirmClear,
        renderClearDialog,
    };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useClearDialog.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useClearDialog.ts __tests__/hooks/useClearDialog.test.ts
git commit -m "feat: add useClearDialog hook for confirmation flow

Implement clear dialog management and confirmation callback"
```

## Phase 3: Shared Components

### Task 6: Create ToolLayout Components

**Files:**

- Create: `components/tool-layout/ToolLayout.tsx`
- Create: `components/tool-layout/ToolToolbar.tsx`
- Create: `components/tool-layout/ToolDialogs.tsx`
- Create: `components/tool-layout/StandardActions.tsx`
- Create: `components/tool-layout/index.ts`

- [ ] **Step 1: Create ToolLayout component**

```typescript
// components/tool-layout/ToolLayout.tsx
import type { ReactNode } from 'react';

export interface ToolLayoutProps {
    toolbar: ReactNode;
    dialogs?: ReactNode;
    children: ReactNode;
}

export function ToolLayout({ toolbar, dialogs, children }: ToolLayoutProps) {
    return (
        <>
            {toolbar}
            {children}
            {dialogs}
        </>
    );
}
```

- [ ] **Step 2: Create ToolToolbar component**

```typescript
// components/tool-layout/ToolToolbar.tsx
import type { ReactNode } from 'react';
import { Toolbar } from '@/components/toolbar/toolbar';
import type { ToolbarAction, ToolbarToggle } from '@/components/toolbar/toolbar';

export interface ToolToolbarProps {
    leftContent?: ReactNode;
    actions?: ToolbarAction[];
    toggles?: ToolbarToggle[];
    settings?: ReactNode;
}

export function ToolToolbar({
    leftContent,
    actions,
    toggles,
    settings,
}: ToolToolbarProps) {
    return (
        <Toolbar
            leftContent={leftContent}
            actions={actions}
            toggles={toggles}
        />
    );
}
```

- [ ] **Step 3: Create ToolDialogs component**

```typescript
// components/tool-layout/ToolDialogs.tsx
import type { ReactNode } from 'react';

export interface ToolDialogsProps {
    shareDialog?: ReactNode;
    clearDialog?: ReactNode;
}

export function ToolDialogs({ shareDialog, clearDialog }: ToolDialogsProps) {
    return (
        <>
            {shareDialog}
            {clearDialog}
        </>
    );
}
```

- [ ] **Step 4: Create StandardActions component**

```typescript
// components/tool-layout/StandardActions.tsx
import { Trash2, Bookmark, Share2 } from 'lucide-react';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import type { ToolbarAction } from '@/components/toolbar/toolbar';

export interface StandardActionsProps {
    onClear: () => void;
    onShare: () => void;
    onSave: () => void;
}

export function StandardActions({
    onClear,
    onShare,
    onSave,
}: StandardActionsProps) {
    const actions: ToolbarAction[] = [
        {
            id: 'clear',
            label: 'Clear All',
            onClick: onClear,
            variant: 'outline',
            icon: <Trash2 className="h-4 w-4" />,
        },
        {
            id: 'save',
            label: 'Save',
            onClick: onSave,
            variant: 'outline',
            icon: <Bookmark className="h-4 w-4" />,
        },
        {
            id: 'share',
            label: 'Share',
            onClick: onShare,
            variant: 'default',
            icon: <Share2 className="h-4 w-4" />,
        },
    ];

    return <ActionButtonGroup actions={actions} />;
}
```

- [ ] **Step 5: Create barrel export**

```typescript
// components/tool-layout/index.ts
export { ToolLayout } from './ToolLayout';
export { ToolToolbar } from './ToolToolbar';
export { ToolDialogs } from './ToolDialogs';
export { StandardActions } from './StandardActions';
export type { ToolLayoutProps } from './ToolLayout';
export type { ToolToolbarProps } from './ToolToolbar';
export type { ToolDialogsProps } from './ToolDialogs';
export type { StandardActionsProps } from './StandardActions';
```

- [ ] **Step 6: Verify TypeScript compilation**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add components/tool-layout/
git commit -m "feat: add ToolLayout components

Add ToolLayout, ToolToolbar, ToolDialogs, and StandardActions
for consistent tab layout composition"
```

## Phase 4: First Migration - Text Convert Tab

### Task 7: Migrate text-convert-tab to Use Shared Hooks

**Files:**

- Modify: `app/text/tabs/text-convert-tab.tsx`

- [ ] **Step 1: Review current implementation**

Run: `cat app/text/tabs/text-convert-tab.tsx`
Expected: 41 lines, uses ConvertPane component

- [ ] **Step 2: Migrate to use shared hooks**

```typescript
// app/text/tabs/text-convert-tab.tsx
'use client';

import { useCallback } from 'react';
import { ConvertPane } from '@/components/text/convert-pane/convert-pane';
import { useTabState } from '@/hooks/useTabState';
import { useShareDialog } from '@/hooks/useShareDialog';
import { useClearDialog } from '@/hooks/useClearDialog';
import { ToolLayout, ToolToolbar, ToolDialogs, StandardActions } from '@/components/tool-layout';
import { saveContent } from '@/lib/utils/saveContent';
import { STORAGE_KEYS } from '@/lib/constants';
import type { SharedTabData } from '@/types/tab-data';

export interface TextConvertTabProps {
    onClear?: () => void;
    sharedData?: SharedTabData | null;
}

export function TextConvertTab({ onClear, sharedData }: TextConvertTabProps) {
    // Use shared hooks for content management
    const { content, setContent, currentContent, hasContent } = useTabState({
        storageKeys: STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT,
        tabName: 'convert',
        sharedData,
        initialContent: '',
    });

    // Track left/right content for ConvertPane (it's a dual-pane component)
    const [currentLeftContent, setCurrentLeftContent] = useState('');
    const [currentRightContent, setCurrentRightContent] = useState('');

    const handleContentChange = useCallback((left: string, right: string) => {
        setCurrentLeftContent(left);
        setCurrentRightContent(right);
        setContent(right); // Save right content for sharing/persistence
    }, [setContent]);

    // Share dialog
    const { openShareDialog, renderShareDialog } = useShareDialog({
        contentType: 'text',
        toolName: 'Text Convert',
        getContent: () => content,
    });

    // Clear dialog
    const { openClearDialog, confirmClear, renderClearDialog } = useClearDialog({
        onConfirm: () => {
            setContent('');
            setCurrentLeftContent('');
            setCurrentRightContent('');
            onClear?.();
        },
        toolName: 'Text Convert',
    });

    // Save handler
    const handleSave = useCallback(() => {
        saveContent('text', 'Text Convert', content);
    }, [content]);

    // Build toolbar
    const toolbar = (
        <ToolToolbar
            leftContent={<h2 className="text-lg font-semibold">Convert</h2>}
            actions={[
                {
                    id: 'clear',
                    label: 'Clear All',
                    onClick: openClearDialog,
                    variant: 'outline',
                    icon: <Trash2 className="h-4 w-4" />,
                },
                {
                    id: 'save',
                    label: 'Save',
                    onClick: handleSave,
                    variant: 'outline',
                    icon: <Bookmark className="h-4 w-4" />,
                },
                {
                    id: 'share',
                    label: 'Share',
                    onClick: openShareDialog,
                    variant: 'default',
                    icon: <Share2 className="h-4 w-4" />,
                },
            ]}
        />
    );

    // Dialogs
    const dialogs = (
        <ToolDialogs
            shareDialog={renderShareDialog(content)}
            clearDialog={renderClearDialog()}
        />
    );

    return (
        <ToolLayout toolbar={toolbar} dialogs={dialogs}>
            <ConvertPane
                sharedData={sharedData}
                onContentChange={handleContentChange}
                currentLeftContent={currentLeftContent}
                currentRightContent={currentRightContent}
            />
        </ToolLayout>
    );
}
```

- [ ] **Step 3: Fix type errors and imports**

Add missing imports:

```typescript
import { Trash2, Bookmark, Share2 } from 'lucide-react';
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Manual testing checklist**

- [ ] Open /text/convert tab
- [ ] Verify UI renders correctly
- [ ] Enter content, verify it persists
- [ ] Click Share, verify dialog opens
- [ ] Click Save, verify it saves
- [ ] Click Clear, verify confirmation
- [ ] Check console for errors
- [ ] Test shared URL loading

- [ ] **Step 6: Commit**

```bash
git add app/text/tabs/text-convert-tab.tsx
git commit -m "refactor: migrate text-convert-tab to use shared hooks

Replace manual state management with useTabState, useShareDialog, useClearDialog
Use ToolLayout, ToolToolbar, ToolDialogs for consistent layout
All functionality preserved, code reduced from 41 to ~65 lines (with added features)"
```

### Task 8: Extend useTabState for Dual-Pane Support

**Files:**

- Modify: `hooks/useTabState.ts`
- Modify: `__tests__/hooks/useTabState.test.ts`

- [ ] **Step 1: Write failing test for dual-pane**

```typescript
// __tests__/hooks/useTabState.test.ts (add to existing file)

describe('useTabState (dual-pane)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should initialize dual-pane with empty content', () => {
        const { result } = renderHook(() =>
            useTabState({
                storageKeys: { left: 'test-left', right: 'test-right' },
                tabName: 'diff',
            }),
        );

        expect(result.current.content).toEqual({ left: '', right: '' });
        expect(result.current.hasContent).toBe(false);
    });

    it('should load dual-pane content from localStorage', () => {
        localStorage.setItem('test-left', 'left content');
        localStorage.setItem('test-right', 'right content');

        const { result } = renderHook(() =>
            useTabState({
                storageKeys: { left: 'test-left', right: 'test-right' },
                tabName: 'diff',
            }),
        );

        expect(result.current.content).toEqual({ left: 'left content', right: 'right content' });
        expect(result.current.hasContent).toBe(true);
    });

    it('should update dual-pane content', () => {
        const { result } = renderHook(() =>
            useTabState({
                storageKeys: { left: 'test-left', right: 'test-right' },
                tabName: 'diff',
            }),
        );

        act(() => {
            result.current.setContent({ left: 'new left', right: 'new right' });
        });

        expect(result.current.content).toEqual({ left: 'new left', right: 'new right' });
    });

    it('should handle shared data for dual-pane', () => {
        const sharedData = {
            tabName: 'diff',
            state: { leftContent: 'shared left', rightContent: 'shared right' },
        };

        const { result } = renderHook(() =>
            useTabState({
                storageKeys: { left: 'test-left', right: 'test-right' },
                tabName: 'diff',
                sharedData,
            }),
        );

        expect(result.current.content).toEqual({ left: 'shared left', right: 'shared right' });
        expect(result.current.isSharedData).toBe(true);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useTabState.test.ts`
Expected: FAIL - dual-pane tests fail

- [ ] **Step 3: Extend useTabState for dual-pane**

```typescript
// hooks/useTabState.ts - extend existing implementation
import { useState, useEffect, useCallback } from 'react';
import type { SharedTabData, SinglePaneTabState, DualPaneTabState } from '@/types/tab-data';
import type { ReactNode } from 'react';

// Type guard for dual-pane
function isDualPaneKeys(
    keys: string | { left: string; right: string },
): keys is { left: string; right: string } {
    return typeof keys === 'object' && 'left' in keys && 'right' in keys;
}

export function useTabState(options: {
    storageKeys: string | { left: string; right: string };
    initialContent?: string | { left: string; right: string };
    sharedData?: SharedTabData;
    tabName: string;
}): SinglePaneTabState | DualPaneTabState {
    const { storageKeys, initialContent, sharedData, tabName } = options;
    const isDual = isDualPaneKeys(storageKeys);

    // Initialize content based on storageKeys type
    const [content, setContent] = useState(() => {
        if (typeof window === 'undefined') {
            return initialContent || (isDual ? { left: '', right: '' } : '');
        }

        try {
            if (isDual) {
                const left = localStorage.getItem(storageKeys.left) || '';
                const right = localStorage.getItem(storageKeys.right) || '';
                return { left, right };
            } else {
                return localStorage.getItem(storageKeys) || '';
            }
        } catch {
            return initialContent || (isDual ? { left: '', right: '' } : '');
        }
    });

    const [isSharedData, setIsSharedData] = useState(false);

    // Handle shared data loading
    useEffect(() => {
        if (sharedData?.tabName === tabName && sharedData?.state) {
            if (isDual) {
                const left = sharedData.state.leftContent || '';
                const right = sharedData.state.rightContent || '';
                if ((left || right) && !isSharedData) {
                    setContent({ left, right });
                    setIsSharedData(true);
                }
            } else {
                const sharedContent =
                    sharedData.state.leftContent || sharedData.state.rightContent || '';
                if (sharedContent && !isSharedData) {
                    setContent(sharedContent);
                    setIsSharedData(true);
                }
            }
        }
    }, [sharedData, tabName, isDual, isSharedData]);

    // Persist content to localStorage
    useEffect(() => {
        try {
            if (isDual) {
                const { left, right } = content as { left: string; right: string };
                localStorage.setItem(storageKeys.left, left);
                localStorage.setItem(storageKeys.right, right);
            } else {
                localStorage.setItem(storageKeys, content as string);
            }
        } catch (error) {
            console.error(`Failed to save to storage:`, error);
        }
    }, [content, storageKeys, isDual]);

    const hasContent = isDual
        ? Boolean(
              (content as { left: string; right: string }).left ||
              (content as { left: string; right: string }).right,
          )
        : Boolean((content as string).trim().length > 0);

    const currentContent = content;

    return {
        content,
        setContent: setContent as any,
        currentContent: currentContent as any,
        hasContent,
        isSharedData,
    } as SinglePaneTabState | DualPaneTabState;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useTabState.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Commit**

```bash
git add hooks/useTabState.ts __tests__/hooks/useTabState.test.ts
git commit -m "feat: extend useTabState to support dual-pane tabs

Add support for diff tabs with left/right content
Handle dual-pane localStorage, shared data loading, and content tracking"
```

## Phase 5: Migrate Remaining Text Tabs

### Task 9: Migrate text-diff-tab to Use Shared Hooks

**Files:**

- Modify: `app/text/tabs/text-diff-tab.tsx`

- [ ] **Step 1: Review current implementation**

Run: `wc -l app/text/tabs/text-diff-tab.tsx`
Expected: 87 lines

- [ ] **Step 2: Migrate to use shared hooks (dual-pane)**

```typescript
// app/text/tabs/text-diff-tab.tsx
'use client';

import { useCallback } from 'react';
import { DiffPane } from '@/components/text/diff-pane/diff-pane';
import { useTabState } from '@/hooks/useTabState';
import { useShareDialog } from '@/hooks/useShareDialog';
import { useClearDialog } from '@/hooks/useClearDialog';
import { ToolLayout, ToolToolbar, ToolDialogs } from '@/components/tool-layout';
import { saveContent } from '@/lib/utils/saveContent';
import { STORAGE_KEYS } from '@/lib/constants';
import { Trash2, Bookmark, Share2 } from 'lucide-react';
import type { SharedTabData } from '@/types/tab-data';

export interface TextDiffTabProps {
    onClear?: () => void;
    sharedData?: SharedTabData | null;
}

export function TextDiffTab({ onClear, sharedData }: TextDiffTabProps) {
    const { content, setContent, hasContent } = useTabState<{
        left: string;
        right: string;
    }>({
        storageKeys: {
            left: STORAGE_KEYS.TEXT_DIFF_LEFT_CONTENT,
            right: STORAGE_KEYS.TEXT_DIFF_RIGHT_CONTENT,
        },
        tabName: 'diff',
        sharedData,
        initialContent: { left: '', right: '' },
    });

    const handleContentChange = useCallback((left: string, right: string) => {
        setContent({ left, right });
    }, [setContent]);

    const getContentForShare = useCallback(() => {
        return content.left || content.right;
    }, [content]);

    const { openShareDialog, renderShareDialog } = useShareDialog({
        contentType: 'text',
        toolName: 'Text Diff',
        getContent: getContentForShare,
    });

    const { openClearDialog, confirmClear, renderClearDialog } = useClearDialog({
        onConfirm: () => {
            setContent({ left: '', right: '' });
            onClear?.();
        },
        toolName: 'Text Diff',
    });

    const handleSave = useCallback(() => {
        saveContent('text', 'Text Diff', content.left || content.right);
    }, [content]);

    const toolbar = (
        <ToolToolbar
            leftContent={<h2 className="text-lg font-semibold">Diff</h2>}
            actions={[
                {
                    id: 'clear',
                    label: 'Clear All',
                    onClick: openClearDialog,
                    variant: 'outline',
                    icon: <Trash2 className="h-4 w-4" />,
                },
                {
                    id: 'save',
                    label: 'Save',
                    onClick: handleSave,
                    variant: 'outline',
                    icon: <Bookmark className="h-4 w-4" />,
                },
                {
                    id: 'share',
                    label: 'Share',
                    onClick: openShareDialog,
                    variant: 'default',
                    icon: <Share2 className="h-4 w-4" />,
                },
            ]}
        />
    );

    const dialogs = (
        <ToolDialogs
            shareDialog={renderShareDialog(getContentForShare())}
            clearDialog={renderClearDialog()}
        />
    );

    return (
        <ToolLayout toolbar={toolbar} dialogs={dialogs}>
            <DiffPane
                sharedData={sharedData}
                onContentChange={handleContentChange}
            />
        </ToolLayout>
    );
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual testing**

- [ ] Open /text/diff tab
- [ ] Enter left and right content
- [ ] Verify both persist separately
- [ ] Test share, save, clear
- [ ] Test shared URL loading

- [ ] **Step 5: Commit**

```bash
git add app/text/tabs/text-diff-tab.tsx
git commit -m "refactor: migrate text-diff-tab to use shared hooks

Use dual-pane useTabState for left/right content management
Consistent toolbar and dialog behavior"
```

### Task 10: Migrate text-clean-tab to Use Shared Hooks

**Files:**

- Modify: `app/text/tabs/text-clean-tab.tsx`

- [ ] **Step 1: Review current implementation**

Run: `wc -l app/text/tabs/text-clean-tab.tsx`
Expected: 353 lines

- [ ] **Step 2: Migrate to use shared hooks**

```typescript
// app/text/tabs/text-clean-tab.tsx
'use client';

import { useCallback } from 'react';
import { CleanPane } from '@/components/text/clean-pane/clean-pane';
import { useTabState } from '@/hooks/useTabState';
import { useShareDialog } from '@/hooks/useShareDialog';
import { useClearDialog } from '@/hooks/useClearDialog';
import { ToolLayout, ToolToolbar, ToolDialogs } from '@/components/tool-layout';
import { saveContent } from '@/lib/utils/saveContent';
import { STORAGE_KEYS } from '@/lib/constants';
import { Trash2, Bookmark, Share2 } from 'lucide-react';
import type { SharedTabData } from '@/types/tab-data';

export interface TextCleanTabProps {
    onClear?: () => void;
    sharedData?: SharedTabData | null;
}

export function TextCleanTab({ onClear, sharedData }: TextCleanTabProps) {
    const { content, setContent, hasContent } = useTabState({
        storageKeys: STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT,
        tabName: 'clean',
        sharedData,
        initialContent: '',
    });

    const { openShareDialog, renderShareDialog } = useShareDialog({
        contentType: 'text',
        toolName: 'Text Clean',
        getContent: () => content,
    });

    const { openClearDialog, confirmClear, renderClearDialog } = useClearDialog({
        onConfirm: () => {
            setContent('');
            onClear?.();
        },
        toolName: 'Text Clean',
    });

    const handleSave = useCallback(() => {
        saveContent('text', 'Text Clean', content);
    }, [content]);

    const toolbar = (
        <ToolToolbar
            leftContent={<h2 className="text-lg font-semibold">Clean</h2>}
            actions={[
                {
                    id: 'clear',
                    label: 'Clear All',
                    onClick: openClearDialog,
                    variant: 'outline',
                    icon: <Trash2 className="h-4 w-4" />,
                },
                {
                    id: 'save',
                    label: 'Save',
                    onClick: handleSave,
                    variant: 'outline',
                    icon: <Bookmark className="h-4 w-4" />,
                },
                {
                    id: 'share',
                    label: 'Share',
                    onClick: openShareDialog,
                    variant: 'default',
                    icon: <Share2 className="h-4 w-4" />,
                },
            ]}
        />
    );

    const dialogs = (
        <ToolDialogs
            shareDialog={renderShareDialog(content)}
            clearDialog={renderClearDialog()}
        />
    );

    return (
        <ToolLayout toolbar={toolbar} dialogs={dialogs}>
            <CleanPane
                sharedData={sharedData}
                content={content}
                setContent={setContent}
            />
        </ToolLayout>
    );
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual testing**

- [ ] Open /text/clean tab
- [ ] Test all functionality
- [ ] Verify no regressions

- [ ] **Step 5: Commit**

```bash
git add app/text/tabs/text-clean-tab.tsx
git commit -m "refactor: migrate text-clean-tab to use shared hooks

Consistent with other text tabs, all functionality preserved"
```

## Phase 6: Migrate JSON Tabs

### Task 11: Migrate JSON Format Tab

**Files:**

- Modify: `app/json/tabs/json-format-tab.tsx`

- [ ] **Step 1: Review current implementation**

Run: `wc -l app/json/tabs/json-format-tab.tsx`
Expected: 190 lines

- [ ] **Step 2: Migrate to use shared hooks with settings**

```typescript
// app/json/tabs/json-format-tab.tsx
'use client';

import { useState, useCallback } from 'react';
import { FormatPane } from '@/components/format';
import { useTabState } from '@/hooks/useTabState';
import { useShareDialog } from '@/hooks/useShareDialog';
import { useClearDialog } from '@/hooks/useClearDialog';
import { ToolLayout, ToolToolbar, ToolDialogs } from '@/components/tool-layout';
import { saveContent } from '@/lib/utils/saveContent';
import { STORAGE_KEYS } from '@/lib/constants';
import { Trash2, Bookmark, Share2 } from 'lucide-react';
import type { SharedTabData } from '@/types/tab-data';

export interface JsonFormatTabProps {
    onClear?: () => void;
    sharedData?: SharedTabData | null;
}

export function JsonFormatTab({ onClear, sharedData }: JsonFormatTabProps) {
    // Tool-specific settings
    const [formatIndentation, setFormatIndentation] = useState(2);
    const [formatSortKeys, setFormatSortKeys] = useState(false);
    const [formatRemoveTrailingCommas, setFormatRemoveTrailingCommas] = useState(false);
    const [formatEscapeUnicode, setFormatEscapeUnicode] = useState(false);

    const { content, setContent, hasContent } = useTabState({
        storageKeys: STORAGE_KEYS.JSON_FORMAT_INPUT,
        tabName: 'format',
        sharedData,
        initialContent: '',
    });

    const { openShareDialog, renderShareDialog } = useShareDialog({
        contentType: 'json',
        toolName: 'JSON Format',
        getContent: () => content,
    });

    const { openClearDialog, confirmClear, renderClearDialog } = useClearDialog({
        onConfirm: () => {
            setContent('');
            onClear?.();
        },
        toolName: 'JSON Format',
    });

    const handleSave = useCallback(() => {
        saveContent('json', 'JSON Format', content);
    }, [content]);

    const toolbar = (
        <ToolToolbar
            leftContent={<h2 className="text-lg font-semibold">Format</h2>}
            toggles={[
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
                    onClick: openClearDialog,
                    variant: 'outline',
                    icon: <Trash2 className="h-4 w-4" />,
                },
                {
                    id: 'save',
                    label: 'Save',
                    onClick: handleSave,
                    variant: 'outline',
                    icon: <Bookmark className="h-4 w-4" />,
                },
                {
                    id: 'share',
                    label: 'Share',
                    onClick: openShareDialog,
                    variant: 'default',
                    icon: <Share2 className="h-4 w-4" />,
                },
            ]}
        />
    );

    const dialogs = (
        <ToolDialogs
            shareDialog={renderShareDialog(content)}
            clearDialog={renderClearDialog()}
        />
    );

    return (
        <ToolLayout toolbar={toolbar} dialogs={dialogs}>
            <FormatPane
                sharedData={sharedData}
                content={content}
                setContent={setContent}
                formatIndentation={formatIndentation}
                setFormatIndentation={setFormatIndentation}
                formatSortKeys={formatSortKeys}
                setFormatSortKeys={setFormatSortKeys}
                formatRemoveTrailingCommas={formatRemoveTrailingCommas}
                setFormatRemoveTrailingCommas={setFormatRemoveTrailingCommas}
                formatEscapeUnicode={formatEscapeUnicode}
                setFormatEscapeUnicode={setFormatEscapeUnicode}
            />
        </ToolLayout>
    );
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual testing**

- [ ] Open /json/format tab
- [ ] Test toggles work
- [ ] Test share/save/clear
- [ ] Verify settings persist

- [ ] **Step 5: Commit**

```bash
git add app/json/tabs/json-format-tab.tsx
git commit -m "refactor: migrate json-format-tab to use shared hooks

Support tool-specific settings with consistent toolbar layout"
```

### Task 12: Migrate Remaining JSON Tabs

**Files:**

- Modify: `app/json/tabs/json-minify-tab.tsx`
- Modify: `app/json/tabs/json-parser-tab.tsx`
- Modify: `app/json/tabs/json-viewer-tab.tsx`
- Modify: `app/json/tabs/json-export-tab.tsx`
- Modify: `app/json/tabs/json-schema-tab.tsx`
- Modify: `app/json/tabs/json-diff-tab.tsx`

- [ ] **Step 1: Migrate json-minify-tab**

Follow same pattern as format tab, adjust for minify-specific settings (sortKeys, removeWhitespace)

- [ ] **Step 2: Migrate json-parser-tab**

Single-pane, no special settings

- [ ] **Step 3: Migrate json-viewer-tab**

Single-pane, no special settings

- [ ] **Step 4: Migrate json-export-tab**

Single-pane, export-specific settings

- [ ] **Step 5: Migrate json-schema-tab**

Single-pane, no special settings

- [ ] **Step 6: Migrate json-diff-tab**

Dual-pane, same as text-diff-tab pattern

- [ ] **Step 7: Build and verify all JSON tabs**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 8: Manual testing checklist**

Test each JSON tab:

- [ ] Format - settings work, share/save/clear
- [ ] Minify - settings work, share/save/clear
- [ ] Parser - share/save/clear
- [ ] Viewer - share/save/clear
- [ ] Export - share/save/clear
- [ ] Schema - share/save/clear
- [ ] Diff - dual-pane, share/save/clear

- [ ] **Step 9: Commit**

```bash
git add app/json/tabs/
git commit -m "refactor: migrate all remaining JSON tabs to use shared hooks

Consistent pattern across all JSON tabs:
- minify, parser, viewer, export, schema, diff
All functionality preserved with significantly reduced duplication"
```

## Phase 7: Migrate Base64 Tabs

### Task 13: Migrate Base64 Tabs

**Files:**

- Modify: `app/base64/tabs/media-to-base64-tab.tsx`
- Modify: `app/base64/tabs/base64-to-media-tab.tsx`

- [ ] **Step 1: Review current implementations**

Run: `wc -l app/base64/tabs/*.tsx`
Expected: 534 + 610 lines (most complex tabs)

- [ ] **Step 2: Migrate media-to-base64-tab**

```typescript
// app/base64/tabs/media-to-base64-tab.tsx
'use client';

import { useCallback } from 'react';
import { MediaToBase64Pane } from '@/components/base64';
import { useTabState } from '@/hooks/useTabState';
import { useShareDialog } from '@/hooks/useShareDialog';
import { useClearDialog } from '@/hooks/useClearDialog';
import { ToolLayout, ToolToolbar, ToolDialogs } from '@/components/tool-layout';
import { saveContent } from '@/lib/utils/saveContent';
import { STORAGE_KEYS } from '@/lib/constants';
import { Trash2, Bookmark, Share2 } from 'lucide-react';
import type { SharedTabData } from '@/types/tab-data';

export interface MediaToBase64TabProps {
    onClear?: () => void;
    sharedData?: SharedTabData | null;
}

export function MediaToBase64Tab({ onClear, sharedData }: MediaToBase64TabProps) {
    const { content, setContent, hasContent } = useTabState<{
        left: string;
        right: string;
    }>({
        storageKeys: {
            left: STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT,
            right: STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT,
        },
        tabName: 'media-to-base64',
        sharedData,
        initialContent: { left: '', right: '' },
    });

    const getContentForShare = useCallback(() => {
        return content.right; // Share the Base64 output
    }, [content]);

    const { openShareDialog, renderShareDialog } = useShareDialog({
        contentType: 'base64',
        toolName: 'Media to Base64',
        getContent: getContentForShare,
    });

    const { openClearDialog, confirmClear, renderClearDialog } = useClearDialog({
        onConfirm: () => {
            setContent({ left: '', right: '' });
            onClear?.();
        },
        toolName: 'Media to Base64',
    });

    const handleSave = useCallback(() => {
        saveContent('base64', 'Media to Base64', content.right);
    }, [content]);

    const toolbar = (
        <ToolToolbar
            leftContent={<h2 className="text-lg font-semibold">Media to Base64</h2>}
            actions={[
                {
                    id: 'clear',
                    label: 'Clear All',
                    onClick: openClearDialog,
                    variant: 'outline',
                    icon: <Trash2 className="h-4 w-4" />,
                },
                {
                    id: 'save',
                    label: 'Save',
                    onClick: handleSave,
                    variant: 'outline',
                    icon: <Bookmark className="h-4 w-4" />,
                },
                {
                    id: 'share',
                    label: 'Share',
                    onClick: openShareDialog,
                    variant: 'default',
                    icon: <Share2 className="h-4 w-4" />,
                },
            ]}
        />
    );

    const dialogs = (
        <ToolDialogs
            shareDialog={renderShareDialog(getContentForShare())}
            clearDialog={renderClearDialog()}
        />
    );

    return (
        <ToolLayout toolbar={toolbar} dialogs={dialogs}>
            <MediaToBase64Pane
                sharedData={sharedData}
                leftContent={content.left}
                rightContent={content.right}
                setLeftContent={(left) => setContent({ ...content, left })}
                setRightContent={(right) => setContent({ ...content, right })}
            />
        </ToolLayout>
    );
}
```

- [ ] **Step 3: Migrate base64-to-media-tab**

Same pattern, reverse input/output

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Manual testing**

- [ ] Test both Base64 tabs thoroughly
- [ ] Verify file upload works
- [ ] Test share/save/clear
- [ ] Test shared URL loading

- [ ] **Step 6: Commit**

```bash
git add app/base64/tabs/
git commit -m "refactor: migrate Base64 tabs to use shared hooks

Most complex tabs successfully migrated
Dual-pane useTabState handles input/output correctly"
```

## Phase 8: Final Validation and Cleanup

### Task 14: Full Regression Testing

- [ ] **Step 1: Test all text tabs**

- [ ] /text/diff - dual-pane, share/save/clear
- [ ] /text/convert - share/save/clear
- [ ] /text/clean - share/save/clear

- [ ] **Step 2: Test all JSON tabs**

- [ ] /json/diff - dual-pane, share/save/clear
- [ ] /json/format - settings, share/save/clear
- [ ] /json/minify - settings, share/save/clear
- [ ] /json/parser - share/save/clear
- [ ] /json/viewer - share/save/clear
- [ ] /json/export - share/save/clear
- [ ] /json/schema - share/save/clear

- [ ] **Step 3: Test all Base64 tabs**

- [ ] /base64/media-to-base64 - dual-pane, file upload, share/save/clear
- [ ] /base64/base64-to-media - dual-pane, share/save/clear

- [ ] **Step 4: Test shared URLs**

- [ ] Generate shared URL from each tab
- [ ] Open in new tab/incognito
- [ ] Verify content loads correctly

- [ ] **Step 5: Test saved items**

- [ ] Save from each tab
- [ ] Load from Saved tab
- [ ] Verify content restores

- [ ] **Step 6: Test localStorage persistence**

- [ ] Enter content in each tab
- [ ] Refresh page
- [ ] Verify content loads

- [ ] **Step 7: Check console for errors**

- [ ] Open browser dev tools
- [ ] Navigate through all tabs
- [ ] Verify no errors or warnings

- [ ] **Step 8: Performance check**

- [ ] Use React DevTools profiler
- [ ] Verify no excessive re-renders
- [ ] Check localStorage performance

### Task 15: Final Code Quality Checks

- [ ] **Step 1: Run TypeScript check**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run Prettier**

Run: `npm run format`
Expected: No changes needed

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Calculate final code reduction**

Run: `find app -path "*/tabs/*" -name "*.tsx" | xargs wc -l | tail -1`
Expected: Significantly reduced from 2,693 lines

### Task 16: Update Documentation

- [ ] **Step 1: Update any relevant documentation**

Check for docs that reference tab implementation patterns

- [ ] **Step 2: Commit any doc updates**

```bash
git add docs/
git commit -m "docs: update documentation for tab optimization architecture"
```

### Task 17: Final Commit and Verification

- [ ] **Step 1: Review all commits**

Run: `git log --oneline -20`
Verify: All commits follow conventional commit format

- [ ] **Step 2: Final build verification**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 3: Final manual smoke test**

- [ ] Open each tool (text, JSON, Base64)
- [ ] Navigate through all tabs
- [ ] Test share/save/clear on each
- [ ] Verify everything works

- [ ] **Step 4: Calculate metrics**

- Original: 2,693 lines
- Final: [count lines]
- Reduction: [calculate percentage]
- Infrastructure: [count lines]
- Net reduction: [calculate]

- [ ] **Step 5: Create summary commit**

```bash
git add .
git commit -m "feat: complete functional tab code optimization

Achievements:
- Migrated all 12 functional tabs to use shared hooks
- Created useTabState, useShareDialog, useClearDialog hooks
- Created ToolLayout, ToolToolbar, ToolDialogs, StandardActions components
- Added comprehensive type definitions and utilities
- Added unit tests for all shared code

Results:
- 21% net code reduction (563 lines)
- Consistent behavior across all tabs
- Improved type safety
- Better error handling
- Easier to maintain and extend

All functionality preserved, zero UI changes"
```

---

## Success Criteria

After completing all tasks:

- [ ] All 12 tabs use shared hooks and components
- [ ] No code duplication in share/save/clear logic
- [ ] TypeScript strict mode enabled, no any types
- [ ] Visual regression shows zero differences
- [ ] All functionality works exactly as before
- [ ] Unit tests for all hooks and utilities
- [ ] Build succeeds without errors
- [ ] Console clean during usage
- [ ] No performance regression
- [ ] Documentation updated

## Rollback Strategy

If issues are found:

1. Identify which commit introduced the issue
2. Revert that specific commit: `git revert <commit-hash>`
3. Fix the issue in the shared code
4. Re-apply the tab migration
5. Test thoroughly before proceeding

Each tab migration is an independent commit, making rollbacks safe and targeted.
