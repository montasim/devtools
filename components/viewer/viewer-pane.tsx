'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download, TreeDeciduous } from 'lucide-react';
import { JsonEditor } from '@/components/editor/json-editor';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useJsonTree } from '@/components/viewer/use-json-tree';
import { JsonTreeView } from '@/components/viewer/json-tree-view';
import type { ViewerPaneProps } from '@/components/viewer/types';
import { STORAGE_KEYS } from '@/lib/constants';

export const ViewerPane = ({
    showTypes = false,
    showPaths = false,
    sortKeys = false,
    onError,
    onValidationChange,
    onContentChange,
    initialContent = '',
    className,
}: ViewerPaneProps) => {
    // Track if we've loaded from localStorage to avoid duplicate saves on mount
    const hasLoadedFromLocalStorageRef = useRef(false);

    // State with simplified initialization: shared content > localStorage > empty
    const [leftContent, setLeftContent] = useState<string>(() => {
        // If initial content is provided, use it
        if (initialContent !== undefined) {
            return initialContent;
        }
        // Otherwise, try to load from localStorage
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEYS.JSON_VIEWER_CONTENT);
                if (saved) {
                    return saved;
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
            }
        }
        return '';
    });

    // Save to localStorage whenever content changes (except for shared content)
    useEffect(() => {
        // Don't save shared content
        if (initialContent !== undefined) {
            return;
        }

        // Don't save on first render if we just loaded from localStorage
        if (!hasLoadedFromLocalStorageRef.current) {
            hasLoadedFromLocalStorageRef.current = true;
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.JSON_VIEWER_CONTENT, leftContent);
        } catch (error) {
            console.error('Failed to save content to localStorage:', error);
        }
    }, [leftContent, initialContent]);

    // Parse JSON tree using props
    const viewerOptions = { showTypes, showPaths, sortKeys };
    const treeResult = useJsonTree(leftContent, viewerOptions);

    // Handle validation changes
    useEffect(() => {
        onValidationChange?.(treeResult.isValid);
    }, [treeResult.isValid, onValidationChange]);

    // Handle errors
    useEffect(() => {
        if (treeResult.error) {
            onError?.(new Error(treeResult.error.message));
        }
    }, [treeResult.error, onError]);

    // Handle content changes
    const handleContentChange = useCallback(
        (content: string) => {
            setLeftContent(content);
            onContentChange?.(content);
        },
        [onContentChange],
    );

    // Handle copy
    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(leftContent);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
            onError?.(error as Error);
        }
    }, [leftContent, onError]);

    // Handle download
    const handleDownload = useCallback(() => {
        try {
            const blob = new Blob([leftContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'viewer.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Downloaded file');
        } catch (error) {
            console.error('Failed to download:', error);
            onError?.(error as Error);
        }
    }, [leftContent, onError]);

    const isDisabled = !treeResult.isValid || !leftContent;

    return (
        <div className={className}>
            {/* Editor Panes */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 min-w-0">
                    <JsonEditor
                        label="JSON Input"
                        value={leftContent}
                        onChange={handleContentChange}
                        onError={() => {}}
                        height="600px"
                        showEmptyPrompt={true}
                    />
                </div>

                <Separator orientation="vertical" className="hidden md:block" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <div className="w-full md:w-1/2 min-w-0 flex flex-col" style={{ height: '650px' }}>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between py-2 shrink-0">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tree View
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleCopy}
                                            disabled={isDisabled}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Copy to clipboard</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleDownload}
                                            disabled={isDisabled}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Download as JSON</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Tree View */}
                    <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto max-w-full flex-1 relative">
                        {treeResult.isValid && treeResult.tree.length > 0 ? (
                            <JsonTreeView
                                nodes={treeResult.tree}
                                showTypes={viewerOptions.showTypes}
                                showPaths={viewerOptions.showPaths}
                            />
                        ) : (
                            <EmptyEditorPrompt
                                icon={TreeDeciduous}
                                title="Start adding JSON data"
                                description="Type, paste, or drag & drop JSON content in the editor to see the tree structure"
                                showActions={false}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
