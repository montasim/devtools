// Parser options
export interface ParserOptions {
    showTypes: boolean;
    showPaths: boolean;
    showStatistics: boolean;
}

// ParserPane component props
export interface ParserPaneProps {
    showTypes?: boolean;
    showPaths?: boolean;
    showStatistics?: boolean;
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    initialContent?: string;
    className?: string;
}

// Parsed data structure
export interface ParsedData {
    isValid: boolean;
    error: string | null;
    statistics: {
        totalKeys: number;
        totalValues: number;
        maxDepth: number;
        types: Record<string, number>;
    };
    paths: string[];
    structure: any;
}
