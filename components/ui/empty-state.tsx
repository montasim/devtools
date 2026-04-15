import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    children,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'text-center py-8 sm:py-12 border rounded-lg border-dashed px-4',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            {Icon && (
                <Icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
            )}
            {title && <h3 className="text-base sm:text-lg font-semibold mb-2">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
            {children}
        </div>
    );
}
