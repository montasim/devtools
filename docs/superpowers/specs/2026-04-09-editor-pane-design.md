# EditorPane Component Design Specification

**Date:** 2026-04-09
**Status:** Approved
**Author:** Claude + User Collaboration

## Overview

Create a dual-pane JSON diff viewer component for the devtools application. The EditorPane allows users to compare two JSON documents side-by-side with configurable diff behavior via toolbar toggles. Features real-time validation, file upload, and unified diff visualization.

## Requirements

### Functional Requirements
- **FR1:** Display two side-by-side editor panes for JSON input
- **FR2:** Support direct text input/editing in both panes
- **FR3:** Support file upload (.json files) for both panes
- **FR4:** Real-time JSON validation with inline error display (line/column info)
- **FR5:** Manual diff computation via "Compare" button (no auto-diff)
- **FR6:** Unified diff panel below editors with +/- style output
- **FR7:** Four toggle behaviors affect diff computation:
  - Ignore Key Order
  - Pretty Print
  - Ignore Whitespace
  - Semantic Type Diff
- **FR8:** Compare button disabled until both panes contain valid JSON

### Non-Functional Requirements
- **NFR1:** Minimal bundle size impact (<200KB gzipped)
- **NFR2:** Fast diff computation (<2 seconds for 1MB files)
- **NFR3:** Responsive UI (no freezing on large files)
- **NFR4:** Follow existing component patterns (navbar, toolbar architecture)
- **NFR5:** TypeScript strict mode compliance
- **NFR6:** Client-side only (uses React hooks, no RSC)

## Architecture

### Component Structure

```
components/editor-pane/
├── editor-pane.tsx      # Main orchestrator component
├── diff-panel.tsx       # Unified diff display component
├── json-editor.tsx      # CodeMirror wrapper with validation
├── use-json-diff.ts     # Custom hook for diff logic
├── types.ts            # TypeScript interfaces
└── index.ts            # Barrel exports
```

### Component Hierarchy

```
EditorPane (Orchestrator)
├── JsonEditor (Left)
│   ├── CodeMirror Instance
│   ├── Shiki Highlighter
│   └── Error Display
├── JsonEditor (Right)
│   ├── CodeMirror Instance
│   ├── Shiki Highlighter
│   └── Error Display
└── DiffPanel
    └── Unified Diff View
```

### Data Flow

```
User Input → JsonEditor → EditorPane State → Compare Click → useJsonDiff → DiffPanel
```

## Component Specifications

### EditorPane (Orchestrator)

**Purpose:** Manages application state, coordinates child components, handles file uploads.

**Responsibilities:**
- Maintain state for both editor panes
- Validate JSON content in real-time
- Coordinate diff computation
- Handle file uploads for both panes
- Enable/disable Compare button based on validation

**Props Interface:**
```typescript
interface EditorPaneProps {
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
```

**State Interface:**
```typescript
interface EditorPaneState {
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

interface ParseError {
  message: string;
  line: number;
  column: number;
}

interface DiffResult {
  hunks: DiffHunk[];
  lineCount: number;
  additionCount: number;
  deletionCount: number;
}
```

### JsonEditor (CodeMirror Wrapper)

**Purpose:** Single editor pane with validation and syntax highlighting.

**Responsibilities:**
- Render CodeMirror instance with line numbers
- Apply Shiki syntax highlighting
- Validate JSON on change (debounced 300ms)
- Display parse errors inline
- Handle file input trigger

**Props Interface:**
```typescript
interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onError: (error: ParseError | null) => void;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
}
```

**CodeMirror Extensions:**
- `@codemirror/view` - line numbers, basic setup
- `@codemirror/state` - editor state management
- `@codemirror/commands` - history (undo/redo)
- `@codemirror/language` - JSON language support
- `@codemirror/autocomplete` - bracket matching

### DiffPanel (Unified Diff Display)

