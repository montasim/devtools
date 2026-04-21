'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface EditableFieldProps {
    label: string;
    value: string;
    onSave: (value: string) => Promise<void>;
}

export function EditableField({ label, value, onSave }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [loading, setLoading] = useState(false);

    function startEditing() {
        setDraft(value);
        setEditing(true);
    }

    function cancel() {
        setEditing(false);
        setDraft(value);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(draft);
            setEditing(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <label className="mb-2 block text-sm font-medium">{label}</label>
            {!editing ? (
                <div className="flex items-center gap-3">
                    <p className="text-sm">{value}</p>
                    <Button variant="outline" size="sm" onClick={startEditing}>
                        Edit
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-3">
                    <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="max-w-md"
                        required
                    />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading} size="sm">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                        <Button type="button" variant="outline" onClick={cancel} size="sm">
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
