import type { z } from 'zod';
import {
    CreateShareSchema,
    ShareMetadataSchema,
    ShareAccessResponseSchema,
    CreateShareResponseSchema,
    ShareErrorSchema,
    TextDiffStateSchema,
    TextConvertStateSchema,
    TextCleanStateSchema,
    JsonViewerStateSchema,
    JsonDiffStateSchema,
    JsonSchemaStateSchema,
    JsonParserStateSchema,
    JsonFormatStateSchema,
    JsonMinifyStateSchema,
    JsonExportStateSchema,
    Base64EncodeStateSchema,
    Base64DecodeStateSchema,
} from '@/lib/schemas/share';

// Infer types from schemas
export type CreateShareInput = z.infer<typeof CreateShareSchema>;
export type ShareMetadata = z.infer<typeof ShareMetadataSchema>;
export type ShareAccessResponse = z.infer<typeof ShareAccessResponseSchema>;
export type CreateShareResponse = z.infer<typeof CreateShareResponseSchema>;
export type ShareError = z.infer<typeof ShareErrorSchema>;

// Tab state types
export type TextDiffState = z.infer<typeof TextDiffStateSchema>;
export type TextConvertState = z.infer<typeof TextConvertStateSchema>;
export type TextCleanState = z.infer<typeof TextCleanStateSchema>;
export type JsonViewerState = z.infer<typeof JsonViewerStateSchema>;
export type JsonDiffState = z.infer<typeof JsonDiffStateSchema>;
export type JsonSchemaState = z.infer<typeof JsonSchemaStateSchema>;
export type JsonParserState = z.infer<typeof JsonParserStateSchema>;
export type JsonFormatState = z.infer<typeof JsonFormatStateSchema>;
export type JsonMinifyState = z.infer<typeof JsonMinifyStateSchema>;
export type JsonExportState = z.infer<typeof JsonExportStateSchema>;
export type Base64EncodeState = z.infer<typeof Base64EncodeStateSchema>;
export type Base64DecodeState = z.infer<typeof Base64DecodeStateSchema>;
