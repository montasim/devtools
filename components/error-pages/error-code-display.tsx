import { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

interface ErrorCodeDisplayProps extends ComponentProps<'div'> {
    code: string;
    icon: LucideIcon;
    title: string;
    description: string;
    errorId?: string;
}

export function ErrorCodeDisplay({
    code,
    icon: Icon,
    title,
    description,
    errorId,
    className = '',
}: ErrorCodeDisplayProps) {
    const isServerError = code === '500';

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Icon */}
            <div className="flex justify-center">
                <Icon
                    className={`h-16 w-16 sm:h-20 sm:w-20 ${
                        isServerError ? 'text-destructive' : 'text-primary'
                    }`}
                />
            </div>

            {/* Error Code */}
            <div className="space-y-2">
                <h1 className="font-mono text-6xl font-bold sm:text-7xl lg:text-8xl">{code}</h1>
                <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-lg">{description}</p>

            {/* Error ID for 500 errors */}
            {errorId && (
                <div className="rounded-lg bg-muted p-4">
                    <p className="font-mono text-sm">
                        <span className="text-muted-foreground">Error ID:</span>{' '}
                        <span className="text-foreground">{errorId}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
