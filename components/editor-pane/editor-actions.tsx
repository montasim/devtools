'use client';

import { useState, useCallback, useMemo } from 'react';
import type { EditorView } from '@codemirror/view';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X, ChevronUp, ChevronDown } from 'lucide-react';

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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    // Find all matches in the editor content
    const findMatches = useCallback(
        (term: string): number[] => {
            if (!editorView?.current || !term.trim()) {
                return [];
            }

            const content = editorView.current.state.doc.toString();
            const matches: number[] = [];
            let index = 0;

            while ((index = content.indexOf(term, index)) !== -1) {
                matches.push(index);
                index += term.length;
            }

            return matches;
        },
        [editorView]
    );

    // Navigate to a specific match
    const navigateToMatch = useCallback(
        (position: number) => {
            if (!editorView?.current) return;

            const view = editorView.current;
            view.dispatch({
                selection: {
                    anchor: position,
                    head: position + searchTerm.length,
                },
                scrollIntoView: true,
            });
        },
        [editorView, searchTerm]
    );

    // Handle search input change
    const handleSearchChange = useCallback(
        (term: string) => {
            setSearchTerm(term);

            if (!term.trim()) {
                setTotalMatches(0);
                setCurrentMatchIndex(0);
                // Clear selection
                if (editorView?.current) {
                    const view = editorView.current;
                    view.dispatch({
                        selection: {
                            anchor: view.state.selection.main.anchor,
                            head: view.state.selection.main.anchor,
                        },
                    });
                }
                return;
            }

            const matches = findMatches(term);
            setTotalMatches(matches.length);

            if (matches.length > 0) {
                setCurrentMatchIndex(0);
                navigateToMatch(matches[0]);
            }
        },
        [findMatches, navigateToMatch, editorView]
    );

    // Navigate to next match
    const goToNextMatch = useCallback(() => {
        if (totalMatches === 0) return;

        const nextIndex = (currentMatchIndex + 1) % totalMatches;
        setCurrentMatchIndex(nextIndex);

        const matches = findMatches(searchTerm);
        if (matches[nextIndex] !== undefined) {
            navigateToMatch(matches[nextIndex]);
        }
    }, [currentMatchIndex, totalMatches, searchTerm, findMatches, navigateToMatch]);

    // Navigate to previous match
    const goToPreviousMatch = useCallback(() => {
        if (totalMatches === 0) return;

        const prevIndex = currentMatchIndex === 0 ? totalMatches - 1 : currentMatchIndex - 1;
        setCurrentMatchIndex(prevIndex);

        const matches = findMatches(searchTerm);
        if (matches[prevIndex] !== undefined) {
            navigateToMatch(matches[prevIndex]);
        }
    }, [currentMatchIndex, totalMatches, searchTerm, findMatches, navigateToMatch]);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setTotalMatches(0);
        setCurrentMatchIndex(0);
        setIsSearchOpen(false);

        // Clear selection
        if (editorView?.current) {
            const view = editorView.current;
            view.dispatch({
                selection: {
                    anchor: view.state.selection.main.anchor,
                    head: view.state.selection.main.anchor,
                },
            });
        }
    }, [editorView]);

    // Handle keyboard events in search input
    const handleSearchKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    goToPreviousMatch();
                } else {
                    goToNextMatch();
                }
            } else if (e.key === 'Escape') {
                clearSearch();
            }
        },
        [goToNextMatch, goToPreviousMatch, clearSearch]
    );

    // Enhanced search button click handler
    const handleSearchClick = useCallback(() => {
        setIsSearchOpen(true);
        // Focus the search input after it's rendered
        setTimeout(() => {
            const searchInput = document.getElementById('editor-search-input');
            searchInput?.focus();
        }, 0);
    }, []);

    if (readOnly || !buttons || buttons.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {isSearchOpen && (
                <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-1">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                        id="editor-search-input"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search..."
                        className="h-7 w-40 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                    />
                    {totalMatches > 0 && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {currentMatchIndex + 1}/{totalMatches}
                        </span>
                    )}
                    {totalMatches > 1 && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={goToPreviousMatch}
                                title="Previous match"
                            >
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={goToNextMatch}
                                title="Next match"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={clearSearch}
                        title="Clear search"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {buttons.map((button) => {
                const Icon = button.icon;

                // Handle search button specially when search is open
                if (isEditorActionButton(button) && button.isSearch && isSearchOpen) {
                    return null; // Don't show search button when search is open
                }

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
                        onClick={isEditorActionButton(button) && button.isSearch ? handleSearchClick : button.onClick}
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
