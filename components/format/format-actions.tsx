'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormatActionsProps {
    formattedContent: string;
    isValid: boolean;
    onCopySuccess?: () => void;
    onDownloadSuccess?: () => void;
    onCopyError?: (error: Error) => void;
    onDownloadError?: (error: Error) => void;
}

export const FormatActions = ({
    formattedContent,
    isValid,
    onCopySuccess,
    onDownloadSuccess,
    onCopyError,
    onDownloadError,
}: FormatActionsProps) => {
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedContent);
            onCopySuccess?.();
        } catch (error) {
            onCopyError?.(error as Error);
        }
    };

    const handleDownload = () => {
        try {
            const blob = new Blob([formattedContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formatted.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            onDownloadSuccess?.();
        } catch (error) {
            onDownloadError?.(error as Error);
        }
    };

    const isDisabled = !isValid || !formattedContent;

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={isDisabled}
                className="gap-2"
            >
                <Copy className="w-4 h-4" />
                Copy
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDisabled}
                className="gap-2"
            >
                <Download className="w-4 h-4" />
                Download
            </Button>
        </div>
    );
};
