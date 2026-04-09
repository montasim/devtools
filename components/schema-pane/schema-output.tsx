'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface SchemaOutputProps {
    schema: string;
    isValid: boolean;
    error?: string | null;
    onCopy?: () => void;
    onDownload?: () => void;
}

export function SchemaOutput({ schema, isValid, error, onCopy, onDownload }: SchemaOutputProps) {
    const handleCopy = async () => {
        if (schema) {
            await navigator.clipboard.writeText(schema);
            onCopy?.();
        }
    };

    const handleDownload = () => {
        if (schema) {
            const blob = new Blob([schema], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'schema.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            onDownload?.();
        }
    };

    return (
        <div className="w-full flex flex-col" style={{ height: '650px' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between py-2 shrink-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generated Schema
                </label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopy}
                        disabled={!isValid || !schema}
                        title="Copy to clipboard"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleDownload}
                        disabled={!isValid || !schema}
                        title="Download schema"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Schema Output */}
            <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto flex-1">
                {isValid && schema ? (
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all font-mono">
                        {schema}
                    </pre>
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        {error ? (
                            <div className="text-red-500">
                                <div className="font-medium">Invalid JSON</div>
                                <div className="text-sm mt-1">{error}</div>
                            </div>
                        ) : (
                            'Enter JSON to generate schema'
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
