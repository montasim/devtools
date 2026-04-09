'use client';

import { Upload, Link2, Search, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EditorActionsProps {
    onClear?: () => void;
    onCopyLink?: () => void;
    onSearch?: () => void;
    onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onMoreMenu?: () => void;
    readOnly?: boolean;
}

export function EditorActions({
    onClear,
    onCopyLink,
    onSearch,
    onUpload,
    onMoreMenu,
    readOnly = false,
}: EditorActionsProps) {
    if (readOnly) {
        return null;
    }

    return (
        <>
            {/* Clear button */}
            {onClear && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClear} title="Clear editor">
                    <X className="h-4 w-4" />
                </Button>
            )}

            {/* Copy link button */}
            {onCopyLink && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onCopyLink} title="Copy link">
                    <Link2 className="h-4 w-4" />
                </Button>
            )}

            {/* Search button */}
            {onSearch && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onSearch} title="Search">
                    <Search className="h-4 w-4" />
                </Button>
            )}

            {/* File upload button */}
            {onUpload && (
                <label>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <span>
                            <Upload className="h-4 w-4" />
                            <input type="file" accept=".json,application/json" onChange={onUpload} className="hidden" />
                        </span>
                    </Button>
                </label>
            )}

            {/* More menu button */}
            {onMoreMenu && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onMoreMenu} title="More options">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            )}
        </>
    );
}
