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
