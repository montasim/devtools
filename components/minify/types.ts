// Minify options
export interface MinifyOptions {
    sortKeys: boolean;
    removeWhitespace: boolean;
}

// MinifyPane component props
export interface MinifyPaneProps {
    sortKeys?: boolean;
    removeWhitespace?: boolean;
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    onContentChange?: (content: string) => void;
    initialLeftContent?: string;
    className?: string;
}
