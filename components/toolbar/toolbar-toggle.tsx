import { cn } from '@/lib/utils';
import { ToolbarToggleItem } from './types';
import { Button } from '../ui/button';

interface ToolbarToggleProps {
    items: ToolbarToggleItem[];
}

export const ToolbarToggle = ({ items }: ToolbarToggleProps) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {items.map((item) => (
                <Button
                    key={item.id}
                    type="button"
                    onClick={() => item.onChange(!item.checked)}
                    aria-pressed={item.checked}
                    className={cn(
                        'inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0',
                        item.checked
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted',
                    )}
                >
                    {item.label}
                </Button>
            ))}
        </div>
    );
};
