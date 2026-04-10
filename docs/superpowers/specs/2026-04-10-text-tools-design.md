# Text Tools Design Document

**Date**: 2026-04-10
**Status**: Design Approved
**Priority**: Medium

## Overview

Implement a text tools page at `/text` with two tabs: Diff and Transform. The implementation will reuse existing UI patterns from the JSON tools (Tabs, Toolbar) while creating new components specific to text operations.

## Dependencies

```json
{
    "diff": "^5.1.0",
    "react-diff-viewer-continued": "^3.2.6"
}
```

**Note**: We cannot reuse `EditorPane` for text diffing as it's tightly coupled to JSON validation. We'll create a new `TextDiffPane` component.

## Requirements

### Functional Requirements

1. **Text Diff Tab**
    - Side-by-side text comparison with diff highlighting
    - Toggle options: ignore case, ignore whitespace
    - Real-time validation for both input panes
    - Compare button (disabled until both panes have content)
    - Clear All button to reset inputs
    - Diff highlighting for additions, deletions, and changes

2. **Text Transform Tab**
    - Single textarea for input text
    - Transformation options organized by category:
        - **Case**: Uppercase, Lowercase, Title Case, Sentence Case
        - **Encoding**: Base64 Encode/Decode, URL Encode/Decode
        - **Whitespace**: Trim, Normalize Spaces, Remove Extra Lines
        - **Other**: Reverse Text, Shuffle Words
    - Real-time transformation on button click
    - Output area with Copy button
    - Clear All button
    - localStorage persistence

### Technical Requirements

- Reuse existing UI components (Tabs, Toolbar, EditorPane)
- State persistence across tab switches
- LocalStorage integration for data recovery
- Responsive design and accessibility
- Performance optimization for large texts (1MB+)
- Error handling for invalid transformations

## Architecture

### Component Structure

```
app/text/page.tsx                    # Main page with tab orchestration
components/text-tools/
├── diff-pane/                       # Text comparison component
│   ├── diff-pane.tsx
│   ├── diff-results.tsx
│   ├── use-text-diff.ts
│   └── types.ts
└── transform-pane/                  # Text transformation component
    ├── transform-pane.tsx
    ├── transform-actions.tsx        # Transformation button groups
    ├── use-text-transform.ts        # Transformation logic hook
    └── types.ts
```

### Key Architectural Decisions

1. **Hybrid Reuse**: Leverage existing JSON components where possible
2. **Minimal New Code**: Only create components specific to text transformations
3. **Consistent Patterns**: Follow established patterns from JSON tools
4. **Local State**: Each tab manages its own state with React hooks

## Data Flow

### Diff Tab

```
User types → EditorPane validation → Both panes valid → Compare button enabled
→ Click Compare → Compute diff → Display results with highlighting
```

### Transform Tab

```
User enters text → useState(input) → localStorage save (debounced)
→ Click transform button → apply transformation → update output
→ Display in read-only area with Copy button
```

## Component Specifications

### Diff Tab

**New Component: TextDiffPane**

**Why not EditorPane?** The existing `EditorPane` is tightly coupled to JSON validation (uses `JsonEditor` component with JSON-specific logic). Text diff needs plain textareas.

**State:**

- `ignoreCase`: boolean (default: false)
- `ignoreWhitespace`: boolean (default: false)
- `canCompare`: boolean (validation state)
- `isComputing`: boolean (comparison in progress)
- `leftText`: string
- `rightText`: string
- `diffResult`: DiffResult | null

**Features:**

- Two plain textareas (left/right) with real-time validation
- Toggle switches for case and whitespace options
- Compare button (disabled until both panes have content)
- Clear All button to reset both panes
- Diff results using `react-diff-viewer-continued` with:
    - Green highlighting for additions
    - Red highlighting for deletions
    - Split view (side-by-side) display
- Line-level diffs (not character-level)
- Error handling for empty inputs and large texts (>1MB)

### Transform Tab

**New Component: TextTransformPane**

**Layout:** Side-by-side split pane (like Format tab in JSON tools) - input on left, output on right.

**State:**

- `inputText`: string
- `outputText`: string (transformed result)

**Transformation Functions:**

**Case Conversions:**

- `toUpperCase()`: "hello" → "HELLO"
- `toLowerCase()`: "HELLO" → "hello"
- `toTitleCase()`: "hello world" → "Hello World" (capitalize first letter of each word)
- `toSentenceCase()`: "hello world" → "Hello world" (capitalize first letter only)

**Encoding/Decoding:**

- `base64Encode()`: "hello" → "aGVsbG8="
- `base64Decode()`: "aGVsbG8=" → "hello" (throws if invalid Base64)
- `urlEncode()`: "hello world" → "hello%20world"
- `urlDecode()`: "hello%20world" → "hello world" (throws if malformed)

