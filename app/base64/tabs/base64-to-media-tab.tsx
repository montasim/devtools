'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, File, HardDrive, Type, Check, Circle, Download } from 'lucide-react';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorActions } from '@/components/editor/editor-actions';
import { Toolbar } from '@/components/toolbar/toolbar';
import { Base64ShareDialog } from '@/components/base64';
import { STORAGE_KEYS } from '@/lib/constants';
import { PAGE_NAMES, BASE64_TABS } from '@/lib/constants/tabs';

export interface Base64ToMediaTabProps {
    onClear?: () => void;
    sharedData?: any;
}

export function Base64ToMediaTab({ onClear, sharedData }: Base64ToMediaTabProps) {
    // Track if we've loaded shared data
    const sharedDataLoadedRef = useRef(false);

    // Initialize with empty string to avoid hydration mismatch
    const [leftContent, setLeftContent] = useState<string>(() => {
        try {
            // Prioritize shared content if available
            if (sharedData?.tabName === BASE64_TABS.BASE64_TO_MEDIA && sharedData?.state?.leftContent) {
                sharedDataLoadedRef.current = true;
                return sharedData.state.leftContent;
            }
            return '';
        } catch {
            return '';
        }
    });
    const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Track current content for real-time sharing
    const [currentLeftContent, setCurrentLeftContent] = useState('');

    // Track sharedData to detect async arrival
    const sharedDataRef = useRef(sharedData);

    // Load saved data from localStorage after mount
    useEffect(() => {
        setMounted(true);
        try {
            // Only load from localStorage if no shared data was present on mount
            if (!sharedDataLoadedRef.current) {
                const savedInput = localStorage.getItem(STORAGE_KEYS.BASE64_TO_MEDIA_INPUT);
                if (savedInput) setLeftContent(savedInput);
            }
        } catch (error) {
            console.error('Failed to load saved data:', error);
        }
    }, []);

    // Handle async shared data arrival
    useEffect(() => {
        // If shared data just arrived (was undefined/null, now has value)
        if (sharedData?.tabName === BASE64_TABS.BASE64_TO_MEDIA && sharedData?.state?.leftContent && !sharedDataLoadedRef.current) {
            sharedDataLoadedRef.current = true;
            setLeftContent(sharedData.state.leftContent);
        }
        sharedDataRef.current = sharedData;
    }, [sharedData]);

    // Save leftContent to localStorage when it changes
    useEffect(() => {
        if (!mounted) return;
        if (leftContent) {
            try {
                localStorage.setItem(STORAGE_KEYS.BASE64_TO_MEDIA_INPUT, leftContent);
            } catch (error) {
                console.error('Failed to save leftContent:', error);
            }
        }
    }, [leftContent, mounted]);

    // Track current left content for sharing
    useEffect(() => {
        setCurrentLeftContent(leftContent);
    }, [leftContent]);

    // Detect MIME type from magic bytes
    const detectMimeType = useCallback((bytes: Uint8Array): string => {
        // Check for common file signatures
        if (bytes.length < 4) return 'application/octet-stream';

        // PNG
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
            return 'image/png';
        }

        // JPEG
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            return 'image/jpeg';
        }

        // GIF
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return 'image/gif';
        }

        // WebP
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
            return 'image/webp';
        }

        // PDF
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            return 'application/pdf';
        }

        // SVG
        const text = new TextDecoder().decode(bytes.slice(0, 100));
        if (text.includes('<svg') || text.includes('<?xml')) {
            return 'image/svg+xml';
        }

        // Default
        return 'application/octet-stream';
    }, []);

    // Get file extension from MIME type
    const getExtensionFromMimeType = useCallback((mimeType: string): string => {
        const extensions: Record<string, string> = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
            'application/pdf': '.pdf',
            'application/octet-stream': '.bin',
        };
        return extensions[mimeType] || '.bin';
    }, []);

    // Decode Base64 to media - computed value
    const mediaPreview = useMemo(() => {
        if (!leftContent.trim()) {
            return null;
        }

        try {
            // Clean the leftContent - remove whitespace and data URL scheme if present
            const cleanInput = leftContent.trim().replace(/\s/g, '');

            // Check if it's a data URL
            if (cleanInput.startsWith('data:')) {
                const matches = cleanInput.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) {
                    const mimeType = matches[1];
                    const base64Data = matches[2];
                    const decodedData = atob(base64Data);
                    const bytes = new Uint8Array(decodedData.length);
                    for (let i = 0; i < decodedData.length; i++) {
                        bytes[i] = decodedData.charCodeAt(i);
                    }

                    return {
                        dataUrl: cleanInput,
                        mimeType,
                        filename: `decoded_file${getExtensionFromMimeType(mimeType)}`,
                        size: bytes.length,
                    };
                }
            }

            // Try to decode as raw base64
            try {
                const decodedData = atob(cleanInput);
                const bytes = new Uint8Array(decodedData.length);
                for (let i = 0; i < decodedData.length; i++) {
                    bytes[i] = decodedData.charCodeAt(i);
                }

                // Try to detect MIME type from magic bytes
                const mimeType = detectMimeType(bytes);

                return {
                    dataUrl: `data:${mimeType};base64,${cleanInput}`,
                    mimeType,
                    filename: `decoded_file${getExtensionFromMimeType(mimeType)}`,
                    size: bytes.length,
                };
            } catch {
                return null;
            }
        } catch {
            return null;
        }
    }, [leftContent, detectMimeType, getExtensionFromMimeType]);

    const error = useMemo(() => {
        if (!leftContent.trim()) return null;

        try {
            const cleanInput = leftContent.trim().replace(/\s/g, '');

            if (cleanInput.startsWith('data:')) {
                const matches = cleanInput.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) return null;
            }

            // Try to decode
            atob(cleanInput);
            return null;
        } catch {
            return 'Invalid Base64 string';
        }
    }, [leftContent]);

    // Handle file upload - upload a base64 file
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setLeftContent(content);
            toast.success(`File "${file.name}" loaded`);
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
        };

        reader.readAsText(file);
        event.target.value = '';
    }, []);

    // Download decoded media
    const handleDownload = useCallback(() => {
        if (!mediaPreview) return;

        try {
            // Extract base64 data from data URL
            const base64Data = mediaPreview.dataUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const blob = new Blob([byteArray], { type: mediaPreview.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = mediaPreview.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Media downloaded successfully');
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download media');
        }
    }, [mediaPreview]);

    // Handle clear
    const handleClear = useCallback(() => {
        setLeftContent('');
    }, []);

    // Handle share - open share sheet
    const handleShare = useCallback(() => {
        if (!currentLeftContent) {
            toast.error('No Base64 leftContent to share');
            return;
        }
        setIsShareSheetOpen(true);
    }, [currentLeftContent]);

    // Define action buttons for Input Source section
    const leftContentActions = useMemo(
        () => [
            {
                id: 'upload',
                icon: Upload,
                label: 'Upload Base64 file',
                accept: '.txt,.base64,.b64',
                onChange: handleFileUpload,
                title: 'Upload a file containing Base64 text',
            },
            {
                id: 'clear',
                icon: X,
                label: 'Clear all',
                onClick: onClear || handleClear,
                title: 'Clear all',
                disabled: !leftContent && !mediaPreview,
            },
        ],
        [handleFileUpload, leftContent, mediaPreview, onClear, handleClear],
    );

    // Define action buttons for Output section
    const outputActions = useMemo(
        () => [
            {
                id: 'download',
                icon: Download,
                label: 'Download media',
                onClick: handleDownload,
                title: 'Download decoded media',
                disabled: !mediaPreview,
            },
        ],
        [handleDownload, mediaPreview],
    );

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            <Base64ShareDialog
                content={currentLeftContent}
                pageName={PAGE_NAMES.BASE64}
                tabName={BASE64_TABS.BASE64_TO_MEDIA as keyof typeof BASE64_TABS}
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
                        disabled: !leftContent,
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
                        <EditorActions buttons={leftContentActions} />
                    </div>

                    {/* Textarea for Base64 leftContent */}
                    <div className="border border-leftContent rounded-md flex-1 overflow-hidden relative">
                        <textarea
                            value={leftContent}
                            onChange={(e) => setLeftContent(e.target.value)}
                            className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ minHeight: '600px' }}
                        />
                        {!leftContent && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <EmptyEditorPrompt
                                    icon={Upload}
                                    title="Start adding Base64 data"
                                    description="Paste Base64 text or upload a Base64 file to decode"
                                    showActions={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer for Input section */}
                    <div className="shrink-0">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                {leftContent && (
                                    <div className="flex items-center gap-1.5" title="Characters">
                                        <Type className="h-3.5 w-3.5 text-gray-500" />
                                        <span>{leftContent.length.toLocaleString()} chars</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div
                                    className={`flex items-center gap-1.5 py-1 rounded-md text-xs font-medium ${
                                        error
                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                            : leftContent
                                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {error ? (
                                        <X className="h-3.5 w-3.5" />
                                    ) : leftContent ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Circle className="h-3.5 w-3.5" />
                                    )}
                                    <span>{error ? 'Invalid' : leftContent ? 'Ready' : 'Empty'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Output */}
                <div className="flex flex-col h-full flex-1 min-w-0">
                    <div className="flex items-center justify-between my-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Output
                        </label>
                        <EditorActions buttons={outputActions} />
                    </div>

                    {/* Media Preview or Empty State */}
                    <div
                        className="border border-leftContent rounded-md flex-1 overflow-hidden relative bg-background"
                        style={{ minHeight: '600px' }}
                    >
                        {mediaPreview ? (
                            <div className="h-full flex flex-col items-center justify-center p-4">
                                {mediaPreview.mimeType.startsWith('image/') ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={mediaPreview.dataUrl}
                                            alt="Decoded media"
                                            className="max-w-full max-h-[500px] object-contain rounded-lg mb-4"
                                        />
                                        <div className="text-center">
                                            <p className="text-sm font-medium">
                                                {mediaPreview.filename}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {mediaPreview.mimeType} •{' '}
                                                {formatFileSize(mediaPreview.size)}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {mediaPreview.mimeType.includes('pdf') ? (
                                            <FileText className="h-20 w-20 text-muted-foreground mb-4" />
                                        ) : (
                                            <File className="h-20 w-20 text-muted-foreground mb-4" />
                                        )}
                                        <p className="text-sm font-medium mb-1">
                                            {mediaPreview.filename}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {mediaPreview.mimeType} •{' '}
                                            {formatFileSize(mediaPreview.size)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Preview not available for this file type
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : error ? (
                            <div className="h-full flex items-center justify-center p-4">
                                <div className="text-center">
                                    <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                        {error}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Please check your Base64 leftContent and try again
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <EmptyEditorPrompt
                                    icon={HardDrive}
                                    title="Decoded media will appear here"
                                    description="Enter Base64 encoded data to see the decoded media"
                                    showActions={false}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer for Output section */}
                    <div className="shrink-0">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                {mediaPreview ? (
                                    <>
                                        <div
                                            className="flex items-center gap-1.5"
                                            title="File size"
                                        >
                                            <HardDrive className="h-3.5 w-3.5 text-gray-500" />
                                            <span className="font-medium">
                                                {formatFileSize(mediaPreview.size)}
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center gap-1.5"
                                            title="File type"
                                        >
                                            <Type className="h-3.5 w-3.5 text-gray-500" />
                                            <span>{mediaPreview.mimeType}</span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-gray-500">No output</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div
                                    className={`flex items-center gap-1.5 py-1 rounded-md text-xs font-medium ${
                                        error
                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                            : mediaPreview
                                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {error ? (
                                        <X className="h-3.5 w-3.5" />
                                    ) : mediaPreview ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Circle className="h-3.5 w-3.5" />
                                    )}
                                    <span>
                                        {error ? 'Error' : mediaPreview ? 'Decoded' : 'Empty'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
