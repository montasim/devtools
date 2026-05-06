'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>

                <h1 className="text-8xl font-bold tracking-tighter sm:text-9xl">
                    <span className="bg-linear-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent">
                        500
                    </span>
                </h1>

                <p className="mt-4 text-lg font-medium">Well, that&apos;s embarrassing</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Something broke on our end — not your fault. It happens to the best code. Give
                    it another shot or head home.
                </p>

                {error.message && (
                    <div className="mt-4 max-w-md rounded-lg border bg-muted/50 px-4 py-3">
                        <code className="text-xs text-muted-foreground break-all">
                            {error.message}
                        </code>
                    </div>
                )}

                <div className="mt-8 flex items-center gap-3">
                    <Button
                        size="lg"
                        variant="destructive"
                        onClick={reset}
                        className="h-11 px-6 text-sm"
                    >
                        <RotateCw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-11 px-6 text-sm">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