**Purpose:** Display unified diff output with line numbers and color coding.

**Responsibilities:**
- Render unified diff format (+/- lines)
- Show line numbers for original and modified
- Color-code additions (green) and deletions (red)
- Handle empty state
- Display diff statistics

**Props Interface:**
```typescript
interface DiffPanelProps {
  diffResult: DiffResult | null;
  isLoading: boolean;
}
```

**Diff Output Format:**
```
  Line 1: Unchanged content
- Line 2: Removed content (red background)
+ Line 2: Added content (green background)
  Line 3: Unchanged content
```

### useJsonDiff (Custom Hook)

**Purpose:** Encapsulate diff computation logic with toggle-based preprocessing.

**Hook Interface:**
```typescript
interface UseJsonDiffOptions {
  leftContent: string;
  rightContent: string;
  ignoreKeyOrder: boolean;
  prettyPrint: boolean;
  ignoreWhitespace: boolean;
  semanticTypeDiff: boolean;
}

interface UseJsonDiffReturn {
  diff: DiffResult | null;
  error: Error | null;
  isComputing: boolean;
  computeDiff: () => Promise<void>;
}

function useJsonDiff(options: UseJsonDiffOptions): UseJsonDiffReturn
```

**Diff Pipeline:**
1. Validate JSON (parse both inputs)
2. Apply toggles:
   - **Pretty Print:** Format with 2-space indent
   - **Ignore Whitespace:** Normalize whitespace
   - **Ignore Key Order:** Recursively sort object keys
   - **Semantic Type Diff:** Coerce types (string "123" ↔ number 123)
3. Convert to string representation
4. Compute diff using `diff` npm package
5. Format unified diff output
6. Return `DiffResult`

## Dependencies

### Production Dependencies

```json
{
  "diff": "^7.0.0",
  "@codemirror/view": "^6.28.0",
  "@codemirror/state": "^6.4.0",
  "@codemirror/commands": "^6.6.0",
  "@codemirror/language": "^6.10.0",
  "@codemirror/autocomplete": "^6.18.0",
  "shiki": "^1.10.0"
}
```

**Installation:**
```bash
npm install diff @codemirror/view @codemirror/state @codemirror/commands @codemirror/language @codemirror/autocomplete shiki
```

### Dependency Rationale

| Package | Purpose | Why |
|---------|---------|-----|
| `diff` | Text/word/line diffing | Battle-tested, handles edge cases, unified format |
| `@codemirror/view` | Minimal editor | Modular, tree-sitter based, lighter than Monaco |
| `@codemirror/state` | Editor state | Required by CodeMirror 6 |
| `@codemirror/commands` | Basic commands | Undo/redo, selection |
| `@codemirror/language` | Language support | JSON syntax (future: XML, CSV) |
| `@codemirror/autocomplete` | Bracket matching | Lightweight completion |
| `shiki` | Syntax highlighting | VS Code's highlighter, RSC compatible, accurate |

**Bundle Impact:** ~150KB gzipped (vs ~500KB for full editor)

## Error Handling

### Validation States

1. **Empty:** No content → Compare disabled, hint message
2. **Invalid:** Parse error → Compare disabled, inline error with line/column
3. **Valid:** Parse succeeds → Compare enabled, green check indicator

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| Invalid JSON paste | Show error banner, highlight error line, disable Compare |
| Invalid JSON file upload | Toast error, don't populate editor |
| Huge file (>10MB) | Warning toast, load but may be slow |
| Diff fails unexpectedly | Error message in DiffPanel, retry button |
| Shiki load fails | Fallback to plain text with warning |

### Validation Implementation

```typescript
// Debounced validation (300ms)
const validateJson = (content: string): ParseError | null => {
  try {
    JSON.parse(content);
    return null;
  } catch (error) {
    return {
      message: error.message,
      line: extractLineNumber(error),
      column: extractColumnNumber(error)
    };
  }
};
```

