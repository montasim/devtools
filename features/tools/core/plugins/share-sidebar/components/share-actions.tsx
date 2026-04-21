'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ShareExtraAction } from '../types';

interface ShareActionsProps {
    actions: ShareExtraAction[];
}

export function ShareActions({ actions }: ShareActionsProps) {
    if (actions.length === 0) return null;

    return (
        <div className="flex flex-col gap-2">
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Actions</p>
            <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.variant ?? 'outline'}
                        size="sm"
                        onClick={action.handler}
                        className="flex items-center gap-1.5"
                    >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
