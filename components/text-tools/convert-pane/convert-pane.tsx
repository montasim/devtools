'use client';

import { useState } from 'react';
import { Trash2, Copy, Download, Share2 } from 'lucide-react';
import { TextEditor } from '../text-editor/text-editor';
import { useDebouncedSave } from '../shared/use-debounced-save';
import { ConvertShareDialog } from './convert-share-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    toUpperCase,
    toLowerCase,
    toTitleCase,
    toSentenceCase,
    trim,
    removeExtraSpaces,
} from '../text-editor/utils/text-operations';

export function ConvertPane() {
    const [inputText, setInputText] = useState(() => {
        try {
            return localStorage.getItem('text-convert-input-content') || '';
        } catch {
            return '';
        }
    });
    const [outputText, setOutputText] = useState('');
    const [conversionType, setConversionType] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Debounced save to localStorage
    useDebouncedSave(inputText, 'text-convert-input-content');

    const handleConvert = (operation: (text: string) => string, type: string) => {
        setOutputText(operation(inputText));
        setConversionType(type);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(outputText);
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy to clipboard');
        }
    };

    const handleDownload = () => {
        if (!outputText) return;

        try {
            const blob = new Blob([outputText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted-${conversionType?.toLowerCase().replace(/\s+/g, '-') || 'text'}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download:', error);
            alert('Failed to download file');
        }
    };

    const handleShare = () => {
        if (!outputText) {
            alert('No content to share. Please convert some text first.');
            return;
        }
        setShareDialogOpen(true);
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setConversionType(null);
        try {
            localStorage.removeItem('text-convert-input-content');
        } catch (error) {
            console.error('Failed to clear convert content:', error);
        }
    };

    const conversions = [
        { name: 'UPPERCASE', operation: toUpperCase, type: 'UPPERCASE' },
        { name: 'lowercase', operation: toLowerCase, type: 'lowercase' },
        { name: 'Title Case', operation: toTitleCase, type: 'Title Case' },
        { name: 'Sentence case', operation: toSentenceCase, type: 'Sentence case' },
        { name: 'Trim', operation: trim, type: 'Trim' },
        { name: 'Remove Extra Spaces', operation: removeExtraSpaces, type: 'Remove Extra Spaces' },
    ];

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Toolbar with conversion buttons and action buttons */}
            <div className="flex items-center justify-between gap-2">
                {/* Left side: Conversion buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {conversions.map(({ name, operation, type }) => (
                        <Button
                            key={name}
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvert(operation, type)}
                            disabled={!inputText}
                            className="whitespace-nowrap"
                        >
                            {name}
                        </Button>
                    ))}
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center gap-2">
                    {/* Conversion type badge */}
                    {conversionType && (
                        <>
                            <Badge variant="secondary" className="shrink-0">
                                {conversionType}
                            </Badge>
                            <Separator orientation="vertical" className="h-6" />
                        </>
                    )}

                    {/* Copy output button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!outputText}
                        title="Copy output to clipboard"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>

                    {/* Download output button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!outputText}
                        title="Download output as file"
                    >
                        <Download className="h-4 w-4" />
                    </Button>

                    {/* Share button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={!outputText}
                        title="Share converted text"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Clear all button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        disabled={!inputText && !outputText}
                        title="Clear all content"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Text editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextEditor
                    label="Input"
                    value={inputText}
                    onChange={setInputText}
                    onError={() => {}}
                    height="500px"
                />
                <TextEditor
                    label="Output"
                    value={outputText}
                    onChange={setOutputText}
                    onError={() => {}}
                    readOnly
                    height="500px"
                />
            </div>

            {/* Share dialog */}
            <ConvertShareDialog
                inputContent={inputText}
                outputContent={outputText}
                conversionType={conversionType}
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
            />
        </div>
    );
}
