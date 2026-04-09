# Text Tools Design Document

**Date**: 2026-04-10
**Status**: Design Approved
**Priority**: Medium

## Overview

Implement a comprehensive text tools page at `/text` that provides text analysis, transformation, manipulation, and comparison capabilities. The implementation will follow a hybrid component architecture that balances modularity with consistency to the existing JSON tools pattern.

## Requirements

### Functional Requirements

1. **Text Analysis Tools**
    - Word counts & statistics (total, unique, average word length)
    - Character analysis (with/without spaces, letter frequency)
    - Readability metrics (Flesch Reading Ease, grade level)
    - Time estimates (reading time, speaking time)

2. **Text Transformation Tools**
    - Case conversion (uppercase, lowercase, title case, sentence case, camelCase, snake_case)
    - Encoding/decoding (Base64, URL encoding, HTML entities)
    - Whitespace handling (trim, normalize line endings, remove extra spaces)
    - Text manipulation (reverse text, shuffle words)

3. **Text Manipulation Tools**
    - Find & replace (simple and regex-based)
    - Line operations (remove duplicates, empty lines, sort lines)
    - Sort & deduplicate functionality
    - Extract content (emails, URLs, phone numbers, custom patterns)

4. **Text Diff & Comparison**
    - Side-by-side text comparison
    - Word-level and character-level diffs
    - Merge functionality
    - Diff options (ignore case, whitespace)

### Technical Requirements

- Single page with tabbed interface
- State persistence across tab switches
- LocalStorage integration for data recovery
- Share functionality via URL generation
- Keyboard shortcuts for common operations
- Responsive design and accessibility
- Performance optimization for large texts (1MB+)

## Architecture

### Component Structure

```
app/text/page.tsx                    # Main page with tab orchestration
components/text-tools/
├── shared/                           # Common utilities and types
│   ├── types.ts                      # Shared TypeScript interfaces
│   ├── constants.ts                  # Common constants (limits, defaults)
│   ├── utils/                        # Shared utility functions
│   └── hooks/                        # Custom React hooks
├── analysis-pane/                    # Text statistics and metrics
│   ├── analysis-pane.tsx
│   ├── analysis-results.tsx
│   ├── use-text-analysis.ts
│   └── types.ts
├── transform-pane/                   # Case conversion, encoding/decoding
│   ├── transform-pane.tsx
│   ├── transform-actions.tsx
│   ├── use-text-transform.ts
│   └── types.ts
├── manipulation-pane/                # Find/replace, sorting, extraction
│   ├── manipulation-pane.tsx
│   ├── manipulation-actions.tsx
│   ├── use-text-manipulation.ts
│   └── types.ts
└── diff-pane/                        # Text comparison tools
    ├── diff-pane.tsx
    ├── diff-results.tsx
    ├── use-text-diff.ts
    └── types.ts
```

### Key Architectural Decisions

1. **Hybrid Structure**: Shared utilities with self-contained pane components
2. **Tab Orchestration**: Main page manages tabs and shared UI elements
3. **Local State Management**: Each pane manages its own state using React hooks
4. **TypeScript Interfaces**: Strong typing throughout with shared interfaces
5. **LocalStorage Integration**: Each pane handles its own persistence

## Data Flow

### Input → Processing → Output Pattern

1. User enters text in textarea components with real-time validation
2. Each pane maintains local state for input text and options
3. Custom hooks handle transformation logic
4. Results components receive and display processed data
5. localStorage updates occur on meaningful changes (debounced)
6. Share dialogs create URL-safe encoded representations

### Data Flow Example (Analysis Pane)

```
User types → useState(input) → debounce(500ms) → useTextAnalysis(input) →
calculateStatistics() → updateResults → localStorage.setItem() → renderResults()
```

## Error Handling

### Input Validation

- Empty input detection with helpful messages
- Character/size limits (1MB max) to prevent performance issues
- Invalid pattern detection for regex operations

### Processing Errors

- Try-catch blocks around transformation operations
- Graceful degradation with partial results
- User-friendly error messages explaining what went wrong

### Storage Errors

