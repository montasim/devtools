import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
    return (
        <div className="flex w-full flex-col animate-in fade-in duration-500">
            {/* Hero Section Skeleton */}
            <div className="flex flex-col items-center justify-center space-y-6 py-20 text-center md:py-32">
                <Skeleton className="h-10 w-3/4 max-w-2xl rounded-lg md:h-16" />
                <Skeleton className="h-6 w-2/3 max-w-xl rounded-md" />
                
                <div className="flex items-center gap-4 pt-4">
                    <Skeleton className="h-10 w-32 rounded-md" />
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="mx-auto w-full max-w-6xl px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <Skeleton className="h-8 w-48 rounded-md" />
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex flex-col rounded-xl border p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                                <Skeleton className="h-6 flex-1 rounded-md" />
                            </div>
                            <Skeleton className="mb-2 h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-4/5 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
