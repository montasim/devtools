'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Upload, Download, Image as ImageIcon, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorActions } from '@/components/editor-pane/editor-actions';

export interface Base64ToMediaTabProps {
    onClear?: () => void;
}

export function Base64ToMediaTab({ onClear }: Base64ToMediaTabProps) {
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [base64Output, setBase64Output] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        setFileName(file.name);
        setFileSize(`${(file.size / 1024).toFixed(2)} KB`);

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImageDataUrl(result);
            setBase64Output(result);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect],
    );

    const handleCopy = useCallback(() => {
        if (base64Output) {
            navigator.clipboard.writeText(base64Output);
            toast.success('Copied to clipboard');
        }
    }, [base64Output]);

    const handleDownload = useCallback(() => {
        if (base64Output) {
            const blob = new Blob([base64Output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.replace(/\.[^/.]+$/, '')}_base64.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Downloaded Base64 file');
        }
    }, [base64Output, fileName]);

    const handleClear = useCallback(() => {
        setImageDataUrl(null);
        setBase64Output('');
        setFileName('');
        setFileSize('');
    }, []);

    // Define action buttons for Image Preview section
    const imageActions = useMemo(
        () => [
            {
                id: 'upload',
                icon: Upload,
                label: 'Upload image',
                accept: 'image/*',
                onChange: handleFileInput,
                title: 'Upload image file',
            },
        ],
        [handleFileInput],
    );

    // Define action buttons for Base64 Output section
    const outputActions = useMemo(
        () => [
            {
                id: 'copy',
                icon: Copy,
                label: 'Copy to clipboard',
                onClick: handleCopy,
                title: 'Copy to clipboard',
                disabled: !base64Output,
            },
            {
                id: 'download',
                icon: Download,
                label: 'Download as file',
                onClick: handleDownload,
                title: 'Download as file',
                disabled: !base64Output,
            },
        ],
        [handleCopy, handleDownload, base64Output],
    );

    return (
        <>
            <div className="border-b">
                <div className="mx-auto py-4 px-4">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={onClear || handleClear}>
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Left side - Upload & Preview */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Image Preview
                        </label>
                        {!imageDataUrl && <EditorActions buttons={imageActions} />}
                    </div>

                    {!imageDataUrl ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`border-2 border-dashed rounded-lg flex-1 flex flex-col items-center justify-center p-8 transition-colors ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                            }`}
                            style={{ minHeight: '400px' }}
                        >
                            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                Drag and drop an image here, or click to browse
                            </p>
                            <label>
                                <Button type="button" asChild>
                                    <span>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInput}
                                            className="hidden"
                                        />
                                    </span>
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-4">
                                Supports: PNG, JPEG, GIF, WebP, SVG
                            </p>
                        </div>
                    ) : (
                        <div
                            className="border border-input rounded-lg flex-1 flex flex-col overflow-hidden"
                            style={{ minHeight: '400px' }}
                        >
                            <div className="flex items-center justify-between p-2 border-b bg-muted/20">
                                <span className="text-sm font-medium truncate">{fileName}</span>
                                <span className="text-xs text-muted-foreground">{fileSize}</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center p-4 bg-muted/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageDataUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-[400px] object-contain rounded"
                                />
                            </div>
                            <div className="p-2 border-t bg-muted/20">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    className="w-full"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove Image
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side - Base64 Output */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Base64 Output
                        </label>
                        <EditorActions buttons={outputActions} />
                    </div>

                    <div
                        className="border border-input rounded-md flex-1 overflow-hidden relative"
                        style={{ minHeight: '400px' }}
                    >
                        {base64Output ? (
                            <textarea
                                value={base64Output}
                                readOnly
                                className="w-full h-full resize-none p-3 font-mono text-xs bg-background focus:outline-none"
                                style={{ minHeight: '400px' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <p className="text-sm">Upload an image to generate Base64</p>
                            </div>
                        )}
                    </div>

                    {base64Output && (
                        <div className="mt-2 p-2 bg-muted/20 rounded text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Characters: {base64Output.length.toLocaleString()}</span>
                                <span>Size: {(base64Output.length / 1024).toFixed(2)} KB</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
