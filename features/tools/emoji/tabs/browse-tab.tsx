'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Search, Smile, X } from 'lucide-react';
import {
    ALL_GROUPS,
    CATEGORY_ORDER,
    CATEGORY_ICONS,
    getFilteredGroups,
    TOTAL_EMOJI_COUNT,
    SKIN_TONES,
    applySkinTone,
    type EmojiCategory,
    type EmojiGroup,
    type EmojiEntry,
    type SkinToneId,
} from '../utils/emoji-data';

export default function BrowseTab() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<EmojiCategory | 'all'>('all');
    const [skinTone, setSkinTone] = useState<SkinToneId>('default');
    const { copy } = useClipboard();
    const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const groups = useMemo(
        () => getFilteredGroups(activeCategory, search),
        [activeCategory, search],
    );

    const handleCopy = useCallback(
        (emoji: EmojiEntry) => {
            const toCopy = emoji.skinToneSupport
                ? applySkinTone(emoji.emoji, skinTone)
                : emoji.emoji;
            copy(toCopy, `Copied ${toCopy} ${emoji.name}`);
            setCopiedEmoji(toCopy);
            setTimeout(() => setCopiedEmoji(null), 1500);
        },
        [copy, skinTone],
    );

    const clearSearch = useCallback(() => {
        setSearch('');
    }, []);

    // Scroll grid to top when category changes
    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.scrollTop = 0;
        }
    }, [activeCategory]);

    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${TOTAL_EMOJI_COUNT.toLocaleString()} emojis...`}
                    className="h-9 pl-9 pr-8 text-sm"
                    spellCheck={false}
                />
                {search && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 flex-wrap">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeCategory === 'all'
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                >
                    All ({TOTAL_EMOJI_COUNT.toLocaleString()})
                </button>
                {CATEGORY_ORDER.map((cat) => {
                    const isActive = activeCategory === cat;
                    const group = ALL_GROUPS.find((g) => g.name === cat);
                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                isActive
                                    ? 'border-primary/50 bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50'
                            }`}
                        >
                            {CATEGORY_ICONS[cat]} {cat}
                            {group && ` (${group.emojis.length})`}
                        </button>
                    );
                })}
            </div>

            {/* Skin tone picker */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Skin tone:</span>
                <div className="flex gap-1">
                    {SKIN_TONES.map((tone) => (
                        <button
                            key={tone.id}
                            onClick={() => setSkinTone(tone.id)}
                            title={tone.label}
                            className={`flex items-center justify-center h-6 w-6 rounded-full text-sm transition-all ${
                                skinTone === tone.id
                                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110'
                                    : 'hover:scale-110'
                            }`}
                        >
                            {tone.id === 'default' ? '✋' : '✋' + tone.tone}
                        </button>
                    ))}
                </div>
            </div>

            {/* Emoji grid */}
            {groups.length > 0 ? (
                groups.map((group) => (
                    <EmojiGroupSection
                        key={group.name}
                        group={group}
                        copiedEmoji={copiedEmoji}
                        onCopy={handleCopy}
                        skinTone={skinTone}
                    />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Smile className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                        No emojis found for &quot;{search}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground/60">Try a different search term</p>
                </div>
            )}
        </div>
    );
}

function EmojiGroupSection({
    group,
    copiedEmoji,
    onCopy,
    skinTone,
}: {
    group: EmojiGroup;
    copiedEmoji: string | null;
    onCopy: (entry: EmojiEntry) => void;
    skinTone: SkinToneId;
}) {
    return (
        <div>
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-3 py-2 backdrop-blur-sm">
                <span className="text-sm">{CATEGORY_ICONS[group.name as EmojiCategory] ?? ''}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.name}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{group.emojis.length}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-0">
                {group.emojis.map((entry) => {
                    const display = entry.skinToneSupport
                        ? applySkinTone(entry.emoji, skinTone)
                        : entry.emoji;
                    return (
                        <button
                            key={entry.emoji}
                            onClick={() => onCopy(entry)}
                            title={`${entry.name}${entry.skinToneSupport ? ` (${SKIN_TONES.find((t) => t.id === skinTone)?.label ?? 'Default'} tone)` : ''}`}
                            className={`flex items-center justify-center h-[42px] text-[22px] transition-colors hover:bg-muted/80 active:scale-90 active:bg-muted ${
                                copiedEmoji === display ? 'bg-primary/10 scale-90' : ''
                            }`}
                        >
                            {display}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
