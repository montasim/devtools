import { cn } from '@/lib/utils';
import { ToolbarProps } from './types';
import { ToolbarToggle } from './toolbar-toggle';
import { ToolbarActions } from './toolbar-actions';

export const Toolbar = ({ toggles = [], actions = [], className }: ToolbarProps) => {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 bg-background border-b pb-2',
                className,
            )}
        >
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <ToolbarToggle items={toggles} />
            </div>

            <div className="flex items-center gap-2">
                <ToolbarActions items={actions} />
            </div>
        </div>
    );
};