**Whitespace:**

- `trim()`: " hello " → "hello"
- `normalizeSpaces()`: "hello world" → "hello world" (collapse multiple spaces to one)
- `removeExtraLines()`: Removes consecutive blank lines (max one empty line between paragraphs)

**Other:**

- `reverseText()`: "hello" → "olleh"
- `shuffleWords()`: "hello world" → "world hello" (random word order)

**Features:**

- Two large textareas (input/output) in split view
- Transformation toolbar above with buttons organized by category
- Real-time transformation on button click (not automatic - user must click)
- Output in read-only textarea with Copy button
- Clear All button
- Error messages for failed transformations (e.g., "Invalid Base64 string", "Text exceeds 1MB limit")

## Error Handling

### Input Validation

**Diff Tab:**

- Empty input: "Please enter text in both panes to compare"
- Size limit: "Text exceeds 1MB limit (current: {size}MB). Large texts may cause performance issues."

**Transform Tab:**

- Empty input: "Please enter text to transform"
- Size limit: "Text exceeds 1MB limit (current: {size}MB). Large texts may cause performance issues."

### Processing Errors

**Encoding/Decoding Errors:**

- Base64 decode: "Invalid Base64 string: unable to decode"
- URL decode: "URL decode failed: malformed percent encoding at position {pos}"
- General transform: "Transformation failed: {error.message}"

**Display:** Errors shown in red alert banner above the relevant pane.

### Storage Errors

- localStorage quota exceeded: "Warning: Unable to save to browser storage (quota exceeded). Your work is not being saved."
- Fallback: Continue with in-memory state, show warning
- Retry: "Try clearing your browser data or using smaller texts"

### localStorage Strategy

**Pattern:** Follow `format-pane.tsx` (lines 46-55) - save on input change with 500ms debouncing.

**When to Save:**

- Diff tab: Save left/right text on every keystroke (debounced 500ms)
- Transform tab: Save input text on every keystroke (debounced 500ms)

**Storage Keys:**

- `text-diff-left-content`: Left pane input for Diff tab
- `text-diff-right-content`: Right pane input for Diff tab
- `text-transform-input`: Input text for Transform tab
- `text-transform-output`: Output text for Transform tab (optional - mainly for debugging)

## Share Functionality

**Decision:** Share dialogs are **out of scope** for MVP. Focus on core diff and transform functionality first.

**Future Enhancement:** Add share dialogs similar to JSON tools (FormatShareDialog, etc.) if users request it.

## Styling

- Use same container patterns as JSON page: `className="mx-auto"`
- Reuse existing button variants and toggle switches
- Consistent spacing and borders with shadcn/ui components
- Tab layout matches JSON page structure exactly

## Implementation Phases

### Phase 1: Foundation

- Install dependencies: `diff` and `react-diff-viewer-continued`
- Set up app/text/page.tsx with tab structure (Diff, Transform)
- Create components/text-tools directory structure
- Add TypeScript interfaces and types

### Phase 2: Diff Tab

- Create TextDiffPane component with two plain textareas
- Implement diff logic using `diff` library
- Add diff viewer using `react-diff-viewer-continued`
- Implement state management and localStorage (debounced saves)
- Add Toolbar with ignore case/ignore whitespace toggles
- Add Compare button (disabled until both panes have content)
- Add Clear All button

### Phase 3: Transform Tab

- Create TextTransformPane component with split view layout
- Implement transformation utility functions:
    - Case conversions (toUpperCase, toLowerCase, toTitleCase, toSentenceCase)
    - Encoding/decoding (base64Encode, base64Decode, urlEncode, urlDecode)
    - Whitespace operations (trim, normalizeSpaces, removeExtraLines)
    - Other (reverseText, shuffleWords)
- Add toolbar with transformation buttons organized by category
- Integrate localStorage persistence (debounced saves)
- Add Copy button for output

### Phase 4: Polish

- Add error handling and validation (specific error messages)
- Test with large texts (1MB+)
- Ensure responsive design works on mobile
- Add loading states and disabled states
- Final testing and bug fixes

## Development Guidelines

- Follow existing code patterns from JSON tools
- Use TypeScript strict mode with comprehensive typing
- Implement proper cleanup in useEffect hooks
- Maintain consistency with existing UI components
- Test incrementally (each tab before moving to next)

## Success Criteria

- Both tabs fully functional with all transformations working
- State persistence works across tab switches
- LocalStorage saving/recovery functioning correctly
- Performance acceptable for texts up to 1MB
- Responsive design works on mobile and desktop
- No console errors or warnings
- Consistent UI/UX with existing JSON tools
