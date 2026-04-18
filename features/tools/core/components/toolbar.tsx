'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ActionItem } from '../types/tool';

interface ToolbarProps {
    actions: ActionItem[];
}

export function Toolbar({ actions }: ToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {actions.map((action, index) => (
                <div key={action.id} className="flex items-center gap-2">
                    {index > 0 && (
                        <Separator orientation="vertical" className="hidden h-6 sm:block" />
                    )}
                    <Button
                        variant={action.variant ?? 'outline'}
                        size="sm"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`flex items-center gap-1.5 ${action.className ?? ''}`}
                    >
                        <action.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{action.label}</span>
                    </Button>
                </div>
            ))}
        </div>
    );
}
