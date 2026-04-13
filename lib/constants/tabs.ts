// Page names
export const PAGE_NAMES = {
    TEXT: 'text',
    JSON: 'json',
    BASE64: 'base64',
} as const;

// Base64 tabs
export const BASE64_TABS = {
    MEDIA_TO_BASE64: 'media-to-base64',
    BASE64_TO_MEDIA: 'base64-to-media',
} as const;

// Text tabs
export const TEXT_TABS = {
    DIFF: 'diff',
    CONVERT: 'convert',
    CLEAN: 'clean',
} as const;

// JSON tabs
export const JSON_TABS = {
    DIFF: 'diff',
    SCHEMA: 'schema',
    VIEWER: 'viewer',
    MINIFY: 'minify',
    FORMAT: 'format',
    PARSER: 'parser',
    EXPORT: 'export',
} as const;

// Tab names
export const TAB_NAMES = {
    ...BASE64_TABS,
    ...TEXT_TABS,
    ...JSON_TABS,
} as const;
