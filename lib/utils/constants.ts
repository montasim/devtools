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
    XML_DIFF_LEFT_CONTENT: 'xml-diff-left-content',
    XML_DIFF_RIGHT_CONTENT: 'xml-diff-right-content',
    XML_FORMAT_LEFT_CONTENT: 'xml-format-left-content',
    XML_MINIFY_LEFT_CONTENT: 'xml-minify-left-content',
    XML_PARSER_CONTENT: 'xml-parser-content',
    XML_VIEWER_CONTENT: 'xml-viewer-content',
    TEXT_DIFF_LEFT_CONTENT: 'text-diff-left-content',
    TEXT_DIFF_RIGHT_CONTENT: 'text-diff-right-content',
    TEXT_CONVERT_INPUT_CONTENT: 'text-convert-input-content',
    TEXT_FORMAT_INPUT_CONTENT: 'text-format-input-content',
    TEXT_COUNT_INPUT_CONTENT: 'text-count-input-content',
    TEXT_CLEAN_INPUT_CONTENT: 'text-clean-input-content',
    SHARE_TEXT_CONTENT: 'share-text-content',
    GIT_BRANCH_LAST_GENERATED: 'git-branch-generator-result',
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
    NANOID_SIZE: 'nanoid-size',
    NANOID_ALPHABET: 'nanoid-alphabet',
    NANOID_QUANTITY: 'nanoid-quantity',
    NANOID_RESULTS: 'nanoid-results',
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
    CONTENT_TYPE_SEARCH: 'content-type-search',
    CSS_UNIT_STATE: 'css-unit-state',
    USER_AGENT_INPUT: 'user-agent-input',
    API_BUILDER_STATE: 'api-builder-state',
    API_BUILDER_LOAD_BALANCER_STATE: 'api-builder-load-balancer-state',
    CURL_CONVERT_INPUT: 'curl-convert-input',
    CURL_TESTER_REQUEST: 'curl-tester-request',
    WEBSOCKET_TESTER_URL: 'websocket-tester-url',
    CORS_CHECKER_URL: 'cors-checker-url',
    HTML_ENTITY_ENCODE_INPUT: 'html-entity-encode-input',
    HTML_ENTITY_DECODE_INPUT: 'html-entity-decode-input',
    UNICODE_SEARCH: 'unicode-search',
    ASCII_TABLE_SEARCH: 'ascii-table-search',
    PASSWORD_HASH_INPUT: 'password-hash-input',
    PASSWORD_VERIFY_INPUT: 'password-verify-input',
    RSA_KEY_INPUT: 'rsa-key-input',
    CERT_DECODER_INPUT: 'cert-decoder-input',
    CRON_BUILDER_CONFIG: 'cron-builder-config',
    NSLOOKUP_DOMAIN: 'nslookup-domain',
    NSLOOKUP_TYPE: 'nslookup-type',
    STUN_CHECKER_URL: 'stun-checker-url',
    TURN_CHECKER_URL: 'turn-checker-url',
    TEMP_EMAIL_INPUT: 'temp-email-input',
    FREE_EMAIL_INPUT: 'free-email-input',
    SPAM_WORDS_INPUT: 'spam-words-input',
    PASSPHRASE_WORDS_CONFIG: 'passphrase-words-config',
    PASSPHRASE_WORDS_RESULTS: 'passphrase-words-results',
    TIMEZONES_INPUT: 'timezones-input',
    FANCY_TEXT_INPUT: 'fancy-text-input',
    FANCY_TEXT_DECODE_INPUT: 'fancy-text-decode-input',
    LEET_TEXT_ENCODE_INPUT: 'leet-text-encode-input',
    LEET_TEXT_DECODE_INPUT: 'leet-text-decode-input',
    TEXT_ART_INPUT: 'text-art-input',
    TEXT_ART_DECODE_INPUT: 'text-art-decode-input',
    THEME: 'theme',
    RSS_ANALYZER_CONTENT: 'rss-analyzer-content',
    RSS_URL_ANALYZER_URL: 'rss-url-analyzer-url',
    JSON_TO_TS_INPUT_CONTENT: 'json-to-ts-input-content',
    JSON_TO_TS_ROOT_NAME: 'json-to-ts-root-name',
    PLAYGROUND_CODE: 'playground-code',
    HTTP_HEADER_INPUT_CONTENT: 'http-header-input-content',
    HTML_FORMAT_CONTENT: 'html-format-content',
    HTML_MINIFY_CONTENT: 'html-minify-content',
    HTML_VALIDATE_CONTENT: 'html-validate-content',
    CSS_FORMAT_CONTENT: 'css-format-content',
    CSS_MINIFY_CONTENT: 'css-minify-content',
    SQL_FORMAT_CONTENT: 'sql-format-content',
    SQL_MINIFY_CONTENT: 'sql-minify-content',
    SQL_FORMAT_DIALECT: 'sql-format-dialect',
    YAML_FORMAT_CONTENT: 'yaml-format-content',
    YAML_TO_JSON_YAML_CONTENT: 'yaml-to-json-yaml-content',
    JSON_TO_YAML_JSON_CONTENT: 'json-to-yaml-json-content',
    YAML_VALIDATE_CONTENT: 'yaml-validate-content',
    TIMESTAMP_CONVERT_CONTENT: 'timestamp-convert-content',
    JSON_ESCAPE_CONTENT: 'json-escape-content',
    REGEX_ESCAPE_CONTENT: 'regex-escape-content',
    SQL_ESCAPE_CONTENT: 'sql-escape-content',
    WEBHOOK_INBOX_ID: 'webhook-inbox-id',
    IP_ANALYZE_INPUT: 'ip-analyze-input',
    IP_CIDR_INPUT: 'ip-cidr-input',
    CSV_CONVERT_CONTENT: 'csv-convert-content',
    CSV_PREVIEW_CONTENT: 'csv-preview-content',
} as const;