## File Upload Handling

### Specifications

- **Accept:** `.json` files only
- **Size limit:** 10MB warning, 50MB hard limit
- **Encoding:** UTF-8 only
- **Validation:** Parse on upload, reject if invalid
- **UX:** Drag-and-drop zone + file input button

### Implementation

```typescript
const handleFileUpload = async (file: File) => {
  // Check file size
  if (file.size > 50 * 1024 * 1024) {
    toast.error('File too large (max 50MB)');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.warning('Large file may be slow to process');
  }

  // Read file
  const text = await file.text();

  // Validate
  try {
    JSON.parse(text);
    onChange(text);
  } catch (error) {
    toast.error(`Invalid JSON: ${error.message}`);
  }
};
```

## Diff Toggle Behaviors

### 1. Pretty Print

**Purpose:** Format JSON with consistent indentation before comparing.

**Implementation:**
```typescript
if (prettyPrint) {
  const parsed = JSON.parse(content);
  content = JSON.stringify(parsed, null, 2);
}
```

### 2. Ignore Whitespace

**Purpose:** Normalize whitespace to ignore formatting differences.

**Implementation:**
```typescript
if (ignoreWhitespace) {
  content = content
    .replace(/\s+/g, ' ')      // Collapse multiple spaces
    .replace(/\s*\n\s*/g, '')  // Remove line breaks
    .trim();
}
```

### 3. Ignore Key Order

**Purpose:** Treat objects as equal regardless of key ordering.

**Implementation:**
```typescript
const sortObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = sortObjectKeys(obj[key]);
        return sorted;
      }, {} as any);
  }
  return obj;
};

if (ignoreKeyOrder) {
  leftContent = JSON.stringify(sortObjectKeys(JSON.parse(leftContent)));
  rightContent = JSON.stringify(sortObjectKeys(JSON.parse(rightContent)));
}
```

### 4. Semantic Type Diff

**Purpose:** Treat semantically equivalent values as equal (type coercion).

**Implementation:**
```typescript
const coerceValue = (value: any): any => {
  // String "123" → Number 123
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }

  // String "true"/"false" → Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // String "null" → null
  if (value === 'null') return null;

  return value;
};

const compareWithCoercion = (left: any, right: any): boolean => {
  if (typeof left !== typeof right) {
    return JSON.stringify(coerceValue(left)) === JSON.stringify(coerceValue(right));
  }
  return JSON.stringify(left) === JSON.stringify(right);
};
```

## Testing Strategy

### Unit Tests

**useJsonDiff Hook:**
- Toggle combinations (16 scenarios)
- Valid JSON comparisons
- Invalid JSON handling
- Empty content edge cases

**JsonEditor Component:**
- Renders CodeMirror instance
- onChange callback fires
- Error state displays correctly
- File upload triggers onChange

**DiffPanel Component:**
- Renders unified diff correctly
- Line numbers match content
- Color coding is accurate
- Empty state shows message

### Integration Tests

**EditorPane Full Flow:**
- User types in both editors
- Validation states update
- Compare button enables/disables
- Click Compare → diff appears
- Toggles change diff result

**Error Scenarios:**
- Invalid JSON shows error
- Invalid file upload rejected
- Diff failure displays error
- Huge file warning shows

**Keyboard Navigation:**
- Tab between editors
- Ctrl+Enter triggers Compare
- Escape clears errors

### Test Tools

- **Framework:** Vitest
- **React Testing:** @testing-library/react
- **Assertions:** Vitest built-in
- **Mocking:** Vitest vi.mock() for CodeMirror, Shiki
- **Coverage:** Aim for 80%+

### Success Criteria

- ✅ All unit tests pass
- ✅ Integration tests cover full user flow
- ✅ Manual testing checklist complete
- ✅ Build succeeds with no TypeScript errors
- ✅ Bundle size increase <200KB gzipped
- ✅ No console errors in browser

