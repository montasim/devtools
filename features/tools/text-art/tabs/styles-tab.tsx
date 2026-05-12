'use client';

import { useMemo, useState } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { ART_STYLES, ART_CATEGORIES, type ArtCategory } from '../utils/art-styles';
import type { TabComponentProps } from '../../core/types/tool';

export default function StylesTab({}: TabComponentProps) {
    const [activeCategories, setActiveCategories] = useState<Set<ArtCategory>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        let result = ART_STYLES;
        if (activeCategories.size > 0) {
            result = result.filter((s) => activeCategories.has(s.category));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.description.toLowerCase().includes(q) ||
                    s.category.toLowerCase().includes(q),
            );
        }
        return result;
    }, [activeCategories, searchQuery]);

    const toggleCategory = (cat: ArtCategory) => {
        setActiveCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const sampleText = 'Hello';

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-2 px-1 my-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Style Reference — {ART_STYLES.length} styles
                        </span>
                    </div>
                    <input
                        type="text"
                        placeholder="Search styles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-7 w-48 rounded-md border bg-transparent px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        variant={activeCategories.size === 0 ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                            setActiveCategories(new Set());
                            setSearchQuery('');
                        }}
                    >
                        All
                    </Button>
                    {ART_CATEGORIES.map((cat) => {
                        const count = ART_STYLES.filter((s) => s.category === cat).length;
                        return (
                            <Button
                                key={cat}
                                variant={activeCategories.has(cat) ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleCategory(cat)}
                            >
                                {cat}
                                <span className="ml-1 text-[10px] opacity-60">{count}</span>
                            </Button>
                        );
                    })}
                </div>
            </div>
            <div
                className="grid grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3"
                style={{ maxHeight: 'calc(100vh - 260px)' }}
            >
                {filtered.map((style) => (
                    <div key={style.id} className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-4 py-2.5">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-medium">{style.name}</h3>
                                <p className="truncate text-xs text-muted-foreground">
                                    {style.description}
                                </p>
                            </div>
                            <span className="ml-2 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {style.category}
                            </span>
                        </div>
                        <div className="overflow-x-auto px-4 py-2.5">
                            {style.category === 'Unicode Block' ? (
                                <pre className="whitespace-pre text-[10px] leading-tight text-foreground/70">
                                    {style.generate(sampleText)}
                                </pre>
                            ) : (
                                <pre className="whitespace-pre text-xs leading-tight text-foreground/70">
                                    {style.generate(sampleText)}
                                </pre>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ToolTabWrapper>
    );
}
