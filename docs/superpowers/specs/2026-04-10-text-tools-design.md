# Text Tools Design Document

**Date**: 2026-04-10
**Status**: Design Approved
**Priority**: Medium

## Overview

Implement a text tools page at `/text` with two tabs: Diff and Transform. The implementation will reuse existing components from the JSON tools (EditorPane, Toolbar, share dialogs) while creating minimal new components specific to text operations.

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

**Reused Components:**

- `EditorPane` for side-by-side text areas
- `Toolbar` for toggles and action buttons

**State:**

- `ignoreCase`: boolean (default: false)
- `ignoreWhitespace`: boolean (default: false)
- `canCompare`: boolean (validation state)
- `isComputing`: boolean (comparison in progress)

**Features:**

- Toggle switches for case and whitespace options
- Compare button (disabled until validation passes)
- Clear All button to reset both panes
- Diff results with color-coded highlighting
- Error handling for empty inputs and large texts

### Transform Tab

**New Component: TextTransformPane**

**State:**

- `inputText`: string
- `outputText`: string (transformed result)
- `selectedTransform`: string

**Features:**

- Single large textarea for input
- Transformation buttons organized by category (Case, Encoding, Whitespace, Other)
- Real-time transformation on button click
- Output display in read-only textarea
- Copy button for output
- Clear All button
- Error messages for failed transformations

## Error Handling

### Input Validation

- Empty input detection with helpful messages
- Character/size limits (1MB max) to prevent performance issues
- Invalid encoding detection for decode operations

### Processing Errors

- Try-catch blocks around transformation operations
- User-friendly error messages explaining what went wrong
- Graceful fallback if transformation fails

### Storage Errors

- localStorage quota exceeded handling
- Backup to in-memory state if storage fails
- Clear error messaging with retry suggestions

## localStorage Keys

- `text-diff-left-content`: Left pane input for Diff tab
- `text-diff-right-content`: Right pane input for Diff tab
- `text-transform-input`: Input text for Transform tab
- `text-transform-output`: Output text for Transform tab

## Styling

- Use same container patterns as JSON page: `className="mx-auto"`
- Reuse existing button variants and toggle switches
- Consistent spacing and borders with shadcn/ui components
- Tab layout matches JSON page structure exactly

## Implementation Phases

### Phase 1: Foundation

- Set up app/text/page.tsx with tab structure
- Add Diff tab with reused EditorPane component
- Implement state management and localStorage

### Phase 2: Transform Tab

- Create TextTransformPane component
- Implement transformation functions (case, encoding, whitespace)
- Add toolbar with transformation buttons
- Integrate localStorage persistence

### Phase 3: Polish

- Add error handling and validation
- Test with large texts (1MB+)
- Ensure responsive design works
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
