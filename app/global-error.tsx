'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex min-h-[100vh] flex-col items-center justify-center px-4">
                    <div className="w-full max-w-2xl space-y-8 text-center">
                        <h1 className="font-mono text-6xl font-bold sm:text-7xl lg:text-8xl">
                            500
                        </h1>
                        <h2 className="text-xl font-semibold sm:text-2xl">Application Error</h2>
                        <p className="text-muted-foreground text-lg">
                            An unexpected error occurred. Please try again later.
                        </p>
                        {error.digest && (
                            <div className="rounded-lg bg-muted p-4">
                                <p className="font-mono text-sm">
                                    <span className="text-muted-foreground">Error ID:</span>{' '}
                                    <span className="text-foreground">{error.digest}</span>
                                </p>
                            </div>
                        )}
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
