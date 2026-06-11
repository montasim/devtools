import { Skeleton } from '@/components/ui/skeleton';

export function ToolContentSkeleton() {
    return (
        <div className="mx-auto mt-0 py-4 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row">
                {/* Left Pane */}
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        {/* Editor Pane Header */}
                        <div className="flex items-center justify-between mt-2 h-7">
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                            </div>
                        </div>
                        {/* Editor Textarea */}
                        <div className="relative flex-1">
                            <Skeleton className="min-h-[350px] w-full rounded-lg md:min-h-[400px] lg:min-h-[500px]" />
                            {/* Editor Footer */}
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane */}
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        {/* Editor Pane Header */}
                        <div className="flex items-center justify-between mt-2 h-7">
                            <Skeleton className="h-4 w-28" />
                            <div className="flex gap-2">
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                            </div>
                        </div>
                        {/* Right Pane Content */}
                        <Skeleton className="min-h-[350px] w-full rounded-lg md:min-h-[400px] lg:min-h-[500px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Tabs Header Skeleton */}
            <div className="border-b">
                <div className="mx-auto py-2">
                    <div className="flex w-full items-center justify-between px-1">
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-9 w-20 rounded-md" />
                            <Skeleton className="h-9 w-24 rounded-md" />
                            <Skeleton className="h-9 w-20 rounded-md" />
                            <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-9 w-20 rounded-md" />
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tool Content Skeleton */}
            <ToolContentSkeleton />
        </div>
    );
}
