'use client';

import { useState, type ComponentType, type ReactNode } from 'react';
import { Eye, RotateCcw, Copy, Trash } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ActionButtonGroup } from '@/components/ui/action-button-group';
import { useConfirmAction } from '@/hooks/use-confirm-action';

interface ToolInfo {
    name: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
}

export interface ContentItemCardProps {
    title: string;
    content: string;
    toolInfo?: ToolInfo;
    subtitle?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
    statsComponent?: ComponentType<{ content: string }>;
    hidePreview?: boolean;
    onCopy: (content: string) => void;
    onRestore: () => void;
    onDelete: () => void;
    restoreLabel?: string;
    deleteLabel?: string;
    restoreDescription?: string;
    deleteDescription?: string;
    viewDialogTitle?: string;
    viewDialogDescription?: string;
    viewDialogBody?: ReactNode;
    onViewClick?: () => void;
}

function truncateContent(content: string, maxLength = 200) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
}

export function ContentItemCard({
    title,
    content,
    toolInfo,
    subtitle,
    header,
    footer,
    className,
    statsComponent: Stats,
    hidePreview,
    onCopy,
    onRestore,
    onDelete,
    restoreLabel = 'Restore Item',
    deleteLabel = 'Delete Item',
    restoreDescription = 'This will replace your current editor content. Continue?',
    deleteDescription = 'This action cannot be undone. Are you sure you want to delete this item?',
    viewDialogTitle,
    viewDialogDescription = 'Full content of this entry',
    viewDialogBody,
    onViewClick,
}: ContentItemCardProps) {
    const { confirm, dialog } = useConfirmAction();
    const [viewOpen, setViewOpen] = useState(false);

    return (
        <>
            <div
                className={`flex-1 min-w-0 border rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors overflow-hidden ${className || ''}`}
            >
                {header}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        {toolInfo && (
                            <toolInfo.icon className={`w-4 h-4 shrink-0 ${toolInfo.color}`} />
                        )}
                        <h3 className="font-semibold truncate text-sm">{title}</h3>
                    </div>

                    <ActionButtonGroup
                        actions={[
                            {
                                icon: Eye,
                                onClick: () => {
                                    if (onViewClick) {
                                        onViewClick();
                                    } else {
                                        setViewOpen(true);
                                    }
                                },
                                title: 'View full content',
                            },
                            {
                                icon: Copy,
                                onClick: () => onCopy(content),
                                title: 'Copy to clipboard',
                            },
                            {
                                icon: RotateCcw,
                                onClick: () =>
                                    confirm(onRestore, {
                                        title: restoreLabel,
                                        description: restoreDescription,
                                        confirmLabel: 'Restore',
                                    }),
                                title: 'Restore to tool',
                            },
                            {
                                icon: Trash,
                                onClick: () =>
                                    confirm(onDelete, {
                                        title: deleteLabel,
                                        description: deleteDescription,
                                        confirmLabel: 'Delete',
                                        variant: 'destructive',
                                    }),
                                title: 'Delete',
                                className: 'text-destructive hover:text-destructive',
                            },
                        ]}
                    />
                </div>

                {subtitle && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {subtitle}
                    </div>
                )}

                {Stats && <Stats content={content} />}

                {!hidePreview && (
                    <pre className="text-xs p-3 rounded-md overflow-x-auto max-h-32 overflow-y-auto">
                        <code className="break-all">{truncateContent(content)}</code>
                    </pre>
                )}

                {footer}
            </div>

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-h-[85vh] overflow-hidden w-[90vw] max-w-[90vw] sm:max-w-4xl">
                    <DialogHeader className="border-b">
                        <DialogTitle className="flex items-center gap-2">
                            {toolInfo && (
                                <toolInfo.icon className={`w-4 h-4 shrink-0 ${toolInfo.color}`} />
                            )}
                            {viewDialogTitle ?? title}
                        </DialogTitle>
                        <DialogDescription>{viewDialogDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        {viewDialogBody ?? (
                            <pre className="text-sm p-4 rounded-md overflow-auto">
                                <code>{content}</code>
                            </pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {dialog}
        </>
    );
}
