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
    HASH_GENERATE_INPUT: 'hash-generate-input',
    HASH_HMAC_INPUT: 'hash-hmac-input',
    HASH_HMAC_KEY: 'hash-hmac-key',
    URL_ENCODE_INPUT: 'url-encode-input',
    URL_DECODE_INPUT: 'url-decode-input',
    UUID_VERSION: 'uuid-version',
    UUID_QUANTITY: 'uuid-quantity',
    UUID_RESULTS: 'uuid-results',
    ULID_QUANTITY: 'ulid-quantity',
    ULID_RESULTS: 'ulid-results',
    MARKDOWN_PREVIEW_INPUT: 'markdown-preview-input',
    REGEX_TEST_INPUT: 'regex-test-input',
    PASSWORD_CONFIG: 'password-config',
    PASSWORD_RESULTS: 'password-results',
    COLOR_PICKER_HEX: 'color-picker-hex',
    COLOR_PALETTE_BASE: 'color-palette-base',
    COLOR_PALETTE_MODE: 'color-palette-mode',
    NUMBER_BASE_STATE: 'number-base-state',
    UNIT_DATA_STATE: 'unit-data-state',
    UNIT_TIME_STATE: 'unit-time-state',
    UNIT_TIMEZONE_STATE: 'unit-timezone-state',
    HTTP_STATUS_SEARCH: 'http-status-search',
    MIME_TYPE_SEARCH: 'mime-type-search',
    CSS_UNIT_STATE: 'css-unit-state',
    USER_AGENT_INPUT: 'user-agent-input',
    API_BUILDER_STATE: 'api-builder-state',
    CURL_CONVERT_INPUT: 'curl-convert-input',
    THEME: 'theme',
} as const;

export const PAGE_NAMES = {
    TEXT: 'text',
    JSON: 'json',
    BASE64: 'base64',
    QRCODE: 'qrcode',
    SHARE: 'share',
    HASH: 'hash',
    URL_ENCODE: 'url-encode',
    ID: 'id',
    MARKDOWN: 'markdown',
    REGEX: 'regex',
    PASSWORD: 'password',
    COLOR: 'color',
    NUMBER_BASE: 'number-base',
    UNIT: 'unit',
    HTTP_STATUS: 'http-status',
    MIME_TYPE: 'mime-type',
    CSS_UNIT: 'css-unit',
    USER_AGENT: 'user-agent',
    API_BUILDER: 'api-builder',
    CURL: 'curl',
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

export const HASH_TABS = {
    GENERATE: 'generate',
    HMAC: 'hmac',
} as const;

export const URL_ENCODE_TABS = {
    ENCODE: 'encode',
    DECODE: 'decode',
} as const;

export const ID_TABS = {
    UUID: 'uuid',
    ULID: 'ulid',
} as const;

export const MARKDOWN_TABS = {
    PREVIEW: 'preview',
} as const;

export const REGEX_TABS = {
    TEST: 'test',
} as const;

export const PASSWORD_TABS = {
    GENERATE: 'generate',
} as const;

export const COLOR_TABS = {
    PICKER: 'picker',
    PALETTE: 'palette',
} as const;

export const NUMBER_BASE_TABS = {
    CONVERT: 'convert',
} as const;

export const UNIT_TABS = {
    DATA: 'data',
    TIME: 'time',
    TIMEZONE: 'timezone',
} as const;

export const HTTP_STATUS_TABS = {
    REFERENCE: 'reference',
} as const;

export const MIME_TYPE_TABS = {
    REFERENCE: 'reference',
} as const;

export const CSS_UNIT_TABS = {
    CONVERT: 'convert',
} as const;

export const USER_AGENT_TABS = {
    ANALYZER: 'analyzer',
} as const;

export const API_BUILDER_TABS = {
    BUILDER: 'builder',
} as const;

export const CURL_TABS = {
    CONVERT: 'convert',
} as const;

export const TAB_NAMES = {
    ...BASE64_TABS,
    ...TEXT_TABS,
    ...JSON_TABS,
    ...SHARE_TABS,
    ...QRCODE_TABS,
    ...HASH_TABS,
    ...URL_ENCODE_TABS,
    ...ID_TABS,
    ...MARKDOWN_TABS,
    ...REGEX_TABS,
    ...PASSWORD_TABS,
    ...COLOR_TABS,
    ...NUMBER_BASE_TABS,
    ...UNIT_TABS,
    ...HTTP_STATUS_TABS,
    ...MIME_TYPE_TABS,
    ...CSS_UNIT_TABS,
    ...USER_AGENT_TABS,
    ...API_BUILDER_TABS,
    ...CURL_TABS,
} as const;
