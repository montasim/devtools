import { z } from 'zod';

// Request schemas
export const CreateShareSchema = z.object({
    pageName: z.enum(['text', 'json', 'base64']),
    tabName: z.enum([
        // Text tabs
        'diff',
        'convert',
        'clean',
        // JSON tabs
        'viewer',
        'schema',
        'parser',
        'format',
        'minify',
        'export',
        // Base64 tabs
        'media-to-base64',
        'base64-to-media',
    ]),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    comment: z.string().max(1000, 'Comment too long').optional(),
    state: z.any(),
    expiration: z.enum(['1h', '1d', '7d', '30d']).optional(),
    password: z.string().min(4, 'Password must be at least 4 characters').max(100).optional(),
});

export const AccessShareSchema = z.object({
    password: z.string().optional(),
});

// Response schemas
export const ShareMetadataSchema = z.object({
    id: z.string(),
    pageName: z.string(),
    tabName: z.string(),
    title: z.string(),
    comment: z.string().nullable(),
    expiresAt: z.string().nullable(),
    hasPassword: z.boolean(),
    viewCount: z.number(),
    createdAt: z.string(),
});

export const ShareAccessResponseSchema = z.object({
    state: z.any(),
    linkId: z.string(),
    pageName: z.string(),
    tabName: z.string(),
    title: z.string(),
    comment: z.string().nullable(),
    expiresAt: z.string().nullable(),
    hasPassword: z.boolean(),
    viewCount: z.number(),
});

export const CreateShareResponseSchema = z.object({
    id: z.string(),
    shortUrl: z.string(),
    fullUrl: z.string(),
    expiresAt: z.string().nullable(),
    hasPassword: z.boolean(),
});

export const ShareErrorSchema = z.object({
    error: z.enum([
        'NOT_FOUND',
        'LINK_EXPIRED',
        'PASSWORD_REQUIRED',
        'INVALID_PASSWORD',
        'STATE_TOO_LARGE',
        'RATE_LIMITED',
        'INVALID_STATE',
    ]),
    message: z.string(),
    details: z.any().optional(),
    retryAfter: z.number().optional(),
});

// Tab-specific state schemas
export const TextDiffStateSchema = z.object({
    leftContent: z.string().max(1_000_000, 'Content too large'),
    rightContent: z.string().max(1_000_000, 'Content too large'),
});

export const TextConvertStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
    conversionType: z.string().nullable(),
});

export const TextCleanStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
    selectedOperations: z.array(z.string()),
});

export const JsonViewerStateSchema = z.object({
    input: z.string().max(1_000_000),
    format: z.boolean(),
});

export const JsonDiffStateSchema = z.object({
    leftContent: z.string().max(1_000_000),
    rightContent: z.string().max(1_000_000),
});

export const JsonSchemaStateSchema = z.object({
    input: z.string().max(1_000_000),
    schema: z.string().max(1_000_000),
    validationErrors: z.array(z.any()),
});

export const JsonParserStateSchema = z.object({
    input: z.string().max(1_000_000),
    parsed: z.any(),
});

export const JsonFormatStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
    indent: z.number(),
});

export const JsonMinifyStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
});

export const JsonExportStateSchema = z.object({
    input: z.string().max(1_000_000),
    exportFormat: z.enum(['csv', 'xml', 'yaml']),
    output: z.string().max(1_000_000),
});

export const Base64EncodeStateSchema = z.object({
    input: z.string().max(1_000_000),
    mimeType: z.string(),
    fileName: z.string(),
});

export const Base64DecodeStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
});
