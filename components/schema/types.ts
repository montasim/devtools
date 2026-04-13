export type SchemaMode = 'generate' | 'validate';
export type SchemaVersion = 'draft-07' | '2020-12';
export type ViewMode = 'inline' | 'list';

export interface SchemaOptions {
    strictMode: boolean;
    schemaVersion: SchemaVersion;
    viewMode: ViewMode;
}

export interface ConstraintOptions {
    patterns: Record<string, string>;
    ranges: Record<string, { min?: number; max?: number }>;
    enums: Record<string, unknown[]>;
    required: string[];
}

export interface ValidationError {
    path: string;
    property: string;
    expected: string;
    actual: unknown;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface SchemaGenerationResult {
    schema: string;
    isValid: boolean;
    error: string | null;
}

export interface SchemaPaneProps {
    mode?: SchemaMode;
    onModeChange?: (mode: SchemaMode) => void;
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    onContentChange?: (jsonContent: string, schemaContent: string) => void;
    initialJsonContent?: string;
    className?: string;
}
