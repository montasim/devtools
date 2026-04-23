'use client';

import type { ReactNode } from 'react';
import { Toolbar } from './toolbar';
import type { ActionItem } from '../types/tool';

interface ToolTabWrapperProps {
    actions?: ActionItem[];
    children: ReactNode;
    leadingContent?: ReactNode;
}

export function ToolTabWrapper({ actions, children, leadingContent }: ToolTabWrapperProps) {
    return (
        <div className="flex flex-col">
            {(actions && actions.length > 0) || leadingContent ? (
                <div className="flex flex-col-reverse gap-2 border-b bg-background py-2 lg:flex-row lg:items-center lg:gap-4">
                    {leadingContent && (
                        <div className="flex flex-wrap items-center gap-3 min-w-0">
                            {leadingContent}
                        </div>
                    )}
                    <div className="hidden lg:block flex-1" />
                    {actions && actions.length > 0 && (
                        <div className="flex items-center justify-end">
                            <Toolbar actions={actions} />
                        </div>
                    )}
                </div>
            ) : null}
            {children}
        </div>
    );
}
