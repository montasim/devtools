'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Copy, Download, Share2, X, Sparkles } from 'lucide-react';
import { TextEditor } from '@/components/text-tools/text-editor/text-editor';
import { TextareaFooter } from '@/components/text-tools/text-editor/textarea-footer';
import { EditorActions } from '@/components/editor-pane/editor-actions';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { useDebouncedSave } from '@/components/text-tools/shared/use-debounced-save';
import { ConvertShareDialog } from '@/components/text-tools/convert-pane/convert-share-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toolbar } from '@/components/toolbar/toolbar';
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
} from '@/components/text-tools/text-editor/utils/text-operations';
import { STORAGE_KEYS } from '@/lib/constants';

export function ConvertPane() {
    const [inputText, setInputText] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT) || '';
        } catch {
            return '';
        }
    });
    const [outputText, setOutputText] = useState('');
    const [conversionType, setConversionType] = useState<string | null>(null);
    const [selectedConversion, setSelectedConversion] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    // Debounced save to localStorage
    useDebouncedSave(inputText, STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT);

    const handleConvert = (operation: (text: string) => string, type: string, name: string) => {
        setOutputText(operation(inputText));
        setConversionType(type);
        setSelectedConversion(name);
    };

    const handleClearOutput = () => {
        setOutputText('');
        setConversionType(null);
        setSelectedConversion(null);
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
            localStorage.removeItem(STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT);
        } catch (error) {
            console.error('Failed to clear convert content:', error);
        }
    };

    const handleClearInput = () => {
        setInputText('');
        setOutputText('');
        setConversionType(null);
        setSelectedConversion(null);
        try {
            localStorage.removeItem(STORAGE_KEYS.TEXT_CONVERT_INPUT_CONTENT);
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
        <div className="flex flex-col">
            <Toolbar
                toggles={conversions.map(({ name, operation, type }) => ({
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    label: name,
                    checked: selectedConversion === name,
                    onChange: () => {
                        if (selectedConversion === name) {
                            // Deselect if clicking the active one
                            setSelectedConversion(null);
                            setConversionType(null);
                        } else {
                            handleConvert(operation, type, name);
                        }
                    },
                }))}
                actions={[
                    {
                        id: 'clear',
                        label: 'Clear All',
                        onClick: handleClear,
                        variant: 'outline',
                    },
                    {
                        id: 'share',
                        label: 'Share',
                        onClick: handleShare,
                        variant: 'outline',
                        disabled: !outputText,
                    },
                ]}
            />

            {/* Text editors */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-1/2 min-w-0">
                    <TextEditor
                        label="Input"
                        value={inputText}
                        onChange={setInputText}
                        onError={() => {}}
                        onClear={handleClearInput}
                        height="600px"
                        showEmptyPrompt={true}
                    />
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />
                <Separator orientation="horizontal" className="block lg:hidden" />

                <div className="w-full lg:w-1/2 min-w-0 flex flex-col h-full py-2">
                    {/* Output header with toolbar */}
                    <div className="flex items-center justify-between mb-2 shrink-0">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Output
                        </label>
                        <EditorActions
                            buttons={[
                                {
                                    id: 'copy',
                                    icon: Copy,
                                    label: 'Copy',
                                    onClick: handleCopy,
                                    disabled: !outputText,
                                    title: 'Copy output to clipboard',
                                },
                                {
                                    id: 'download',
                                    icon: Download,
                                    label: 'Download',
                                    onClick: handleDownload,
                                    disabled: !outputText,
                                    title: 'Download output as file',
                                },
                                {
                                    id: 'clear',
                                    icon: X,
                                    label: 'Clear editor',
                                    onClick: handleClearOutput,
                                    disabled: !outputText,
                                    title: 'Clear editor',
                                },
                            ]}
                        />
                    </div>

                    {/* Output textarea with overlay */}
                    <div
                        className="border border-input rounded-md shrink-0 overflow-hidden relative"
                        style={{ height: '600px', position: 'relative' }}
                    >
                        <textarea
                            value={outputText}
                            readOnly
                            className="w-full h-full resize-none p-3 font-mono text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ minHeight: '500px' }}
                        />

                        {/* Empty state overlay - shown on top when editor is empty */}
                        {!outputText && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <EmptyEditorPrompt
                                    icon={Sparkles}
                                    title="No converted text yet"
                                    description="Select a conversion operation to convert your text"
                                    showActions={true}
                                />
                            </div>
                        )}
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
