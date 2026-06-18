'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check, Search, FileJson, Code, FileText, FileCode, Database } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { SAMPLE_DATA_LIST, type SampleDataEntry } from '../utils/sample-data';

const CATEGORIES = ['all', 'json', 'xml', 'text', 'base64'] as const;

function getCategoryIcon(cat: string) {
    switch (cat) {
        case 'json':
            return <FileJson className="h-4 w-4 text-emerald-500" />;
        case 'xml':
            return <Code className="h-4 w-4 text-blue-500" />;
        case 'text':
            return <FileText className="h-4 w-4 text-pink-500" />;
        case 'base64':
            return <FileCode className="h-4 w-4 text-purple-500" />;
        default:
            return <Database className="h-4 w-4 text-muted-foreground" />;
    }
}

export default function ReferenceTab({}: TabComponentProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { copy } = useClipboard();

    const filtered = useMemo(() => {
        return SAMPLE_DATA_LIST.filter((item) => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory]);

    const handleCopy = useCallback(
        async (item: SampleDataEntry) => {
            await copy(item.content);
            setCopiedId(item.id);
            setTimeout(() => setCopiedId(null), 1500);
        },
        [copy],
    );

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search sample templates by title or description..."
                            className="h-9 pl-9 text-sm"
                            spellCheck={false}
                        />
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap">
                        {CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`rounded-md border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                                        isActive
                                            ? 'border-primary/50 bg-primary/10 text-primary'
                                             : 'text-muted-foreground hover:bg-muted/50 border-input'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card text-card-foreground"
                            >
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-1.5 rounded-md bg-muted">
                                            {getCategoryIcon(item.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopy(item)}
                                        className="shrink-0 flex items-center gap-1.5 h-8 text-xs"
                                    >
                                        {copiedId === item.id ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                    {item.description}
                                </p>
                                <div className="relative flex-1 bg-muted/40 rounded-md border overflow-hidden max-h-48 flex flex-col">
                                    <pre className="text-xs p-3 overflow-auto flex-1 font-mono leading-normal text-muted-foreground">
                                        <code>{item.content}</code>
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-card">
                        <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No matching sample templates
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Try a different search term or select another category filter
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
