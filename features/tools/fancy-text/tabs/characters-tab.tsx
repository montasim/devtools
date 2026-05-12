'use client';

import { useMemo, useState } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { STYLE_DEFS } from '../utils/unicode-mappings';
import type { TabComponentProps } from '../../core/types/tool';

/** Extract a forward char map from a style by encoding a known alphabet */
function extractCharMap(styleId: string): Map<string, string> | null {
    const style = STYLE_DEFS.find((s) => s.id === styleId);
    if (!style) return null;

    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    const map = new Map<string, string>();

    for (const src of [lower, upper, digits]) {
        const encoded = style.transform(src);
        const srcChars = Array.from(src);
        const encChars = Array.from(encoded);

        if (srcChars.length !== encChars.length) return null; // not 1:1

        for (let i = 0; i < srcChars.length; i++) {
            if (srcChars[i] !== encChars[i]) {
                map.set(srcChars[i], encChars[i]);
            }
        }
    }

    return map.size > 0 ? map : null;
}

interface StyleInfo {
    id: string;
    name: string;
    category: string;
    charMap: Map<string, string> | null;
    description: string;
}

const CATEGORIES = [
    'Mathematical',
    'Enclosed',
    'Width / Case',
    'Script',
    'Combining',
    'Combined',
    'Transform',
];

function categorize(id: string): string {
    const mathStyles = [
        'bold',
        'bold-caps',
        'italic',
        'italic-caps',
        'bold-italic',
        'bold-italic-caps',
        'script',
        'script-caps',
        'bold-script',
        'bold-script-caps',
        'fraktur',
        'fraktur-caps',
        'bold-fraktur',
        'bold-fraktur-caps',
        'double-struck',
        'double-struck-caps',
        'monospace',
        'monospace-caps',
        'sans-serif',
        'sans-caps',
        'sans-bold',
        'sans-bold-caps',
        'sans-italic',
        'sans-italic-caps',
        'sans-bold-italic',
        'sans-bold-italic-caps',
    ];
    const enclosedStyles = [
        'circled',
        'circled-caps',
        'negative-circled',
        'negative-circled-caps',
        'squared',
        'squared-caps',
        'squared-negative',
        'squared-negative-caps',
        'parenthesized',
    ];
    const widthCaseStyles = ['fullwidth', 'fullwidth-caps', 'small-caps', 'upside-down'];
    const scriptStyles = [
        'georgian',
        'armenian',
        'tifinagh',
        'ogham',
        'coptic',
        'glagolitic',
        'cherokee',
        'greek',
        'runic',
        'cyrillic',
        'braille',
        'wingdings',
    ];
    const combiningStyles = [
        'strikethrough',
        'strikethrough-caps',
        'underline',
        'underline-caps',
        'zalgo',
        'zalgo-light',
        'zalgo-heavy',
        'overline',
        'enclosing-circle',
        'enclosing-square',
        'ring-above',
        'caron',
        'breve',
        'long-stroke',
        'arrow-above',
        'keycap',
        'three-dots',
        'four-dots',
        'bridge-above',
        'double-breve',
        'equals-below',
        'left-arrow-below',
        'right-arrow-below',
        'wavy',
        'dotted',
        'double-underline',
    ];
    const combinedStyles = [
        'crossed-bold',
        'bold-underline',
        'bold-wavy',
        'italic-strikethrough',
        'bold-overline',
        'script-underline',
        'fraktur-strikethrough',
        'sans-bold-strikethrough',
        'sans-bold-underline',
        'monospace-strikethrough',
        'double-struck-underline',
        'bold-italic-underline',
        'sans-italic-underline',
        'fullwidth-strikethrough',
    ];

    if (mathStyles.includes(id)) return 'Mathematical';
    if (enclosedStyles.includes(id)) return 'Enclosed';
    if (widthCaseStyles.includes(id)) return 'Width / Case';
    if (scriptStyles.includes(id)) return 'Script';
    if (combiningStyles.includes(id)) return 'Combining';
    if (combinedStyles.includes(id)) return 'Combined';
    return 'Transform';
}

