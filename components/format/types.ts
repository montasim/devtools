import type { ParseError } from '@/components/editor/types';

export interface FormatPaneProps {
    indentation?: number;
    sortKeys?: boolean;
    removeTrailingCommas?: boolean;
    escapeUnicode?: boolean;
    onError?: (error: Error) => void;
    onValidationChange?: (isValid: boolean) => void;
    onIndentationChange?: (indentation: number) => void;
    onContentChange?: (content: string) => void;
    initialLeftContent?: string;
    className?: string;
}

export interface FormatOptions {
    indentation: number;
    sortKeys: boolean;
    removeTrailingCommas: boolean;
    escapeUnicode: boolean;
}

export interface FormatResult {
    formatted: string;
    error: ParseError | null;
    isValid: boolean;
}
