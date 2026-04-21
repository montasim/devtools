'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareErrorDisplayProps {
    message: string;
    onRetry?: () => void;
}

export function ShareErrorDisplay({ message, onRetry }: ShareErrorDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-semibold">Error</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    Try Again
                </Button>
            )}
        </div>
    );
}
