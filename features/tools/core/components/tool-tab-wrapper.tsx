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
                <div className="flex flex-col-reverse gap-2 border-b bg-background py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-y-2 sm:gap-x-4">
                    {leadingContent && (
                        <div className="flex items-center gap-3 min-w-0 shrink">
                            {leadingContent}
                        </div>
                    )}
                    {actions && actions.length > 0 && <Toolbar actions={actions} />}
                </div>
            ) : null}
            {children}
        </div>
    );
}
