import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Braces, Terminal } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur-sm">
                    <Terminal className="h-10 w-10 text-primary" />
                </div>

                <h1 className="text-8xl font-bold tracking-tighter sm:text-9xl">
                    <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                        404
                    </span>
                </h1>

                <p className="mt-4 text-lg font-medium">Lost in the void</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Even the best developers hit dead ends. This page moved, got renamed, or never
                    existed. Let&apos;s get you back to building.
                </p>

                <div className="mt-8 flex items-center gap-3">
                    <Button size="lg" asChild className="h-11 px-6 text-sm">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-11 px-6 text-sm">
                        <Link href="/docs">
                            <Braces className="mr-2 h-4 w-4" />
                            Browse Tools
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
