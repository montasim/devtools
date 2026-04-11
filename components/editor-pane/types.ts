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
    modificationCount: number;
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
    onValidationChange?: (canCompare: boolean) => void;

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
    readOnly?: boolean;
    customToolbar?: React.ReactNode;
    height?: string;
    showEmptyPrompt?: boolean;
    emptyStateIcon?: React.ComponentType<{ className?: string }>;
    totalKeys?: number;
    totalValues?: number;
}

// DiffPanel component props
export interface DiffPanelProps {
    diffResult: DiffResult | null;
    isLoading: boolean;
    leftContent?: string;
    rightContent?: string;
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

// View modes for diff display
export type ViewMode = 'split' | 'unified' | 'inline' | 'tree';

// Export formats for the export menu
export type ExportFormat =
    | 'json-patch'
    | 'merge-patch'
    | 'download-patch'
    | 'html-report'
    | 'json-paths';

// Diff filter types
export type DiffFilter = 'all' | 'additions' | 'deletions' | 'modifications';

// Panel types for toggle menu
export type PanelType = 'bookmarks' | 'tree-panel' | 'statistics' | 'validation';

// Props for DiffPanelToolbar
export interface DiffPanelToolbarProps {
    // View mode (controlled component)
    viewMode: ViewMode;

    // Statistics
    additionCount: number;
    deletionCount: number;
    modificationCount: number;
    totalLines: number;

    // Callbacks
    onViewModeChange?: (mode: ViewMode) => void;
    onShare?: () => void;
    onExport?: (format: ExportFormat) => void;
    onFilterChange?: (filter: DiffFilter) => void;
    onPanelToggle?: (panel: PanelType) => void;

    // Styling
    className?: string;
}
