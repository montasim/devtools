import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLoading() {
    return (
        <div className="flex w-full items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
            <div className="mx-auto w-full max-w-sm flex flex-col gap-6 rounded-xl border bg-card p-6 md:p-8 shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Skeleton className="h-6 w-32 rounded-md" />
                    <Skeleton className="h-4 w-48 rounded-md" />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <Skeleton className="mt-2 h-10 w-full rounded-md" />
                </div>
                <div className="mt-4 flex items-center justify-center">
                    <Skeleton className="h-4 w-48 rounded-md" />
                </div>
            </div>
        </div>
    );
}