## Implementation Phases

### Phase 1: Foundation (Core Components)
1. Install dependencies
2. Create file structure
3. Implement JsonEditor component (CodeMirror + validation)
4. Implement DiffPanel component (basic rendering)
5. Implement EditorPane orchestrator
6. Basic integration (two panes, Compare button)

### Phase 2: Diff Logic
1. Implement useJsonDiff hook
2. Implement Pretty Print toggle
3. Implement Ignore Whitespace toggle
4. Test basic diff functionality

### Phase 3: Advanced Toggles
1. Implement Ignore Key Order (custom tree-walker)
2. Implement Semantic Type Diff (coercion logic)
3. Test toggle combinations
4. Performance testing (large files)

### Phase 4: Polish
1. Add file upload functionality
2. Add drag-and-drop support
3. Improve error messages
4. Add keyboard shortcuts
5. Accessibility improvements
6. Full test coverage

### Phase 5: Integration & Testing
1. Integrate with Toolbar component
2. Connect toggle states
3. End-to-end testing
4. Performance optimization
5. Bundle size optimization
6. Documentation

## Future Enhancements (Out of Scope)

- XML format support (custom tree-walker)
- CSV format support (papaparse)
- Inline diff mode (side-by-side highlighting)
- Three-way diff (base, left, right)
- Diff export (patch file, HTML)
- Dark/light theme support
- Persistent workspace (localStorage)

## Design Decisions

### Why CodeMirror 6 vs Monaco/Ace?
- **Modular:** Only load what we need (line numbers, no heavy IDE)
- **Lightweight:** ~150KB vs ~500KB for Monaco
- **Tree-sitter:** Modern, accurate parsing
- **RSC Compatible:** Works with Next.js App Router

### Why Shiki vs Prism/Highlight.js?
- **Tree-sitter based:** More accurate syntax highlighting
- **RSC compatible:** Works in React Server Components
- **Lightweight:** Smaller than Prism/HLJS
- **VS Code's engine:** Battle-tested, actively maintained

### Why Manual Diff vs Auto-diff?
- **Performance:** Large files could cause lag on every keystroke
- **User control:** Explicit Compare action is more predictable
- **Clear workflow:** Edit → Review → Compare → See results

### Why Unified Diff vs Side-by-Side?
- **User preference:** Based on provided screenshot
- **Simpler implementation:** Single panel vs synchronized scrolling
- **Mobile friendly:** Easier to view on narrow screens

## Notes

- All components follow the modular architecture established by navbar and toolbar components
- Client-side only (uses 'use client' directive)
- No server-side processing required
- All diff computation happens in browser
- File sizes limited to prevent browser crashes
- Error messages are user-friendly, not technical

## Appendix: Example Usage

```typescript
'use client';

import { EditorPane } from '@/components/editor-pane';
import { useState } from 'react';

export default function ComparePage() {
  const [toggles, setToggles] = useState({
    ignoreKeyOrder: true,
    prettyPrint: true,
    ignoreWhitespace: false,
    semanticTypeDiff: false,
  });

  return (
    <div>
      <Toolbar
        toggles={[
          {
            id: 'ignoreKeyOrder',
            label: 'Ignore Key Order',
            checked: toggles.ignoreKeyOrder,
            onChange: (checked) => setToggles(prev => ({ ...prev, ignoreKeyOrder: checked }))
          },
          // ... other toggles
        ]}
        actions={[
          {
            id: 'clear',
            label: 'Clear All',
            onClick: () => console.log('Clear'),
            variant: 'outline'
          }
        ]}
      />
      <EditorPane
        {...toggles}
        initialLeftContent='{\n  "name": "John"\n}'
        initialRightContent='{\n  "name": "Jane"\n}'
        onCompare={(result) => console.log('Diff:', result)}
      />
    </div>
  );
}
```

---

**End of Design Specification**
