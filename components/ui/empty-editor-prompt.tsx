import { cn } from '@/lib/utils';

interface EmptyEditorPromptProps {
    icon?: React.ComponentType<{ className?: string }>;
    title?: string;
    description?: string;
    className?: string;
    showActions?: boolean;
    overlay?: boolean;
}

export function EmptyEditorPrompt({
    icon: Icon,
    title = 'No data available',
    description = 'Add content to get started',
    className,
    showActions = true,
    overlay = false,
}: EmptyEditorPromptProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center p-8 text-center',
                overlay && 'pointer-events-none absolute inset-0',
                className,
            )}
        >
            {Icon && <Icon className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />}

            <h3 className="mb-2 text-lg font-semibold text-muted-foreground opacity-40">{title}</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground opacity-30">{description}</p>

            {showActions && (
                <div className="flex flex-col items-center gap-3 opacity-40">
                    <div className="space-y-1 text-left text-xs">
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                Click
                            </span>
                            <span>to start typing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                Ctrl+V
                            </span>
                            <span>to paste content</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                Drag & Drop
                            </span>
                            <span>or use the upload button</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
