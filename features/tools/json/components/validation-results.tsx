'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface ValidationResultsProps {
    valid: boolean;
    errors?: Array<{ path: string; message: string }>;
}

export function ValidationResults({ valid, errors }: ValidationResultsProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                {valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                )}
                <Badge variant={valid ? 'default' : 'destructive'}>
                    {valid ? 'Valid' : 'Invalid'}
                </Badge>
            </div>
            {errors && errors.length > 0 && (
                <ul className="flex flex-col gap-1">
                    {errors.map((error, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <code className="rounded bg-muted px-1 text-xs">{error.path}</code>
                            <span className="text-muted-foreground">{error.message}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
