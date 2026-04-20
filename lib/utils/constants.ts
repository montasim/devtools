export const STORAGE_KEYS = {
    JSON_DIFF_LEFT_CONTENT: 'json-diff-left-content',
    JSON_DIFF_RIGHT_CONTENT: 'json-diff-right-content',
    JSON_FORMAT_LEFT_CONTENT: 'json-format-left-content',
    FORMAT_OPTIONS: 'format-options',
    JSON_MINIFY_LEFT_CONTENT: 'json-minify-left-content',
    MINIFY_OPTIONS: 'minify-options',
    JSON_PARSER_CONTENT: 'json-parser-content',
    JSON_VIEWER_CONTENT: 'json-viewer-content',
    JSON_EXPORT_CONTENT: 'json-export-content',
    JSON_SCHEMA_MODE: 'json-schema-mode',
    JSON_SCHEMA_JSON_CONTENT: 'json-schema-json-content',
    JSON_SCHEMA_SCHEMA_CONTENT: 'json-schema-schema-content',
    TEXT_DIFF_LEFT_CONTENT: 'text-diff-left-content',
    TEXT_DIFF_RIGHT_CONTENT: 'text-diff-right-content',
    TEXT_CONVERT_INPUT_CONTENT: 'text-convert-input-content',
    TEXT_FORMAT_INPUT_CONTENT: 'text-format-input-content',
    TEXT_COUNT_INPUT_CONTENT: 'text-count-input-content',
    TEXT_CLEAN_INPUT_CONTENT: 'text-clean-input-content',
    SHARE_TEXT_CONTENT: 'share-text-content',
    GIT_BRANCH_LAST_GENERATED: 'git-branch-last-generated',
    BASE64_MEDIA_TO_BASE64_INPUT: 'base64-media-to-base64-input',
    BASE64_MEDIA_TO_BASE64_OUTPUT: 'base64-media-to-base64-output',
    BASE64_TO_MEDIA_INPUT: 'base64-to-media-input',
    QR_CREATE_INPUT: 'qr-create-input',
    QR_CREATE_SETTINGS: 'qr-create-settings',
    THEME: 'theme',
} as const;

export const PAGE_NAMES = {
    TEXT: 'text',
    JSON: 'json',
    BASE64: 'base64',
    QRCODE: 'qrcode',
    SHARE: 'share',
} as const;

export const BASE64_TABS = {
    MEDIA_TO_BASE64: 'media-to-base64',
    BASE64_TO_MEDIA: 'base64-to-media',
} as const;

export const TEXT_TABS = {
    DIFF: 'diff',
    CONVERT: 'convert',
    CLEAN: 'clean',
} as const;

export const JSON_TABS = {
    DIFF: 'diff',
    SCHEMA: 'schema',
    VIEWER: 'viewer',
    MINIFY: 'minify',
    FORMAT: 'format',
    PARSER: 'parser',
    EXPORT: 'export',
} as const;

export const SHARE_TABS = {
    TEXT: 'text',
} as const;

export const QRCODE_TABS = {
    CREATE: 'create',
} as const;

export const TAB_NAMES = {
    ...BASE64_TABS,
    ...TEXT_TABS,
    ...JSON_TABS,
    ...SHARE_TABS,
    ...QRCODE_TABS,
} as const;
