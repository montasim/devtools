'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Download, Share2, Trash2, X, Sparkles } from 'lucide-react';
import { TextEditor } from '@/components/text/text-editor/text-editor';
import { TextareaFooter } from '@/components/text/text-editor/textarea-footer';
import { EditorActions } from '@/components/editor/editor-actions';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useDebouncedSave } from '@/components/text/shared/use-debounced-save';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toolbar } from '@/components/toolbar/toolbar';
import {
    trim,
    removeExtraSpaces,
    removeLineBreaks,
    removeDuplicateLines,
    sortLinesAlphabetically,
    sortLinesByLength,
    reverseLines,
    removeEmptyLines,
} from '@/components/text/text-editor/utils/text-operations';
import { STORAGE_KEYS } from '@/lib/constants';

export function TextCleanTab({ onClear }: { onClear?: () => void }) {
    const [inputText, setInputText] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT) || '';
        } catch {
            return '';
        }
    });
    const [outputText, setOutputText] = useState('');
    const [cleanType, setCleanType] = useState<string | null>(null);
    const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Debounced save to localStorage
    useDebouncedSave(inputText, STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT);

    const handleClean = (operation: (text: string) => string, type: string) => {
        setOutputText(operation(inputText));
        setCleanType(type);
        setSelectedOperation(type);
        toast.success(`Applied: ${type}`);
    };

    const handleShare = () => {
        if (!outputText) {
            toast.error('No content to share. Please clean some text first.');
            return;
        }
        setShareDialogOpen(true);
    };

    const handleClearOutput = () => {
        setOutputText('');
        setCleanType(null);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(outputText);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    };

    const handleDownload = () => {
        if (!outputText) return;

        try {
            const blob = new Blob([outputText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cleaned-${cleanType?.toLowerCase().replace(/\s+/g, '-') || 'text'}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download file');
        }
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setCleanType(null);
        try {
            localStorage.removeItem(STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT);
        } catch (error) {
            console.error('Failed to clear clean content:', error);
        }
        onClear?.();
    };

    const handleClearInput = () => {
        setInputText('');
        setOutputText('');
        setCleanType(null);
        try {
            localStorage.removeItem(STORAGE_KEYS.TEXT_CLEAN_INPUT_CONTENT);
        } catch (error) {
            console.error('Failed to clear clean content:', error);
        }
    };

    const cleaningOperations = [
        { name: 'Trim Spaces', operation: trim, description: 'Remove leading and trailing spaces' },
        {
            name: 'Remove Extra Spaces',
            operation: removeExtraSpaces,
            description: 'Replace multiple spaces with single space',
        },
        {
            name: 'Remove Line Breaks',
            operation: removeLineBreaks,
            description: 'Join all lines into one',
        },
        {
            name: 'Remove Empty Lines',
            operation: removeEmptyLines,
            description: 'Remove blank lines',
        },
        {
            name: 'Remove Duplicate Lines',
            operation: removeDuplicateLines,
            description: 'Keep only unique lines',
        },
        {
            name: 'Sort Lines A-Z',
            operation: sortLinesAlphabetically,
            description: 'Sort lines alphabetically',
        },
        {
            name: 'Sort by Length',
            operation: sortLinesByLength,
            description: 'Sort lines by character length',
        },
        { name: 'Reverse Lines', operation: reverseLines, description: 'Reverse line order' },
    ];

    return (
        <div className="">
            <Toolbar
                toggles={cleaningOperations.map(({ name, operation, description }) => ({
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    label: name,
                    checked: selectedOperation === name,
                    onChange: () => {
                        if (selectedOperation === name) {
                            // Deselect if clicking the active one
                            setSelectedOperation(null);
                            setCleanType(null);
                        } else {
                            handleClean(operation, name);
                        }
                    },
                }))}
                actions={[
                    {
                        id: 'clear',
                        label: 'Clear All',
                        onClick: handleClear,
                        variant: 'outline',
                        disabled: !inputText && !outputText,
                    },
                    {
                        id: 'share',
                        label: 'Share',
                        onClick: handleShare,
                        variant: 'outline',
                        disabled: !outputText,
                    },
                ]}
            />

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/2 min-w-0">
                    <TextEditor
                        label="Input Text"
                        value={inputText}
                        onChange={setInputText}
                        onError={() => {}}
                        onClear={handleClearInput}
                        height="600px"
                        showEmptyPrompt={true}
                    />
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />
                <Separator orientation="horizontal" className="block lg:hidden" />

                <div className="w-full lg:w-1/2 min-w-0">
                    <div className="flex flex-col h-full py-2">
                        {/* Header with label and actions */}
                        <div className="flex items-center justify-between mb-2 shrink-0">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Cleaned Output
                            </label>
                            <EditorActions
                                buttons={[
                                    {
                                        id: 'copy',
                                        icon: Copy,
                                        label: 'Copy',
                                        onClick: handleCopy,
                                        disabled: !outputText,
                                        title: 'Copy to clipboard',
                                    },
                                    {
                                        id: 'download',
                                        icon: Download,
                                        label: 'Download',
                                        onClick: handleDownload,
                                        disabled: !outputText,
                                        title: 'Download as file',
                                    },
                                    {
                                        id: 'clear',
                                        icon: X,
                                        label: 'Clear editor',
                                        onClick: handleClearOutput,
                                        disabled: !outputText,
                                        title: 'Clear editor',
                                    },
                                ]}
                            />
                        </div>

                        {/* Textarea container with overlay */}
                        <div
                            className="border border-input rounded-md shrink-0 overflow-hidden relative"
                            style={{ height: '600px', position: 'relative' }}
                        >
                            <textarea
                                value={outputText}
                                readOnly
                                className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />

                            {/* Empty state overlay - shown on top when editor is empty */}
                            {!outputText && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <EmptyEditorPrompt
                                        icon={Sparkles}
                                        title="No cleaned text yet"
                                        description="Select a cleaning operation to clean your text"
                                        showActions={true}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer with statistics */}
                        <div className="shrink-0">
                            <TextareaFooter content={outputText} error={null} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
