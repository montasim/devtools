'use client';

import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface ActionButton {
    icon: LucideIcon;
    onClick: () => void;
    title: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
}

interface ActionButtonGroupProps {
    actions: ActionButton[];
    className?: string;
}

export function ActionButtonGroup({ actions, className = '' }: ActionButtonGroupProps) {
    return (
        <div className={`flex flex-wrap gap-2 shrink-0 ${className}`}>
            {actions.map(
                ({ icon: Icon, onClick, title, className: btnClassName, variant = 'outline' }) => (
                    <Tooltip key={title}>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size="sm"
                                onClick={onClick}
                                className={`gap-2 ${btnClassName || ''}`}
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{title}</p>
                        </TooltipContent>
                    </Tooltip>
                ),
            )}
        </div>
    );
}
