'use client';

import {
    Copy,
    FileCode,
    Minimize2,
    Expand,
    Trash2,
    MinusCircle,
    Package,
    ArrowUpDown,
    Calendar,
    Globe,
} from 'lucide-react';
import {
    DropdownMenu,
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
    formatJson,
    minifyJson,
    expandJson,
    collapseJson,
    removeNulls,
    removeEmptyStrings,
    removeEmptyObjects,
    sortKeys,
    formatDates,
    escapeUnicode,
} from '@/components/editor/utils/json-operations';

export interface EditorOperationsMenuProps {
    content: string;
    onContentChange: (newContent: string) => void;
    onError?: (error: string | null) => void;
    onFormat?: () => void;
    onMinify?: () => void;
    onExpand?: () => void;
    onCollapse?: () => void;
    onRemoveNulls?: () => void;
    onRemoveEmptyStrings?: () => void;
    onRemoveEmptyObjects?: () => void;
    onSortKeys?: () => void;
    onFormatDates?: () => void;
    onEscapeUnicode?: () => void;
}

export function EditorOperationsMenu({
    content,
    onContentChange,
    onError,
    onFormat,
    onMinify,
    onExpand,
    onCollapse,
    onRemoveNulls,
    onRemoveEmptyStrings,
    onRemoveEmptyObjects,
    onSortKeys,
    onFormatDates,
    onEscapeUnicode,
}: EditorOperationsMenuProps) {
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
        <DropdownMenuContent align="end" className="w-56 z-[100]">
            <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onFormat || (() => handleOperation(formatJson, 'format'))}>
                <FileCode className="mr-2 h-4 w-4" />
                Format / Prettify
                <DropdownMenuShortcut>⌘⇧F</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onMinify || (() => handleOperation(minifyJson, 'minify'))}>
                <Minimize2 className="mr-2 h-4 w-4" />
                Minify
                <DropdownMenuShortcut>⌘⇧M</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onExpand || (() => handleOperation(expandJson, 'expand'))}>
                <Expand className="mr-2 h-4 w-4" />
                Expand All
                <DropdownMenuShortcut>⌘⇧E</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={onCollapse || (() => handleOperation(collapseJson, 'collapse'))}
            >
                <Minimize2 className="mr-2 h-4 w-4" />
                Collapse All
                <DropdownMenuShortcut>⌘⇧C</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Package className="mr-2 h-4 w-4" />
                    JSON Operations
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem
                        onClick={
                            onRemoveNulls || (() => handleOperation(removeNulls, 'remove nulls'))
                        }
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Nulls
                        <DropdownMenuShortcut>⌘⌥N</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={
                            onRemoveEmptyStrings ||
                            (() => handleOperation(removeEmptyStrings, 'remove empty strings'))
                        }
                    >
                        <MinusCircle className="mr-2 h-4 w-4" />
                        Remove Empty Strings
                        <DropdownMenuShortcut>⌘⌥S</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={
                            onRemoveEmptyObjects ||
                            (() => handleOperation(removeEmptyObjects, 'remove empty objects'))
                        }
                    >
                        <Package className="mr-2 h-4 w-4" />
                        Remove Empty Objects
                        <DropdownMenuShortcut>⌘⌥O</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={onSortKeys || (() => handleOperation(sortKeys, 'sort keys'))}
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort Keys
                        <DropdownMenuShortcut>⌘⌥K</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={
                            onFormatDates || (() => handleOperation(formatDates, 'format dates'))
                        }
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Format Dates
                        <DropdownMenuShortcut>⌘⌥D</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={
                            onEscapeUnicode ||
                            (() => handleOperation(escapeUnicode, 'escape unicode'))
                        }
                    >
                        <Globe className="mr-2 h-4 w-4" />
                        Escape Unicode
                        <DropdownMenuShortcut>⌘⌥U</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        </DropdownMenuContent>
    );
}
