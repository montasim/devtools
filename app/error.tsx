'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-24">
            <h1 className="text-2xl font-bold sm:text-4xl">Something went wrong</h1>
            <p className="mt-4 text-muted-foreground">{error.message}</p>
            <button
                onClick={reset}
                className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
                Try again
            </button>
        </div>
    );
}