export const PAGE_NAMES = {
    TEXT: 'text',
    JSON: 'json',
    XML: 'xml',
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
    CONTENT_TYPE: 'content-type',
    CSS_UNIT: 'css-unit',
    USER_AGENT: 'user-agent',
    API_BUILDER: 'api-builder',
    CURL: 'curl',
    WEBSOCKET: 'websocket',
    CORS: 'cors',
    HTML_ENTITY: 'html-entity',
    UNICODE: 'unicode',
    ASCII_TABLE: 'ascii-table',
    PASSWORD_HASH: 'password-hash',
    RSA_KEY: 'rsa-key',
    CERT_DECODER: 'cert-decoder',
    CRON: 'cron',
    NSLOOKUP: 'nslookup',
    STUN: 'stun',
    TURN: 'turn',
    TEMP_EMAIL: 'temp-email',
    FREE_EMAIL: 'free-email',
    SPAM_WORDS: 'spam-words',
    PASSPHRASE_WORDS: 'passphrase',
    TIMEZONES: 'timezones',
    FANCY_TEXT: 'fancy-text',
    LEET_TEXT: 'leet-text',
    TEXT_ART: 'text-art',
    EMOJI: 'emoji',
    RSS: 'rss',
    SAMPLE: 'sample',
    WEB_PLAYGROUND: 'web-playground',
    HTTP_HEADER_PARSER: 'http-header-parser',
    SVG_OPTIMIZER: 'svg',
    HTML: 'html',
    CSS: 'css',
    SQL: 'sql',
    YAML: 'yaml',
    TIMESTAMP: 'timestamp',
    WEBHOOK: 'webhook',
    IP: 'ip',
    CSV: 'csv',
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
    TYPESCRIPT: 'typescript',
} as const;

