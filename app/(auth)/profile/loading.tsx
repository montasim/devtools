import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
    return (
        <div className="min-h-screen py-10 bg-background text-foreground animate-in fade-in duration-500">
            <div className="w-full">
                
                {/* 1. Header Profile Banner Card Skeleton */}
                <div className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <Skeleton className="h-16 w-16 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-32 rounded-md" />
                                <Skeleton className="h-4 w-48 rounded-md" />
                                <Skeleton className="h-3 w-28 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>

                {/* 2. Dashboard Metrics Grid Skeleton */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 shadow-sm flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20 rounded-md" />
                                <Skeleton className="h-7 w-12 rounded-md" />
                            </div>
                            <Skeleton className="h-11 w-11 rounded-xl" />
                        </div>
                    ))}
                </div>

                {/* 3. Graph and Breakdown Charts Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Chart Skeleton */}
                    <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 rounded-md" />
                                <Skeleton className="h-3.5 w-48 rounded-md" />
                            </div>
                            <Skeleton className="h-4 w-12 rounded-md" />
                        </div>
                        <Skeleton className="h-80 w-full rounded-xl" />
                    </div>

                    {/* Breakdown Chart Skeleton */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40 rounded-md" />
                            <Skeleton className="h-3.5 w-32 rounded-md" />
                        </div>
                        <div className="h-56 w-full flex items-center justify-center my-4">
                            <Skeleton className="h-40 w-40 rounded-full" />
                        </div>
                        <div className="space-y-3 mt-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-3.5 w-20 rounded-md" />
                                    </div>
                                    <Skeleton className="h-3.5 w-6 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
