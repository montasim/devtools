'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface ActionButton {
    icon: LucideIcon;
    onClick: () => void;
    title: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
}

export interface ActionButtonGroupProps {
    actions: ActionButton[];
    className?: string;
}

export function ActionButtonGroup({ actions, className = '' }: ActionButtonGroupProps) {
    return (
        <div className={`flex gap-2 shrink-0 ${className}`}>
            {actions.map(
                ({ icon: Icon, onClick, title, className: btnClassName, variant = 'outline' }) => (
                    <Button
                        key={title}
                        variant={variant}
                        size="sm"
                        onClick={onClick}
                        className={`gap-2 ${btnClassName}`}
                        title={title}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                ),
            )}
        </div>
    );
}
