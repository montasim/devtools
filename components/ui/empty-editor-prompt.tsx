import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyEditorPromptProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyEditorPrompt({
    icon: Icon,
    title = 'No data available',
    description = 'Add JSON content to get started',
    actionLabel,
    onAction,
    className,
}: EmptyEditorPromptProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center h-full p-8 text-center',
                className,
            )}
        >
            {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />}
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction} size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
