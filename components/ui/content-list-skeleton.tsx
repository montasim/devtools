import { Skeleton } from '@/components/ui/skeleton';

export function ContentListSkeleton() {
    return (
        <div className="space-y-3 animate-in fade-in duration-500 w-full">
            <div className="flex justify-end mb-2">
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3 bg-card">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3 max-w-[200px]" />
                        <Skeleton className="h-3 w-1/2 max-w-[300px]" />
                        <div className="flex gap-2 pt-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}
