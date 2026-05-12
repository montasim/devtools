import dataByGroup from 'unicode-emoji-json/data-by-group.json';
import emojilib from 'emojilib';
import components from 'unicode-emoji-json/data-emoji-components.json';

export interface EmojiEntry {
    emoji: string;
    name: string;
    slug: string;
    group: string;
    unicodeVersion: string;
    emojiVersion: string;
    skinToneSupport: boolean;
    keywords: string[];
}

export interface EmojiGroup {
    name: string;
    slug: string;
    emojis: EmojiEntry[];
}

export type EmojiCategory =
    | 'Smileys & Emotion'
    | 'People & Body'
    | 'Animals & Nature'
    | 'Food & Drink'
    | 'Travel & Places'
    | 'Activities'
    | 'Objects'
    | 'Symbols'
    | 'Flags';

export const CATEGORY_ICONS: Record<EmojiCategory, string> = {
    'Smileys & Emotion': '😀',
    'People & Body': '👋',
    'Animals & Nature': '🐱',
    'Food & Drink': '🍕',
    'Travel & Places': '✈️',
    Activities: '⚽',
    Objects: '💡',
    Symbols: '🔣',
    Flags: '🏁',
};

export const CATEGORY_ORDER: EmojiCategory[] = [
    'Smileys & Emotion',
    'People & Body',
    'Animals & Nature',
    'Food & Drink',
    'Travel & Places',
    'Activities',
    'Objects',
    'Symbols',
    'Flags',
];

export const ALL_GROUPS: EmojiGroup[] = (
    Object.values(dataByGroup) as Array<{
        name: string;
        slug: string;
        emojis: Array<{
            emoji: string;
            name: string;
            slug: string;
            unicode_version: string;
            emoji_version: string;
            skin_tone_support: boolean;
        }>;
    }>
).map((group) => ({
    name: group.name as EmojiCategory,
    slug: group.slug,
    emojis: group.emojis.map((e) => ({
        emoji: e.emoji,
        name: e.name,
        slug: e.slug,
        group: group.name,
        unicodeVersion: e.unicode_version,
        emojiVersion: e.emoji_version,
        skinToneSupport: e.skin_tone_support,
        keywords: (emojilib as Record<string, string[]>)[e.emoji] ?? [],
    })),
}));

export const TOTAL_EMOJI_COUNT = ALL_GROUPS.reduce((sum, g) => sum + g.emojis.length, 0);

export function searchEmojis(query: string, groups: EmojiGroup[]): EmojiGroup[] {
    if (!query.trim()) return groups;

    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return groups
        .map((group) => ({
            ...group,
            emojis: group.emojis.filter((e) => {
                const haystack = `${e.name} ${e.keywords.join(' ')}`.toLowerCase();
                return terms.every((term) => haystack.includes(term));
            }),
        }))
        .filter((g) => g.emojis.length > 0);
}

export function getFilteredGroups(category: EmojiCategory | 'all', search: string): EmojiGroup[] {
    const groups = category === 'all' ? ALL_GROUPS : ALL_GROUPS.filter((g) => g.name === category);
    return searchEmojis(search, groups);
}

export const SKIN_TONES = [
    { id: 'default', label: 'Default', tone: '' },
    { id: 'light', label: 'Light', tone: components.light_skin_tone },
    { id: 'medium_light', label: 'Medium-Light', tone: components.medium_light_skin_tone },
    { id: 'medium', label: 'Medium', tone: components.medium_skin_tone },
    { id: 'medium_dark', label: 'Medium-Dark', tone: components.medium_dark_skin_tone },
    { id: 'dark', label: 'Dark', tone: components.dark_skin_tone },
] as const;

export type SkinToneId = (typeof SKIN_TONES)[number]['id'];

export function applySkinTone(emoji: string, toneId: SkinToneId): string {
    if (toneId === 'default') return emoji;
    const tone = SKIN_TONES.find((t) => t.id === toneId);
    return tone ? emoji + tone.tone : emoji;
}
