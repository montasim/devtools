'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText } from 'lucide-react';

interface Column<T> {
    key: string;
    label: string;
    render: (item: T) => string;
}

interface DownloadButtonProps<T> {
    data: T[];
    columns: Column<T>[];
    filename: string;
}

export function DownloadButton<T>({ data, columns, filename }: DownloadButtonProps<T>) {
    const handleDownload = useCallback(
        (format: 'json' | 'text') => {
            const rows = data.map((item, i) => {
                const row: Record<string, string> = { '#': String(i + 1) };
                for (const col of columns) {
                    row[col.label] = col.render(item);
                }
                return row;
            });

            const content =
                format === 'json'
                    ? JSON.stringify(rows, null, 2)
                    : rows.map((row) => Object.values(row).join(' | ')).join('\n');

            const blob = new Blob([content], {
                type: format === 'json' ? 'application/json' : 'text/plain',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${format === 'json' ? 'json' : 'txt'}`;
            a.click();
            URL.revokeObjectURL(url);
        },
        [data, columns, filename],
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-auto px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted/50"
                >
                    <Download className="h-3.5 w-3.5" />
                    Download
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onClick={() => handleDownload('json')}>
                    <FileJson className="mr-2 h-4 w-4" />
                    Download as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('text')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Download as Text
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
