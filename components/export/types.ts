// Export format options
export type ExportFormat = 'csv' | 'xml' | 'yaml' | 'toml' | 'json';

// Export options
export interface ExportOptions {
    format: ExportFormat;
    csvDelimiter?: string;
    xmlRootTag?: string;
    yamlIndent?: number;
    includeHeaders?: boolean;
}

// ExportPane component props
export interface ExportPaneProps {
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    initialContent?: string;
    className?: string;
    exportFormat?: ExportFormat;
    onExportFormatChange?: (format: ExportFormat) => void;
}

// Export result
export interface ExportResult {
    converted: string;
    isValid: boolean;
    error: string | null;
}
