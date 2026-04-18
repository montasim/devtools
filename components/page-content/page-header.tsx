import type { ReactNode } from 'react';

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    description: string;
    actions?: ReactNode;
}

export function PageHeader({ icon, title, description, actions }: PageHeaderProps) {
    return (
        <div className="border-b backdrop-blur-sm sticky top-0">
            <div className="mx-auto py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
                            {icon}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                {description}
                            </p>
                        </div>
                    </div>
                    {actions && (
                        <div className="flex w-full items-center gap-2 overflow-x-auto sm:ml-auto sm:w-auto">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
