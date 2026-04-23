'use client';

import { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { KeyValueItem } from '../utils/http-client';
import { createEmptyKeyValue } from '../utils/http-client';

interface KeyValueEditorProps {
    items: KeyValueItem[];
    onChange: (items: KeyValueItem[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
}

export function KeyValueEditor({
    items,
    onChange,
    keyPlaceholder = 'Key',
    valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
    const updateItem = useCallback(
        (id: string, field: keyof KeyValueItem, value: string | boolean) => {
            onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
        },
        [items, onChange],
    );

    const addItem = useCallback(() => {
        onChange([...items, createEmptyKeyValue()]);
    }, [items, onChange]);

    const removeItem = useCallback(
        (id: string) => {
            const filtered = items.filter((item) => item.id !== id);
            if (filtered.length === 0) {
                onChange([createEmptyKeyValue()]);
            } else {
                onChange(filtered);
            }
        },
        [items, onChange],
    );

    return (
        <div className="flex flex-col gap-1.5">
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                    <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) => updateItem(item.id, 'enabled', checked)}
                        className="scale-75"
                    />
                    <Input
                        value={item.key}
                        onChange={(e) => updateItem(item.id, 'key', e.target.value)}
                        placeholder={keyPlaceholder}
                        className="h-8 font-mono text-xs"
                        spellCheck={false}
                    />
                    <Input
                        value={item.value}
                        onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                        placeholder={valuePlaceholder}
                        className="h-8 font-mono text-xs"
                        spellCheck={false}
                    />
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={addItem}
                className="self-start h-7 text-xs text-muted-foreground"
            >
                <Plus className="h-3 w-3 mr-1" />
                Add
            </Button>
        </div>
    );
}
