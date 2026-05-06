'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

interface DataTablePaginationProps {
    page: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination({
    page,
    total,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: DataTablePaginationProps) {
    const totalPages = Math.ceil(total / pageSize);
    const isFirst = page === 0;
    const isLast = page >= totalPages - 1;

    if (totalPages <= 1 && !onPageSizeChange) return null;

    const pages = getPageNumbers(page, totalPages);

    return (
        <div className="flex flex-col gap-2 mx-auto w-full mt-4">
            {totalPages > 1 && (
                <Pagination className="mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => !isFirst && onPageChange(page - 1)}
                                className={
                                    isFirst ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>

                        {pages.map((p, i) =>
                            p === 'ellipsis' ? (
                                <PaginationItem key={`ellipsis-${i}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        isActive={p === page}
                                        onClick={() => onPageChange(p as number)}
                                        className="cursor-pointer"
                                    >
                                        {(p as number) + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ),
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => !isLast && onPageChange(page + 1)}
                                className={
                                    isLast ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
            <div className="flex items-center justify-between">
                {onPageSizeChange && (
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => onPageSizeChange(Number(v))}
                    >
                        <SelectTrigger className="h-8 w-[70px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={String(size)} className="text-xs">
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of{' '}
                    {total.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: (number | 'ellipsis')[] = [0];

    if (current > 2) pages.push('ellipsis');

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push('ellipsis');

    pages.push(total - 1);
    return pages;
}
