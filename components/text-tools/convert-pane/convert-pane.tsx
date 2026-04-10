'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Copy, Download, Share2 } from 'lucide-react';
import { TextEditor } from '../text-editor/text-editor';
import { TextareaFooter } from '../text-editor/textarea-footer';
import { useDebouncedSave } from '../shared/use-debounced-save';
import { ConvertShareDialog } from './convert-share-dialog';
import { Button } from '@/components/ui/button';
import {
    toUpperCase,
    toLowerCase,
    toTitleCase,
    toSentenceCase,
    toCapitalizedCase,
    toKebabCase,
    toSnakeCase,
    toCamelCase,
    toPascalCase,
    toConstantCase,
    toDotCase,
    toSlugCase,
    toAlternatingCase,
    toInverseCase,
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
    const [selectedConversion, setSelectedConversion] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Debounced save to localStorage
    useDebouncedSave(inputText, 'text-convert-input-content');

    const handleConvert = (operation: (text: string) => string, type: string, name: string) => {
        setOutputText(operation(inputText));
        setConversionType(type);
        setSelectedConversion(name);
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
            a.download = `converted-${conversionType?.toLowerCase().replace(/\s+/g, '-') || 'text'}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download:', error);
            toast.error('Failed to download file');
        }
    };

    const handleShare = () => {
        if (!outputText) {
            toast.error('No content to share. Please convert some text first.');
            return;
        }
        setShareDialogOpen(true);
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setConversionType(null);
        setSelectedConversion(null);
        try {
            localStorage.removeItem('text-convert-input-content');
        } catch (error) {
            console.error('Failed to clear convert content:', error);
        }
    };

    const conversions = [
        { name: 'UPPERCASE', operation: toUpperCase, type: 'UPPERCASE' },
        { name: 'lowercase', operation: toLowerCase, type: 'lowercase' },
        { name: 'Capitalized Case', operation: toCapitalizedCase, type: 'Capitalized Case' },
        { name: 'Title Case', operation: toTitleCase, type: 'Title Case' },
        { name: 'Sentence case', operation: toSentenceCase, type: 'Sentence case' },
        { name: 'kebab-case', operation: toKebabCase, type: 'kebab-case' },
        { name: 'snake_case', operation: toSnakeCase, type: 'snake_case' },
        { name: 'camelCase', operation: toCamelCase, type: 'camelCase' },
        { name: 'PascalCase', operation: toPascalCase, type: 'PascalCase' },
        { name: 'CONSTANT_CASE', operation: toConstantCase, type: 'CONSTANT_CASE' },
        { name: 'dot.case', operation: toDotCase, type: 'dot.case' },
        { name: 'slug-case', operation: toSlugCase, type: 'slug-case' },
        { name: 'aLtErNaTiNg cAsE', operation: toAlternatingCase, type: 'aLtErNaTiNg cAsE' },
        { name: 'InVeRsE CaSe', operation: toInverseCase, type: 'InVeRsE CaSe' },
        { name: 'Trim', operation: trim, type: 'Trim' },
        { name: 'Remove Extra Spaces', operation: removeExtraSpaces, type: 'Remove Extra Spaces' },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar with conversion buttons and action buttons */}
            <div className="flex items-center justify-between gap-2">
                {/* Left side: Conversion buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {conversions.map(({ name, operation, type }) => (
                        <Button
                            key={name}
                            variant={selectedConversion === name ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleConvert(operation, type, name)}
                            disabled={!inputText}
                        >
                            {name}
                        </Button>
                    ))}
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center gap-2">
                    {/* Clear all button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        disabled={!inputText && !outputText}
                        title="Clear all content"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>

                    {/* Share button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={!outputText}
                        title="Share converted text"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Text editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t">
                <TextEditor
                    label="Input"
                    value={inputText}
                    onChange={setInputText}
                    onError={() => {}}
                    height="500px"
                />
                <div className="flex flex-col h-full py-2">
                    {/* Output header with toolbar */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Output
                        </label>
                        <div className="flex items-center gap-2">
                            {/* Action buttons - matching TextEditor button styling */}
                            <button
                                type="button"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleCopy}
                                disabled={!outputText}
                                title="Copy output to clipboard"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleDownload}
                                disabled={!outputText}
                                title="Download output as file"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Output textarea */}
                    <div
                        className="border border-input rounded-md shrink-0 overflow-hidden"
                        style={{ height: '500px' }}
                    >
                        <textarea
                            value={outputText}
                            readOnly
                            className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ minHeight: '500px' }}
                        />
                    </div>

                    {/* Output footer */}
                    <div className="shrink-0">
                        <TextareaFooter content={outputText} error={null} />
                    </div>
                </div>
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
