'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TextEditor } from '../text-editor/text-editor';
import { useDebouncedSave } from '../shared/use-debounced-save';
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

    // Debounced save to localStorage
    useDebouncedSave(inputText, 'text-convert-input-content');

    const handleConvert = (operation: (text: string) => string, type: string) => {
        setOutputText(operation(inputText));
        setConversionType(type);
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
            {/* Toolbar with conversion buttons and clear button */}
            <div className="flex items-center justify-between gap-2">
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
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        disabled={!inputText && !outputText}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                </div>

                {/* Stats */}
                {conversionType && (
                    <Badge variant="secondary" className="shrink-0">
                        {conversionType}
                    </Badge>
                )}
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
        </div>
    );
}
