'use client';

import { type LucideIcon, Code } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { EditorFooter } from '../../core/components/editor-footer';

interface XmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: LucideIcon;
    showEmptyPrompt?: boolean;
}

export function XmlEditor({
    value,
    onChange,
    placeholder = '',
    readOnly = false,
    emptyTitle = 'No XML data',
    emptyDescription = 'Begin typing, paste content, or upload an XML file',
    emptyIcon = Code,
    showEmptyPrompt,
}: XmlEditorProps) {
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
            <EditorFooter content={value} mode="xml" />
        </div>
    );
}
