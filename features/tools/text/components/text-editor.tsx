'use client';

import { type LucideIcon, Type } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorFooter } from '../../core/components/editor-footer';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: LucideIcon;
    showEmptyPrompt?: boolean;
}

export function TextEditor({
    value,
    onChange,
    placeholder = '',
    readOnly = false,
    emptyTitle = 'No text data',
    emptyDescription = 'Begin typing or paste content to get started',
    emptyIcon = Type,
    showEmptyPrompt,
}: TextEditorProps) {
    const isEmpty = !value || value.trim() === '';
    const shouldShowPrompt =
        isEmpty && showEmptyPrompt !== false && (!readOnly || showEmptyPrompt === true);

    return (
        <div className="relative flex-1">
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[350px] resize-none font-mono text-sm md:min-h-[400px] lg:min-h-[500px]"
                style={{ fieldSizing: 'fixed', overflow: 'auto' }}
                readOnly={readOnly}
            />
            {shouldShowPrompt && (
                <EmptyEditorPrompt
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    showActions={!readOnly}
                    overlay
                />
            )}
            <EditorFooter content={value} mode="text" />
        </div>
    );
}
