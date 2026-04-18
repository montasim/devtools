'use client';

import { useState } from 'react';
import { Copy, RotateCcw, Trash2, Eye } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { HistoryItem, HistoryTabConfig } from '../types';

interface HistoryItemCardProps {
    item: HistoryItem;
    config: HistoryTabConfig;
    onRestore: (item: HistoryItem) => void;
    onDelete: (key: string) => void;
    onCopy: (content: string) => void;
}

export function HistoryItemCard({
    item,
    config,
    onRestore,
    onDelete,
    onCopy,
}: HistoryItemCardProps) {
    const [viewOpen, setViewOpen] = useState(false);
    const toolInfo = config.toolMapping[item.tabName];
    const Stats = config.statsComponent;

    return (
        <>
            <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {toolInfo && (
                                <div className={`rounded-md p-1.5 ${toolInfo.color}`}>
                                    <toolInfo.icon className="h-3.5 w-3.5" />
                                </div>
                            )}
                            <p className="font-medium">{toolInfo?.name ?? item.tabName}</p>
                        </div>
                        {Stats && <Stats content={item.content} />}
                        <p className="mt-1 line-clamp-2 truncate font-mono text-sm text-muted-foreground">
                            {item.content.slice(0, 200)}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewOpen(true)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onCopy(item.content)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onRestore(item)}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restore</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => onDelete(item.key)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {toolInfo && (
                                <div className={`rounded-md p-1.5 ${toolInfo.color}`}>
                                    <toolInfo.icon className="h-3.5 w-3.5" />
                                </div>
                            )}
                            {toolInfo?.name ?? item.tabName}
                        </DialogTitle>
                        <DialogDescription>Full content of this history entry</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-auto rounded-lg border bg-muted/50 p-4">
                        <pre className="whitespace-pre-wrap break-all font-mono text-sm">
                            {item.content}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
