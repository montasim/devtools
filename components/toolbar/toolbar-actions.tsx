import { Button } from '@/components/ui/button';
import { ToolbarAction } from './types';
import { RefreshCcw, Trash2, Share2 } from 'lucide-react';

interface ToolbarActionsProps {
    items: ToolbarAction[];
}

const getDefaultIcon = (label: string) => {
    if (label.toLowerCase().includes('compare') || label.toLowerCase().includes('refresh')) {
        return <RefreshCcw className="h-4 w-4" />;
    }
    if (label.toLowerCase().includes('clear') || label.toLowerCase().includes('delete')) {
        return <Trash2 className="h-4 w-4" />;
    }
    if (label.toLowerCase().includes('share')) {
        return <Share2 className="h-4 w-4" />;
    }
    return undefined;
};

export const ToolbarActions = ({ items }: ToolbarActionsProps) => {
    if (!items || items.length === 0) return null;

    return (
        <>
            {items.map((item) => {
                const icon = item.icon || getDefaultIcon(item.label);
                const variant =
                    item.variant ||
                    (item.label.toLowerCase().includes('compare') ? 'default' : 'outline');

                return (
                    <Button
                        key={item.id}
                        variant={variant}
                        size="sm"
                        onClick={item.onClick}
                        disabled={item.disabled}
                    >
                        {icon && <span className="mr-2">{icon}</span>}
                        {item.label}
                    </Button>
                );
            })}
        </>
    );
};
