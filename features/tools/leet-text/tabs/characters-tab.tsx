'use client';

import { useMemo, useState } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { ALL_LEVELS, getCategories } from '../utils/leet-mappings';
import type { TabComponentProps } from '../../core/types/tool';

export default function CharactersTab({ readOnly }: TabComponentProps) {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

    const categories = useMemo(() => getCategories(), []);

    const filteredLevels = useMemo(() => {
        let levels = ALL_LEVELS;
        if (activeCategories.size > 0) {
            levels = levels.filter((l) => activeCategories.has(l.category));
        }
        if (selectedLevel) {
            levels = levels.filter((l) => l.id === selectedLevel);
        }
        return levels;
    }, [activeCategories, selectedLevel]);

    const toggleCategory = (cat: string) => {
        setSelectedLevel(null);
        setActiveCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const clearFilters = () => {
        setSelectedLevel(null);
        setActiveCategories(new Set());
    };

    return (
        <ToolTabWrapper>
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                        Character Reference
                    </span>
                </div>
                <div className="flex items-center gap-1.5 my-2">
                    <Button
                        variant={
                            !selectedLevel && activeCategories.size === 0 ? 'default' : 'outline'
                        }
                        size="sm"
                        className="h-7 text-xs"
                        onClick={clearFilters}
                    >
                        All
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={
                                activeCategories.has(cat) && !selectedLevel ? 'default' : 'outline'
                            }
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => toggleCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
            >
                {filteredLevels.map((level) => (
                    <div key={level.id} className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-4 py-2.5">
                            <div>
                                <h3 className="text-sm font-medium">{level.name}</h3>
                                <p className="text-xs text-muted-foreground">{level.description}</p>
                            </div>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {level.category}
                            </span>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 px-4 py-2.5 font-mono text-sm">
                            {level.isUpsideDown ? (
                                <span className="col-span-2 text-xs text-muted-foreground">
                                    Uses Unicode upside-down characters with text reversal.
                                </span>
                            ) : (
                                Object.entries(level.encodeMap)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([char, leet]) => (
                                        <span key={char} className="contents">
                                            <span className="w-6 text-center font-semibold text-muted-foreground">
                                                {char}
                                            </span>
                                            <span className="text-foreground/80">{leet}</span>
                                        </span>
                                    ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ToolTabWrapper>
    );
}
