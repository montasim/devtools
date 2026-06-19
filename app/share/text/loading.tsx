import { Skeleton } from '@/components/ui/skeleton';

export default function ShareTextLoading() {
    return (
        <div className="py-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8">
                {/* Left Side Skeleton (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                        <Skeleton className="h-6 w-32 rounded-md" />
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-3.5 items-start p-2">
                                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-24 rounded-md" />
                                        <Skeleton className="h-3 w-full rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
                        <Skeleton className="h-4 w-28 rounded-md" />
                        <div className="space-y-2.5 pt-2">
                            <Skeleton className="h-3.5 w-full rounded-md" />
                            <Skeleton className="h-3.5 w-full rounded-md" />
                            <Skeleton className="h-3.5 w-2/3 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Right Side Skeleton (8 cols) */}
                <div className="lg:col-span-8">
                    <div className="rounded-2xl border bg-card p-4 shadow-sm min-h-[500px] flex flex-col">
                        {/* Tabs list trigger skeleton */}
                        <div className="border-b pb-2 mb-6">
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24 rounded-md" />
                                <Skeleton className="h-9 w-24 rounded-md" />
                            </div>
                        </div>

                        {/* Editor content skeleton */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <Skeleton className="h-6 w-32 rounded-md" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-7 w-7 rounded-md" />
                                    <Skeleton className="h-7 w-7 rounded-md" />
                                    <Skeleton className="h-7 w-7 rounded-md" />
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-4 min-h-[350px] space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-1/3 rounded-md" />
                                    <Skeleton className="h-4 w-1/2 rounded-md" />
                                    <Skeleton className="h-4 w-1/4 rounded-md" />
                                </div>
                                <div className="space-y-2 pt-4">
                                    <Skeleton className="h-4 w-2/3 rounded-md" />
                                    <Skeleton className="h-4 w-5/12 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
