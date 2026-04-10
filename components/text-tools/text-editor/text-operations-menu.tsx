'use client';

import {
    Copy,
    CaseUpper,
    CaseLower,
    Heading1,
    AlignLeft,
    Scissors,
    Trash2,
    ArrowUpDown,
    RefreshCw,
    Hash,
    Code,
    Globe,
} from 'lucide-react';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
    copyToClipboard,
    toUpperCase,
    toLowerCase,
    toTitleCase,
    toSentenceCase,
    trim,
    trimLeft,
    trimRight,
    removeExtraSpaces,
    removeLineBreaks,
    removeDuplicateLines,
    sortLinesAscending,
    sortLinesDescending,
    reverseText,
    reverseLines,
    removeNumbers,
    removeSpecialChars,
    escapeHtml,
    unescapeHtml,
    encodeBase64,
    decodeBase64,
    encodeUrl,
    decodeUrl,
} from './utils/text-operations';

export interface TextOperationsMenuProps {
    content: string;
    onContentChange: (newContent: string) => void;
    onError?: (error: string | null) => void;
}

export function TextOperationsMenu({ content, onContentChange, onError }: TextOperationsMenuProps) {
    const handleOperation = (operation: (content: string) => string, operationName: string) => {
        try {
            const result = operation(content);
            onContentChange(result);
            onError?.(null);
        } catch (error) {
            onError?.(
                `Failed to ${operationName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(content);
        if (!success) {
            onError?.('Failed to copy to clipboard');
        } else {
            onError?.(null);
        }
    };

    return (
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <CaseUpper className="mr-2 h-4 w-4" />
                    Case Conversion
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem onClick={() => handleOperation(toUpperCase, 'uppercase')}>
                        <CaseUpper className="mr-2 h-4 w-4" />
                        UPPERCASE
                        <DropdownMenuShortcut>⌘⇧U</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleOperation(toLowerCase, 'lowercase')}>
                        <CaseLower className="mr-2 h-4 w-4" />
                        lowercase
                        <DropdownMenuShortcut>⌘⇧L</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleOperation(toTitleCase, 'title case')}>
                        <Heading1 className="mr-2 h-4 w-4" />
                        Title Case
                        <DropdownMenuShortcut>⌘⇧T</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleOperation(toSentenceCase, 'sentence case')}
                    >
                        <AlignLeft className="mr-2 h-4 w-4" />
                        Sentence case
                        <DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Scissors className="mr-2 h-4 w-4" />
                    Trim & Clean
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem onClick={() => handleOperation(trim, 'trim')}>
                        <Scissors className="mr-2 h-4 w-4" />
                        Trim
                        <DropdownMenuShortcut>⌘⌥T</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleOperation(trimLeft, 'trim left')}>
                        <Scissors className="mr-2 h-4 w-4" />
                        Trim Left
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleOperation(trimRight, 'trim right')}>
                        <Scissors className="mr-2 h-4 w-4" />
                        Trim Right
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => handleOperation(removeExtraSpaces, 'remove extra spaces')}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Extra Spaces
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleOperation(removeLineBreaks, 'remove line breaks')}
                    >
                        <AlignLeft className="mr-2 h-4 w-4" />
                        Remove Line Breaks
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() =>
                            handleOperation(removeDuplicateLines, 'remove duplicate lines')
                        }
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Duplicate Lines
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort & Reverse
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem
                        onClick={() => handleOperation(sortLinesAscending, 'sort lines ascending')}
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort Lines (A-Z)
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() =>
                            handleOperation(sortLinesDescending, 'sort lines descending')
                        }
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort Lines (Z-A)
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleOperation(reverseText, 'reverse text')}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reverse Text
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleOperation(reverseLines, 'reverse lines')}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reverse Lines
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Hash className="mr-2 h-4 w-4" />
                    Remove
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem
                        onClick={() => handleOperation(removeNumbers, 'remove numbers')}
                    >
                        <Hash className="mr-2 h-4 w-4" />
                        Remove Numbers
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() =>
                            handleOperation(removeSpecialChars, 'remove special characters')
                        }
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Special Chars
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Code className="mr-2 h-4 w-4" />
                    Encode/Decode
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem onClick={() => handleOperation(escapeHtml, 'escape HTML')}>
                        <Code className="mr-2 h-4 w-4" />
                        Escape HTML
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleOperation(unescapeHtml, 'unescape HTML')}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        Unescape HTML
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => handleOperation(encodeBase64, 'encode base64')}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        Encode Base64
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => handleOperation(decodeBase64, 'decode base64')}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        Decode Base64
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleOperation(encodeUrl, 'encode URL')}>
                        <Globe className="mr-2 h-4 w-4" />
                        Encode URL
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleOperation(decodeUrl, 'decode URL')}>
                        <Globe className="mr-2 h-4 w-4" />
                        Decode URL
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        </DropdownMenuContent>
    );
}