function describeStyle(id: string): string {
    const descriptions: Record<string, string> = {
        // Mathematical
        bold: 'Bold mathematical Unicode characters',
        'bold-caps': 'Bold uppercase only',
        italic: 'Italic mathematical Unicode characters',
        'italic-caps': 'Italic uppercase only',
        'bold-italic': 'Bold italic mathematical characters',
        'bold-italic-caps': 'Bold italic uppercase only',
        script: 'Mathematical script (calligraphy)',
        'script-caps': 'Script uppercase only',
        'bold-script': 'Bold mathematical script',
        'bold-script-caps': 'Bold script uppercase only',
        fraktur: 'Fraktur (Gothic) mathematical',
        'fraktur-caps': 'Fraktur uppercase only',
        'bold-fraktur': 'Bold Fraktur mathematical',
        'bold-fraktur-caps': 'Bold Fraktur uppercase only',
        'double-struck': 'Double-struck (outline) mathematical',
        'double-struck-caps': 'Double-struck uppercase only',
        monospace: 'Monospace mathematical characters',
        'monospace-caps': 'Monospace uppercase only',
        'sans-serif': 'Sans-serif mathematical',
        'sans-caps': 'Sans-serif uppercase only',
        'sans-bold': 'Bold sans-serif mathematical',
        'sans-bold-caps': 'Bold sans-serif uppercase only',
        'sans-italic': 'Italic sans-serif mathematical',
        'sans-italic-caps': 'Italic sans-serif uppercase only',
        'sans-bold-italic': 'Bold italic sans-serif',
        'sans-bold-italic-caps': 'Bold italic sans-serif uppercase only',
        // Enclosed
        circled: 'Letters inside circles',
        'circled-caps': 'Circled uppercase only',
        'negative-circled': 'White letters on filled circles',
        'negative-circled-caps': 'Negative circled uppercase only',
        squared: 'Letters inside squares',
        'squared-caps': 'Squared uppercase only',
        'squared-negative': 'White letters on filled squares',
        'squared-negative-caps': 'Squared negative uppercase only',
        parenthesized: 'Letters inside parentheses ⒜⒝⒞',
        // Width / Case
        fullwidth: 'Fullwidth Unicode characters',
        'fullwidth-caps': 'Fullwidth uppercase only',
        'small-caps': 'Small capital letters',
        'upside-down': 'Upside-down characters + reversal',
        // Script
        georgian: 'Georgian Mkhedruli script',
        armenian: 'Armenian script',
        tifinagh: 'Berber Tifinagh script',
        ogham: 'Ogham tree alphabet',
        coptic: 'Coptic alphabet',
        glagolitic: 'Glagolitic (oldest Slavic script)',
        cherokee: 'Cherokee syllabary',
        greek: 'Greek alphabet approximation',
        runic: 'Elder Futhark runes',
        cyrillic: 'Cyrillic lookalike characters',
        braille: 'Grade 1 Braille patterns',
        wingdings: 'Wingdings symbol font',
        // Combining
        strikethrough: 'Combining long stroke overlay',
        'strikethrough-caps': 'Strikethrough uppercase only',
        underline: 'Combining low line below',
        'underline-caps': 'Underline uppercase only',
        zalgo: 'Random combining marks above & below',
        'zalgo-light': 'Light zalgo — one mark above',
        'zalgo-heavy': 'Heavy zalgo — many marks stacked',
        overline: 'Combining overline above',
        'enclosing-circle': 'Combining enclosing circle',
        'enclosing-square': 'Combining enclosing square',
        'ring-above': 'Combining ring above (°)',
        caron: 'Combining caron (ˇ) above',
        breve: 'Combining breve (˘) above',
        'long-stroke': 'Combining long stroke overlay',
        'arrow-above': 'Combining right arrow above',
        keycap: 'Combining enclosing keycap',
        'three-dots': 'Combining three dots above',
        'four-dots': 'Combining four dots above',
        'bridge-above': 'Combining bridge above',
        'double-breve': 'Combining double breve',
        'equals-below': 'Combining equals sign below',
        'left-arrow-below': 'Combining left arrow below',
        'right-arrow-below': 'Combining right arrow below',
        wavy: 'Combining tilde below (swash)',
        dotted: 'Combining dot above',
        'double-underline': 'Combining double low line',
        // Combined
        'crossed-bold': 'Bold + strikethrough',
        'bold-underline': 'Bold + underline',
        'bold-wavy': 'Bold + wavy below',
        'italic-strikethrough': 'Italic + strikethrough',
        'bold-overline': 'Bold + overline',
        'script-underline': 'Script + underline',
        'fraktur-strikethrough': 'Fraktur + strikethrough',
        'sans-bold-strikethrough': 'Sans bold + strikethrough',
        'sans-bold-underline': 'Sans bold + underline',
        'monospace-strikethrough': 'Monospace + strikethrough',
        'double-struck-underline': 'Double-struck + underline',
        'bold-italic-underline': 'Bold italic + underline',
        'sans-italic-underline': 'Sans italic + underline',
        'fullwidth-strikethrough': 'Fullwidth + strikethrough',
        // Transform
        superscript: 'Superscript Unicode characters',
        subscript: 'Subscript Unicode characters',
        'regional-indicator': 'Regional indicator emoji flags',
        spongemock: 'Random alternating case',
        aesthetic: 'Fullwidth with spaces between chars',
        reverse: 'Reverses character order',
        morse: 'Morse code dots and dashes',
        nato: 'NATO phonetic alphabet words',
        leet: 'Leet speak substitutions',
        spaced: 'Spaces between every character',
        'spaced-caps': 'Spaced uppercase only',
        clap: 'Clap emoji between every character',
        'clap-caps': 'Clap uppercase only',
        binary: 'Binary representation (8-bit)',
        hex: 'Hexadecimal representation',
        rot13: 'ROT13 letter rotation cipher',
        uwu: 'UwU cute text transform',
        'title-case': 'Capitalize first letter of each word',
        'alternating-upper': 'Alternating uppercase/lowercase',
    };
    return descriptions[id] ?? '';
}