- localStorage quota exceeded handling
- Backup to in-memory state if storage fails
- Clear error messaging with retry suggestions

### UI Error States

- Error boundary components for each pane
- Visual indicators for problematic inputs
- Actionable error messages with suggested fixes

## Testing Strategy

### Unit Tests

- Custom hooks testing (`use-text-analysis.test.ts`, etc.)
- Utility function tests for shared utilities
- Text processing logic tests (case conversion, encoding, etc.)
- Edge case coverage (empty input, special characters, large texts)

### Integration Tests

- Component behavior tests for each pane
- State management tests (localStorage persistence)
- Tab switching and state preservation tests
- Share dialog functionality tests

### Performance Tests

- Large text handling (1MB+ texts)
- Debounce functionality verification
- Memory leak checks for cleanup functions

## Implementation Phases

### Phase 1: Foundation

- Create directory structure and shared utilities
- Implement base TypeScript interfaces and constants
- Set up testing infrastructure and shared hooks

### Phase 2: Analysis Pane

- Build AnalysisPane as foundation (least complex)
- Establish patterns for other panes to follow
- Test localStorage integration and share dialogs

### Phase 3: Transform & Manipulation Panes

- Implement TransformPane with chaining functionality
- Build ManipulationPane with regex operations
- Reuse patterns from AnalysisPane

### Phase 4: Diff Pane

- Implement DiffPane with comparison logic
- Add merge functionality and diff options
- Performance optimization for large texts

### Phase 5: Integration & Polish

- Main page component with tab orchestration
- Keyboard shortcuts implementation
- Responsive design and accessibility improvements
- Final testing and bug fixes

## Component Specifications

### Analysis Pane Component

**Purpose**: Provide comprehensive text statistics and readability metrics.

**Structure**:

- Single text input area with real-time analysis
- Statistics display panel showing word counts, character analysis, readability metrics, time estimates
- Results update automatically on input change (debounced)

**Key Features**:

- Copy individual statistics or entire report
- Export analysis results as JSON/CSV
- Real-time validation for empty input

### Transform Pane Component

**Purpose**: Convert text between different formats and encodings.

**Structure**:

- Single text input with transform toolbar
- Transformation options organized by category (Case, Encoding, Whitespace, Manipulation)
- Output area showing transformed result with copy button

**Key Features**:

- Multiple transformations can be chained
- Each transformation shows preview of first few characters
- Undo/redo for transformation history

### Manipulation Pane Component

**Purpose**: Advanced text editing and processing operations.

**Structure**:

- Large text input area with toolbar
- Operations panel with tabs (Find & Replace, Line Operations, Extract Content)
- Results panel showing modified text with statistics

**Key Features**:

- Preview changes before applying
- Batch operations support
- Custom regex patterns for extraction
- Case-sensitive/insensitive options

### Diff Pane Component

**Purpose**: Compare two text inputs with detailed difference visualization.

**Structure**:

- Two input panes (left/right) with comparison toolbar
- Comparison options (ignore case/whitespace, word/char level diffs)
- Results panel showing side-by-side comparison with highlighting
- Merge functionality to combine changes

**Key Features**:

- Export diff results as unified diff format
- Navigation between differences
- Statistics on additions/deletions/changes

## Development Guidelines

- Follow existing code patterns from JSON tools
- Use TypeScript strict mode with comprehensive typing
- Implement proper cleanup in useEffect hooks
- Maintain consistency with existing UI components
- Add helpful comments for complex logic
- Test incrementally (each pane before moving to next)

## Success Criteria

- All four tool categories fully functional
- State persistence works across tab switches
- LocalStorage saving/recovery functioning correctly
- Share functionality generates working URLs
- Keyboard shortcuts implemented for common operations
- Performance acceptable for texts up to 1MB
- Responsive design works on mobile and desktop
- All tests passing with good coverage
- No console errors or warnings
- Consistent UI/UX with existing JSON tools

## Future Enhancements

- Additional text transformation formats (Markdown, CSV)
- More advanced diff algorithms (Myers diff, patience diff)
- Text templates and snippets
- Batch file processing
- Integration with cloud storage
- Real-time collaboration features
- Text AI tools (summarization, translation)
