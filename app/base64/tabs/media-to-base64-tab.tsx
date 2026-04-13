'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    Upload,
    Link2,
    X,
    FileText,
    File,
    HardDrive,
    Type,
    Check,
    Circle,
    Copy,
} from 'lucide-react';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorActions } from '@/components/editor/editor-actions';
import { EditorFooter } from '@/components/editor';
import { Toolbar } from '@/components/toolbar/toolbar';
import { Base64ShareDialog } from '@/components/base64';
import { STORAGE_KEYS } from '@/lib/constants';
import { PAGE_NAMES, BASE64_TABS } from '@/lib/constants/tabs';

export interface MediaToBase64TabProps {
    onClear?: () => void;
    sharedData?: { tabName?: string; state?: { leftContent?: string; rightContent?: string } };
}

export function MediaToBase64Tab({ onClear, sharedData }: MediaToBase64TabProps) {
    // Track if we've loaded shared data
    const sharedDataLoadedRef = useRef(false);

    // Initialize with empty string to avoid hydration mismatch
    const [leftContent, setLeftContent] = useState<string>(() => {
        try {
            // Prioritize shared content if available
            if (
                sharedData?.tabName === BASE64_TABS.MEDIA_TO_BASE64 &&
                sharedData?.state?.leftContent
            ) {
                sharedDataLoadedRef.current = true;
                return sharedData.state.leftContent;
            }
            return '';
        } catch {
            return '';
        }
    });
    const [rightContent, setRightContent] = useState<string>(() => {
        try {
            // Prioritize shared content if available
            if (
                sharedData?.tabName === BASE64_TABS.MEDIA_TO_BASE64 &&
                sharedData?.state?.rightContent
            ) {
                return sharedData.state.rightContent;
            }
            return '';
        } catch {
            return '';
        }
    });
    const [isFetching, setIsFetching] = useState(false);
    const [filePreview, setFilePreview] = useState<{
        dataUrl: string;
        name: string;
        type: string;
        size: string;
    } | null>(null);
    const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Track current content for real-time sharing
    const [currentRightContent, setCurrentRightContent] = useState('');
    const [currentLeftContent, setCurrentLeftContent] = useState('');

    // Track sharedData to detect async arrival
    const sharedDataRef = useRef(sharedData);

    // Load saved data from localStorage after mount
    useEffect(() => {
        setMounted(true);
        try {
            // Only load from localStorage if no shared data was present on mount
            if (!sharedDataLoadedRef.current) {
                const savedInput = localStorage.getItem(STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT);
                const savedOutput = localStorage.getItem(
                    STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT,
                );
                if (savedInput) setLeftContent(savedInput);
                if (savedOutput) setRightContent(savedOutput);
            }
        } catch (error) {
            console.error('Failed to load saved data:', error);
        }
    }, []);

    // Handle async shared data arrival
    useEffect(() => {
        // If shared data just arrived (was undefined/null, now has value)
        if (
            sharedData?.tabName === BASE64_TABS.MEDIA_TO_BASE64 &&
            sharedData?.state &&
            !sharedDataLoadedRef.current
        ) {
            sharedDataLoadedRef.current = true;
            if (sharedData.state.leftContent) setLeftContent(sharedData.state.leftContent);
            if (sharedData.state.rightContent) setRightContent(sharedData.state.rightContent);
        }
        sharedDataRef.current = sharedData;
    }, [sharedData]);

    // Save leftContent to localStorage when it changes
    useEffect(() => {
        if (!mounted) return;
        if (leftContent) {
            try {
                localStorage.setItem(STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_INPUT, leftContent);
            } catch (error) {
                console.error('Failed to save input:', error);
            }
        }
    }, [leftContent, mounted]);

    // Save rightContent to localStorage when it changes
    useEffect(() => {
        if (!mounted) return;
        if (rightContent) {
            try {
                localStorage.setItem(STORAGE_KEYS.BASE64_MEDIA_TO_BASE64_OUTPUT, rightContent);
            } catch (error) {
                console.error('Failed to save rightContent:', error);
            }
        }
    }, [rightContent, mounted]);

    // Track current right content for sharing
    useEffect(() => {
        setCurrentRightContent(rightContent);
    }, [rightContent]);

    // Track current left content for sharing
    useEffect(() => {
        setCurrentLeftContent(leftContent);
    }, [leftContent]);

    // Fetch URL and convert to Base64
    const handleUrlFetch = useCallback(async () => {
        const urlInput = prompt('Enter URL to fetch and convert to Base64:');

        if (!urlInput || !urlInput.trim()) {
            return;
        }

        // Validate URL
        let url: URL;
        try {
            url = new URL(urlInput.trim());
        } catch {
            toast.error('Invalid URL format');
            return;
        }

        // Check for CORS
        if (!url.protocol.startsWith('http')) {
            toast.error('Only HTTP/HTTPS URLs are supported');
            return;
        }

        setIsFetching(true);
        setLeftContent(`Fetching: ${urlInput}`);

        try {
            const response = await fetch(urlInput, {
                method: 'GET',
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                setLeftContent(urlInput);
                setRightContent(base64Data);

                // Set preview if it's an image
                if (blob.type.startsWith('image/')) {
                    setFilePreview({
                        dataUrl: result,
                        name: urlInput.split('/').pop() || 'fetched-file',
                        type: blob.type,
                        size: `${(blob.size / 1024).toFixed(2)} KB`,
                    });
                } else {
                    setFilePreview(null);
                }

                toast.success(`Successfully fetched and converted to Base64`);
                setIsFetching(false);
            };

            reader.onerror = () => {
                toast.error('Failed to convert response to Base64');
                setIsFetching(false);
            };

            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Fetch error:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                toast.error('CORS error: The URL does not allow cross-origin requests');
            } else {
                toast.error(error instanceof Error ? error.message : 'Failed to fetch URL');
            }
            setLeftContent('');
            setIsFetching(false);
        }
    }, []);

    // Handle file upload for encoding - any file type
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            // Always generate Base64 rightContent from any file
            const base64Data = result.split(',')[1];
            setLeftContent(file.name); // Show filename as input
            setRightContent(base64Data);

            // Store file preview data
            setFilePreview({
                dataUrl: result,
                name: file.name,
                type: file.type,
                size: `${(file.size / 1024).toFixed(2)} KB`,
            });

            toast.success(`File "${file.name}" converted to Base64`);
        };

        // Always read as data URL to get Base64
        reader.readAsDataURL(file);
        event.target.value = '';
    }, []);

    // Handle copy to clipboard
    const handleCopy = useCallback(() => {
        if (rightContent) {
            navigator.clipboard.writeText(rightContent);
            toast.success('Copied to clipboard');
        }
    }, [rightContent]);

    // Handle share - open share sheet
    const handleShare = useCallback(() => {
        if (!currentRightContent) {
            toast.error('No Base64 output to share');
            return;
        }
        setIsShareSheetOpen(true);
    }, [currentRightContent]);

    // Handle clear
    const handleClear = useCallback(() => {
        setLeftContent('');
        setRightContent('');
        setFilePreview(null);
    }, []);

    // Define action buttons for Input Source section
    const inputActions = useMemo(
        () => [
            {
                id: 'upload',
                icon: Upload,
                label: 'Upload file',
                accept: '*/*',
                onChange: handleFileUpload,
                title: 'Upload any file',
            },
            {
                id: 'fetch-url',
                icon: Link2,
                label: 'Fetch from URL',
                onClick: handleUrlFetch,
                title: 'Fetch from URL',
                disabled: isFetching,
            },
            {
                id: 'clear',
                icon: X,
                label: 'Clear all',
                onClick: onClear || handleClear,
                title: 'Clear all',
                disabled: !leftContent && !rightContent,
            },
        ],
        [
            handleFileUpload,
            handleUrlFetch,
            isFetching,
            leftContent,
            rightContent,
            onClear,
            handleClear,
        ],
    );

    // Define action buttons for Base64 Output section
    const rightContentActions = useMemo(
        () => [
            {
                id: 'copy',
                icon: Copy,
                label: 'Copy to clipboard',
                onClick: handleCopy,
                title: 'Copy to clipboard',
                disabled: !rightContent,
            },
        ],
        [handleCopy, rightContent],
    );

    return (
        <>
            <Base64ShareDialog
                content={currentRightContent}
                leftContent={currentLeftContent}
                pageName={PAGE_NAMES.BASE64}
                tabName={BASE64_TABS.MEDIA_TO_BASE64}
                open={isShareSheetOpen}
                onOpenChange={setIsShareSheetOpen}
            />

            <Toolbar
                actions={[
                    {
                        id: 'clear',
                        label: 'Clear All',
                        onClick: onClear || handleClear,
                        variant: 'outline',
                    },
                    {
                        id: 'share',
                        label: 'Share',
                        onClick: handleShare,
                        variant: 'outline',
                        disabled: !rightContent,
                    },
                ]}
            />

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Left side - Input */}
                <div className="flex flex-col h-full flex-1 min-w-0 lg:pr-4 lg:border-r">
                    <div className="flex items-center justify-between my-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Input Source
                        </label>
                        <EditorActions buttons={inputActions} />
                    </div>

                    {/* File Preview or Textarea */}
                    {filePreview ? (
                        <div
                            className="border border-input rounded-md flex-1 overflow-hidden relative bg-muted/20"
                            style={{ minHeight: '600px' }}
                        >
                            <div className="h-full flex flex-col items-center justify-center p-4">
                                {filePreview.type.startsWith('image/') ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={filePreview.dataUrl}
                                            alt={filePreview.name}
                                            className="max-w-full max-h-[320px] object-contain rounded-lg mb-4"
                                        />
                                        <div className="text-center">
                                            <p className="text-sm font-medium">
                                                {filePreview.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {filePreview.type} • {filePreview.size}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {filePreview.type.includes('pdf') ? (
                                            <FileText className="h-20 w-20 text-muted-foreground mb-4" />
                                        ) : (
                                            <File className="h-20 w-20 text-muted-foreground mb-4" />
                                        )}
                                        <p className="text-sm font-medium mb-1">
                                            {filePreview.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {filePreview.type} • {filePreview.size}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="border border-input rounded-md flex-1 overflow-hidden relative">
                            <textarea
                                value={leftContent}
                                onChange={(e) => setLeftContent(e.target.value)}
                                className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                style={{ minHeight: '600px' }}
                                readOnly
                            />
                            {!leftContent && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <EmptyEditorPrompt
                                        icon={Upload}
                                        title="Start adding file data"
                                        description="Upload a file or fetch from URL to generate Base64"
                                        showActions={true}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer for Input section */}
                    <div className="shrink-0">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                {filePreview ? (
                                    <>
                                        <div
                                            className="flex items-center gap-1.5"
                                            title="File size"
                                        >
                                            <HardDrive className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="font-medium">{filePreview.size}</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-1.5"
                                            title="File type"
                                        >
                                            <Type className="h-3.5 w-3.5 text-gray-500" />
                                            <span>{filePreview.type || 'Unknown'}</span>
                                        </div>
                                    </>
                                ) : leftContent ? (
                                    <div className="flex items-center gap-1.5" title="URL">
                                        <Type className="h-3.5 w-3.5 text-gray-500" />
                                        <span>{leftContent}</span>
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div
                                    className={`flex items-center gap-1.5 py-1 rounded-md text-xs font-medium ${
                                        filePreview || leftContent
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {filePreview || leftContent ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Circle className="h-3.5 w-3.5" />
                                    )}
                                    <span>{filePreview || leftContent ? 'Ready' : 'Empty'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Output */}
                <div className="flex flex-col h-full flex-1 min-w-0">
                    <div className="flex items-center justify-between my-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Base64 Output
                        </label>
                        <EditorActions buttons={rightContentActions} />
                    </div>

                    <div className="border border-input rounded-md flex-1 overflow-hidden relative">
                        <textarea
                            value={rightContent}
                            readOnly
                            className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ minHeight: '600px' }}
                        />
                        {!rightContent && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <EmptyEditorPrompt
                                    icon={HardDrive}
                                    title="Base64 rightContent will appear here"
                                    description="Upload a file or fetch from URL to see the Base64 rightContent"
                                    showActions={false}
                                />
                            </div>
                        )}
                    </div>

                    <div className="shrink-0">
                        <EditorFooter content={rightContent} error={null} />
                    </div>
                </div>
            </div>
        </>
    );
}
