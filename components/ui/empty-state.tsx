import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    iconClassName?: string;
    children: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, iconClassName, children, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'border border-gray-300 rounded-md p-8 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center justify-center gap-2">
                {Icon && <Icon className={cn('h-5 w-5', iconClassName)} />}
                <span>{children}</span>
            </div>
        </div>
    );
}
