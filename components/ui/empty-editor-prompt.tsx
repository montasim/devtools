import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyEditorPromptProps {
    icon?: React.ComponentType<{ className?: string }>;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    showActions?: boolean;
    iconOpacity?: string;
    titleOpacity?: string;
    descriptionOpacity?: string;
    actionsOpacity?: string;
    buttonOpacity?: string;
}

export function EmptyEditorPrompt({
    icon: Icon,
    title = 'No data available',
    description = 'Add JSON content to get started',
    actionLabel,
    onAction,
    className,
    showActions = true,
    iconOpacity = 'opacity-20',
    titleOpacity = 'opacity-40',
    descriptionOpacity = 'opacity-30',
    actionsOpacity = 'opacity-40',
    buttonOpacity = 'opacity-90',
}: EmptyEditorPromptProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center h-full p-8 text-center',
                className,
            )}
        >
            {Icon && <Icon className={`h-12 w-12 text-muted-foreground mb-4 ${iconOpacity}`} />}

            <h3 className={`text-lg font-semibold text-muted-foreground mb-2 ${titleOpacity}`}>
                {title}
            </h3>
            <p className={`text-sm text-muted-foreground mb-6 max-w-md ${descriptionOpacity}`}>
                {description}
            </p>

            {showActions && (
                <div className={`flex flex-col items-center gap-3 ${actionsOpacity}`}>
                    <div className="text-xs text-left space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                Click
                            </span>
                            <span>to start typing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                Ctrl+V
                            </span>
                            <span>to paste content</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                Drag & Drop
                            </span>
                            <span>or use the upload button</span>
                        </div>
                    </div>
                </div>
            )}

            {actionLabel && onAction && (
                <Button
                    variant="default"
                    onClick={onAction}
                    size="sm"
                    className={`mt-4 ${buttonOpacity}`}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
