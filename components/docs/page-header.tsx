'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    description: string;
    actions?: ReactNode;
}

export function PageHeader({ icon, title, description, actions }: PageHeaderProps) {
    return (
        <div className="mx-auto border-b border-gray-200 dark:border-gray-800 bg-white sticky top-0">
            <div className="mx-auto py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                    {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
                </div>
            </div>
        </div>
    );
}
