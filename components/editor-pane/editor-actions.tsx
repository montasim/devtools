'use client';

import { useState, useCallback } from 'react';
import type { EditorView } from '@codemirror/view';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

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
}

function isFileUploadButton(button: EditorActionButtonConfig): button is EditorFileUploadButton {
    return 'onChange' in button && 'accept' in button;
}

function isEditorActionButton(button: EditorActionButtonConfig): button is EditorActionButton {
    return 'onClick' in button && !('accept' in button);
}

export function EditorActions({ buttons, readOnly = false, editorView }: EditorActionsProps) {
    if (readOnly || !buttons || buttons.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {buttons.map((button) => {
                const Icon = button.icon;

                if (isFileUploadButton(button)) {
                    return (
                        <label key={button.id}>
                            <Button
                                type="button"
                                variant={button.variant || 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                disabled={button.disabled}
                                title={button.title || button.label}
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
                        </label>
                    );
                }

                return (
                    <Button
                        key={button.id}
                        type={button.type || 'button'}
                        variant={button.variant || 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={button.onClick}
                        disabled={button.disabled}
                        title={button.title || button.label}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                );
            })}
        </div>
    );
}
