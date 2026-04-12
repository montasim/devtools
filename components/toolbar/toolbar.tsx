import { cn } from '@/lib/utils';
import { ToolbarProps } from '@/components/toolbar/types';
import { ToolbarToggle } from '@/components/toolbar/toolbar-toggle';
import { ToolbarActions } from '@/components/toolbar/toolbar-actions';
import { ReactNode } from 'react';

interface ExtendedToolbarProps extends ToolbarProps {
    leftContent?: ReactNode;
}

export const Toolbar = ({
    toggles = [],
    actions = [],
    className,
    leftContent,
}: ExtendedToolbarProps) => {
    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 bg-background border-b pb-2',
                className,
            )}
        >
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-full md:w-[70vw]">
                {leftContent}
                <ToolbarToggle items={toggles} />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                <ToolbarActions items={actions} />
            </div>
        </div>
    );
};
