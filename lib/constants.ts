// localStorage keys used throughout the application

// JSON tool storage keys
export const STORAGE_KEYS = {
    // Diff tool
    JSON_DIFF_LEFT_CONTENT: 'json-diff-left-content',
    JSON_DIFF_RIGHT_CONTENT: 'json-diff-right-content',

    // Format tool
    JSON_FORMAT_LEFT_CONTENT: 'json-format-left-content',
    FORMAT_OPTIONS: 'format-options',

    // Minify tool
    JSON_MINIFY_LEFT_CONTENT: 'json-minify-left-content',
    MINIFY_OPTIONS: 'minify-options',

    // Parser tool
    JSON_PARSER_CONTENT: 'json-parser-content',

    // Viewer tool
    JSON_VIEWER_CONTENT: 'json-viewer-content',

    // Export tool
    JSON_EXPORT_CONTENT: 'json-export-content',

    // Schema tool
    JSON_SCHEMA_MODE: 'json-schema-mode',
    JSON_SCHEMA_JSON_CONTENT: 'json-schema-json-content',
    JSON_SCHEMA_SCHEMA_CONTENT: 'json-schema-schema-content',

    // Text tools
    TEXT_DIFF_LEFT_CONTENT: 'text-diff-left-content',
    TEXT_DIFF_RIGHT_CONTENT: 'text-diff-right-content',
    TEXT_CONVERT_INPUT_CONTENT: 'text-convert-input-content',
    TEXT_FORMAT_INPUT_CONTENT: 'text-format-input-content',
    TEXT_COUNT_INPUT_CONTENT: 'text-count-input-content',
    TEXT_CLEAN_INPUT_CONTENT: 'text-clean-input-content',

    // Git Branch Generator
    GIT_BRANCH_LAST_GENERATED: 'git-branch-last-generated',

    // Base64 tool
    BASE64_MEDIA_TO_BASE64_INPUT: 'base64-media-to-base64-input',
    BASE64_MEDIA_TO_BASE64_OUTPUT: 'base64-media-to-base64-output',
    BASE64_TO_MEDIA_INPUT: 'base64-to-media-input',

    // Theme
    THEME: 'theme',
} as const;
