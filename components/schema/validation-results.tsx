'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ValidationResult } from '@/components/schema/types';

interface ValidationResultsProps {
    result: ValidationResult;
    onCopy?: () => void;
    onDownload?: () => void;
}

export function ValidationResults({ result, onCopy, onDownload }: ValidationResultsProps) {
    const handleCopy = async () => {
        const text = result.isValid
            ? '✓ Valid JSON'
            : result.errors.map((e) => `${e.path}: ${e.message}`).join('\n');
        await navigator.clipboard.writeText(text);
        onCopy?.();
    };

    const handleDownload = () => {
        const text = result.isValid
            ? '✓ Valid JSON'
            : result.errors.map((e) => `${e.path}: ${e.message}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'validation-results.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onDownload?.();
    };

    if (result.errors.length === 0) {
        return (
            <div className="w-full flex flex-col" style={{ height: '300px' }}>
                <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto flex-1 flex items-center justify-center">
                    <div className="text-green-600 dark:text-green-400 text-center">
                        <div className="text-4xl mb-2">✓</div>
                        <div className="font-medium">Valid JSON</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t w-full flex flex-col" style={{ height: '600px' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between py-2 shrink-0">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Validation Results
                </label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopy}
                        title="Copy results"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleDownload}
                        title="Download results"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Errors List */}
            <div className="border border-gray-300 rounded-md dark:border-gray-600 p-4 overflow-auto flex-1">
                <div className="space-y-3">
                    {result.errors.map((error, index) => (
                        <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                            <div className="font-mono text-sm text-red-600 dark:text-red-400">
                                {error.path}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 mt-1">
                                {error.message}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Expected: {error.expected}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Actual: {JSON.stringify(error.actual)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
