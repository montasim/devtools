'use client';

import type { EditorView } from '@codemirror/view';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EditorOperationsMenu } from '@/components/editor/editor-operations-menu';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

export interface EditorActionButton {
    id: string;
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    isSearch?: boolean;
}

export interface EditorFileUploadButton {
    id: string;
    icon: LucideIcon;
    label: string;
    accept: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    title?: string;
}

export type EditorActionButtonConfig = EditorActionButton | EditorFileUploadButton;

export interface EditorActionsProps {
    buttons: EditorActionButtonConfig[];
    readOnly?: boolean;
    editorView?: React.MutableRefObject<EditorView | null>;
    content?: string;
    onContentChange?: (newContent: string) => void;
    onError?: (error: string | null) => void;
    onFormat?: () => void;
    onMinify?: () => void;
    onExpand?: () => void;
    onCollapse?: () => void;
    onRemoveNulls?: () => void;
    onRemoveEmptyStrings?: () => void;
    onRemoveEmptyObjects?: () => void;
    onSortKeys?: () => void;
    onFormatDates?: () => void;
    onEscapeUnicode?: () => void;
}

function isFileUploadButton(button: EditorActionButtonConfig): button is EditorFileUploadButton {
    return 'onChange' in button && 'accept' in button;
}

function isEditorActionButton(button: EditorActionButtonConfig): button is EditorActionButton {
    return 'onClick' in button && !('accept' in button);
}

export function EditorActions({
    buttons,
    readOnly = false,
    content = '',
    onContentChange,
    onError,
    onFormat,
    onMinify,
    onExpand,
    onCollapse,
    onRemoveNulls,
    onRemoveEmptyStrings,
    onRemoveEmptyObjects,
    onSortKeys,
    onFormatDates,
    onEscapeUnicode,
}: EditorActionsProps) {
    // Check if there's a more-menu button
    const hasMoreMenu = buttons.some(
        (button) => isEditorActionButton(button) && button.id === 'more-menu',
    );

    if (readOnly || !buttons || buttons.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {buttons.map((button) => {
                const Icon = button.icon;

                // Handle more-menu button with dropdown
                if (isEditorActionButton(button) && button.id === 'more-menu' && hasMoreMenu) {
                    return (
                        <DropdownMenu key={button.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={button.variant || 'ghost'}
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={button.disabled}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{button.title || button.label}</p>
                                </TooltipContent>
                            </Tooltip>
                            <EditorOperationsMenu
                                content={content}
                                onContentChange={onContentChange || (() => {})}
                                onError={onError}
                                onFormat={onFormat}
                                onMinify={onMinify}
                                onExpand={onExpand}
                                onCollapse={onCollapse}
                                onRemoveNulls={onRemoveNulls}
                                onRemoveEmptyStrings={onRemoveEmptyStrings}
                                onRemoveEmptyObjects={onRemoveEmptyObjects}
                                onSortKeys={onSortKeys}
                                onFormatDates={onFormatDates}
                                onEscapeUnicode={onEscapeUnicode}
                            />
                        </DropdownMenu>
                    );
                }

                if (isFileUploadButton(button)) {
                    return (
                        <label key={button.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={button.variant || 'ghost'}
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={button.disabled}
                                        asChild
                                    >
                                        <span>
                                            <Icon className="h-4 w-4" />
                                            <input
                                                type="file"
                                                accept={button.accept}
                                                onChange={button.onChange}
                                                className="hidden"
                                            />
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{button.title || button.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        </label>
                    );
                }

                return (
                    <Tooltip key={button.id}>
                        <TooltipTrigger asChild>
                            <Button
                                type={button.type || 'button'}
                                variant={button.variant || 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={button.onClick}
                                disabled={button.disabled}
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{button.title || button.label}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </div>
    );
}
