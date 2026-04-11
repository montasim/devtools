'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Copy, Download, TreeDeciduous } from 'lucide-react';
import { JsonEditor } from '../editor-pane/json-editor';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useJsonTree } from './use-json-tree';
import { JsonTreeView } from './json-tree-view';
import type { ViewerPaneProps, ViewerOptions } from './types';
import { STORAGE_KEYS } from '@/lib/constants';

export const ViewerPane = ({
    showTypes = false,
    showPaths = false,
    sortKeys = false,
    onError,
    onValidationChange,
    initialContent = '',
    className,
}: ViewerPaneProps) => {
    // State with lazy initialization from localStorage
    const [leftContent, setLeftContent] = useState<string>(() => {
        if (initialContent !== '') return initialContent;
        try {
            return localStorage.getItem(STORAGE_KEYS.JSON_VIEWER_CONTENT) || initialContent;
        } catch {
            return initialContent;
        }
    });

    // Track initial content to avoid saving it to localStorage
    const initialContentRef = useRef(initialContent);

    useEffect(() => {
        initialContentRef.current = initialContent;
    }, [initialContent]);

    // Save to localStorage whenever content changes (but not on initial render)
    useEffect(() => {
        // Only save if content is different from initial props
        if (leftContent !== initialContentRef.current) {
            try {
                localStorage.setItem(STORAGE_KEYS.JSON_VIEWER_CONTENT, leftContent);
            } catch (error) {
                console.error('Failed to save content to localStorage:', error);
            }
        }
    }, [leftContent]);

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
                        onChange={setLeftContent}
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCopy}
                                    disabled={isDisabled}
                                    title="Copy to clipboard"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleDownload}
                                    disabled={isDisabled}
                                    title="Download as JSON"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
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