export const XML_TABS = {
    DIFF: 'diff',
    VIEWER: 'viewer',
    MINIFY: 'minify',
    FORMAT: 'format',
    PARSER: 'parser',
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
    NANOID: 'nanoid',
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

export const CONTENT_TYPE_TABS = {
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
    TESTER: 'tester',
} as const;

export const WEBSOCKET_TABS = {
    TESTER: 'tester',
} as const;

export const CORS_TABS = {
    CHECKER: 'checker',
} as const;

export const HTML_ENTITY_TABS = {
    ENCODE: 'encode',
    DECODE: 'decode',
} as const;

export const UNICODE_TABS = {
    LOOKUP: 'lookup',
} as const;

export const ASCII_TABLE_TABS = {
    REFERENCE: 'reference',
} as const;

export const PASSWORD_HASH_TABS = {
    HASH: 'hash',
    VERIFY: 'verify',
} as const;

export const RSA_KEY_TABS = {
    GENERATE: 'generate',
} as const;

export const CERT_DECODER_TABS = {
    DECODE: 'decode',
} as const;

export const CRON_TABS = {
    BUILDER: 'builder',
} as const;

export const NSLOOKUP_TABS = {
    LOOKUP: 'lookup',
} as const;

export const STUN_TABS = {
    CHECKER: 'checker',
} as const;

export const TURN_TABS = {
    CHECKER: 'checker',
} as const;

export const TEMP_EMAIL_TABS = {
    CHECKER: 'checker',
    SAMPLE_DATA: 'sample-data',
} as const;

export const FREE_EMAIL_TABS = {
    CHECKER: 'checker',
    SAMPLE_DATA: 'sample-data',
} as const;

export const SPAM_WORDS_TABS = {
    CHECKER: 'checker',
    BROWSER: 'browser',
} as const;

export const PASSPHRASE_WORDS_TABS = {
    BROWSER: 'browser',
    GENERATE: 'generate',
} as const;

export const TIMEZONES_TABS = {
    WORLD_CLOCK: 'world-clock',
    BROWSER: 'browser',
} as const;

export const FANCY_TEXT_TABS = {
    GENERATE: 'generate',
    DECODE: 'decode',
} as const;

export const LEET_TEXT_TABS = {
    ENCODE: 'encode',
    DECODE: 'decode',
    CHARACTERS: 'characters',
} as const;

export const TEXT_ART_TABS = {
    GENERATE: 'generate',
    DECODE: 'decode',
    STYLES: 'styles',
} as const;

export const EMOJI_TABS = {
    BROWSE: 'browse',
} as const;

export const RSS_TABS = {
    ANALYZER: 'analyzer',
    URL_ANALYZER: 'url-analyzer',
} as const;

export const SVG_OPTIMIZER_TABS = {
    OPTIMIZER: 'optimizer',
    PREVIEWER: 'previewer',
} as const;

export const HTML_TABS = {
    FORMAT: 'format',
    MINIFY: 'minify',
    VALIDATE: 'validate',
} as const;

export const CSS_TABS = {
    FORMAT: 'format',
    MINIFY: 'minify',
} as const;

export const SQL_TABS = {
    FORMAT: 'format',
    MINIFY: 'minify',
} as const;

export const YAML_TABS = {
    FORMAT: 'format',
    YAML_TO_JSON: 'yaml-to-json',
    JSON_TO_YAML: 'json-to-yaml',
    VALIDATE: 'validate',
} as const;

export const TIMESTAMP_TABS = {
    CONVERT: 'convert',
} as const;

export const WEBHOOK_TABS = {
    INBOX: 'inbox',
} as const;

export const IP_TABS = {
    ANALYZE: 'analyze',
    CALCULATOR: 'calculator',
} as const;

export const CSV_TABS = {
    CONVERT: 'convert',
    PREVIEW: 'preview',
} as const;

export const TOOL_COUNT = Object.keys(PAGE_NAMES).length;

export const TOOL_COUNT_LABEL = `${TOOL_COUNT - 3}+`;

export const TAB_NAMES = {
    ...BASE64_TABS,
    ...TEXT_TABS,
    ...JSON_TABS,
    ...XML_TABS,
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
    ...CONTENT_TYPE_TABS,
    ...CSS_UNIT_TABS,
    ...USER_AGENT_TABS,
    ...API_BUILDER_TABS,
    ...CURL_TABS,
    ...WEBSOCKET_TABS,
    ...CORS_TABS,
    ...HTML_ENTITY_TABS,
    ...UNICODE_TABS,
    ...ASCII_TABLE_TABS,
    ...PASSWORD_HASH_TABS,
    ...RSA_KEY_TABS,
    ...CERT_DECODER_TABS,
    ...CRON_TABS,
    ...NSLOOKUP_TABS,
    ...STUN_TABS,
    ...TURN_TABS,
    ...TEMP_EMAIL_TABS,
    ...FREE_EMAIL_TABS,
    ...SPAM_WORDS_TABS,
    ...PASSPHRASE_WORDS_TABS,
    ...TIMEZONES_TABS,
    ...FANCY_TEXT_TABS,
    ...LEET_TEXT_TABS,
    ...TEXT_ART_TABS,
    ...EMOJI_TABS,
    ...RSS_TABS,
    ...SVG_OPTIMIZER_TABS,
    ...HTML_TABS,
    ...CSS_TABS,
    ...SQL_TABS,
    ...YAML_TABS,
    ...TIMESTAMP_TABS,
    ...WEBHOOK_TABS,
    ...IP_TABS,
    ...CSV_TABS,
} as const;
