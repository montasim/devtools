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
                <div className="flex items-center justify-between border-b bg-background py-2 sm:gap-4">
                    {leadingContent && (
                        <div className="flex items-center gap-3">{leadingContent}</div>
                    )}
                    <div className="flex-1" />
                    {actions && actions.length > 0 && <Toolbar actions={actions} />}
                </div>
            ) : null}
            {children}
        </div>
    );
}
