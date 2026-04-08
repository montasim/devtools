import type { ComponentProps, ReactNode } from 'react';

interface ErrorActionsProps extends ComponentProps<'div'> {
    children: ReactNode;
}

export function ErrorActions({ children, className = '' }: ErrorActionsProps) {
    return (
        <div className={`flex flex-col gap-4 sm:flex-row sm:justify-center ${className}`}>
            {children}
        </div>
    );
}