export default function CharactersTab({ readOnly }: TabComponentProps) {
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const styles = useMemo<StyleInfo[]>(() => {
        return STYLE_DEFS.map((style) => ({
            id: style.id,
            name: style.name,
            category: categorize(style.id),
            charMap: extractCharMap(style.id),
            description: describeStyle(style.id),
        }));
    }, []);

    const filtered = useMemo(() => {
        let result = styles;
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
    }, [styles, activeCategories, searchQuery]);

    const toggleCategory = (cat: string) => {
        setActiveCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const clearFilters = () => {
        setActiveCategories(new Set());
        setSearchQuery('');
    };

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-2 px-1 my-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Character Reference — {STYLE_DEFS.length} styles
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
                        onClick={clearFilters}
                    >
                        All
                    </Button>
                    {CATEGORIES.map((cat) => {
                        const count = styles.filter((s) => s.category === cat).length;
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 260px)' }}
            >
                {filtered.map((style) => (
                    <div key={style.id} className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-4 py-2.5">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-medium">{style.name}</h3>
                                {style.description && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {style.description}
                                    </p>
                                )}
                            </div>
                            <span className="ml-2 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {style.category}
                            </span>
                        </div>
                        <div className="px-4 py-2.5">
                            {style.charMap ? (
                                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-sm">
                                    {Array.from(style.charMap.entries())
                                        .filter(
                                            ([ch]) =>
                                                (ch >= 'A' && ch <= 'Z') ||
                                                (ch >= 'a' && ch <= 'z'),
                                        )
                                        .sort(([a], [b]) => {
                                            const aLower = a.toLowerCase();
                                            const bLower = b.toLowerCase();
                                            if (aLower !== bLower)
                                                return aLower.localeCompare(bLower);
                                            return a < b ? -1 : 1;
                                        })
                                        .map(([char, mapped]) => (
                                            <span key={char} className="contents">
                                                <span className="w-6 text-center font-semibold text-muted-foreground">
                                                    {char}
                                                </span>
                                                <span className="text-foreground/80">{mapped}</span>
                                            </span>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    {style.category === 'Combining'
                                        ? 'Adds combining marks to base characters'
                                        : style.category === 'Transform'
                                          ? 'Text transformation — no character map'
                                          : 'Combined style — see base styles'}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ToolTabWrapper>
    );
}
