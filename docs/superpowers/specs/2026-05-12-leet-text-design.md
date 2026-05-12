# Leet Text Encoder/Decoder — Design Spec

**Goal:** Add a two-tab tool (Encode / Decode) that transforms plain text into multiple leet speak variants and decodes leet back to plain text, all client-side.

**Architecture:** Follows existing tool patterns (url-encode for two-tab structure, fancy-text for multi-style output list). Single utility file holds char maps per leet level plus encode/decode functions. Two tab components share the same `useToolState` / `useToolActions` / `ToolTabWrapper` / `TextEditor` / `EditorPaneHeader` components.

**Tech Stack:** Next.js App Router, React hooks, existing tool framework components.

---

## Tabs

### Encode Tab

- **Layout:** Button bar (level filters) at top, split view below
    - Left pane: `TextEditor` for input text
    - Right pane: scrollable list of leet variants with copy buttons
- **Filter bar:** Toggle buttons for each leet level. "All" selected by default. Click to filter which levels appear in the output list.
- **Each row:** Level name (label) | transformed text (selectable) | copy button with 2s checkmark feedback
- **Empty state:** Sparkles icon + "Type text to see leet variants"
- **Reuses:** `EditorPaneHeader`, `TextEditor`, `useToolState`, `useToolActions`, `ToolTabWrapper`, `useClipboard`

### Decode Tab

- **Layout:** Split view (same as url-encode decode)
    - Left pane: `TextEditor` for leet text input
    - Right pane: `TextEditor` (read-only) for decoded plain text output
- **Auto-detect:** Attempt all level reverse-maps, show the best match
- **Error state:** If decoding fails, show error with guidance
- **Reuses:** Same component set as encode tab

## Leet Levels (9 variants)

Each level defines a character substitution map (plain char → leet string). Levels increase in complexity:

| #   | ID           | Name        | Style                                                 | Sample "Hello"       |
| --- | ------------ | ----------- | ----------------------------------------------------- | -------------------- | ---- | ---- | ------------ | ---- | --- | --- | --- | --- | --- |
| 1   | `basic`      | Basic       | a→4, e→3, i→1, o→0, s→5, t→7                          | H3ll0                |
| 2   | `leet1337`   | 1337        | Expanded: a→4, e→3, i→1, l→1, o→0, s→5, t→7, b→8, g→9 | H3110                |
| 3   | `standard`   | Standard    | a→@, e→3, i→!, o→0, s→$, l→1                          | H3                   |      | 0    |
| 4   | `advanced`   | Advanced    | Multi-char: h→                                        | -                    | , m→ | \/   | , w→\/\/, n→ | \|   |     | -   | 3   |     | 0   |
| 5   | `hardcore`   | Hardcore    | Maximum obfuscation, complex multi-char               |                      | -    | 3    | \_           | \_() |
| 6   | `cyber`      | Cyber       | Cyberpunk-styled: a→4, e→3, h→}-{, o→()               | }-{3                 | \_   | \_() |
| 7   | `hacker`     | Hacker      | Classic BBS: a→4, e→3, i→1, o→0, s→z, t→+             | H3ll0                |
| 8   | `upsidedown` | Upside Down | Unicode flip characters                               | 0ll3H                |
| 9   | `morris`     | Morris Code | Dot-dash style substitution using symbols             | .... . .-.. .-.. --- |

**Each level has:**

- `id`: string identifier
- `name`: display name
- `description`: short tooltip/label
- `encodeMap`: `Record<string, string>` — plain char → leet replacement
- `category`: group for filter buttons

## Encode Logic

```typescript
function leetEncode(text: string, level: LeetLevel): string {
    // For each character, look up in level.encodeMap
    // Pass through unmapped characters unchanged
    // Case-insensitive matching, preserve original case intent
}
```

Multi-char replacements are straightforward — iterate input chars, replace each via map.

## Decode Logic

```typescript
function leetDecode(text: string, level: LeetLevel): string {
    // Build reverse map: leetString → plainChar
    // Sort replacements by length (longest first) for greedy matching
    // Scan input left-to-right, try longest match first
    // Pass through unmapped segments unchanged
}

function autoDecode(text: string): { text: string; level: string } {
    // Try all levels, return the one with highest decode confidence
    // (most characters successfully decoded)
}
```

Decode is inherently lossy (e.g., `|` could be `l` or `i`). The auto-decoder picks the level that produces the most readable result.

## Files

### Create

- `features/tools/leet-text/utils/leet-mappings.ts` — Level definitions, encode/decode functions
- `features/tools/leet-text/tabs/encode-tab.tsx` — Encode tab component
- `features/tools/leet-text/tabs/decode-tab.tsx` — Decode tab component
- `app/(tools)/leet-text/page.tsx` — Tool registration with encode/decode tabs
- `app/(tools)/leet-text/layout.tsx` — SEO metadata

### Modify

- `lib/utils/constants.ts` — Add `LEET_TEXT_ENCODE_INPUT`, `LEET_TEXT_DECODE_INPUT` storage keys, `LEET_TEXT` page name, `LEET_TEXT_TABS`
- `config/navigation.tsx` — Add Leet Text tool entry
- `config/seo.ts` — Add SEO metadata for leet-text page

## Registration

- `pageName`: `'leet-text'`
- `icon`: `Binary` (or `Code2` — fits hacker theme)
- `defaultTab`: `'encode'`
- `mainTabs`: encode + decode
- No plugins (same as fancy-text — no saved/shared/history)

## Storage Keys

- `LEET_TEXT_ENCODE_INPUT: 'leet-text-encode-input'`
- `LEET_TEXT_DECODE_INPUT: 'leet-text-decode-input'`
