import type {
    JsonViewerState,
    JsonDiffState,
    JsonSchemaState,
    JsonParserState,
    JsonFormatState,
    JsonMinifyState,
    JsonExportState,
} from '@/lib/types/share';

export interface JsonViewerTabRef {
    getState(): JsonViewerState;
    setState(state: JsonViewerState): void;
}

export interface JsonDiffTabRef {
    getState(): JsonDiffState;
    setState(state: JsonDiffState): void;
}

export interface JsonSchemaTabRef {
    getState(): JsonSchemaState;
    setState(state: JsonSchemaState): void;
}

export interface JsonParserTabRef {
    getState(): JsonParserState;
    setState(state: JsonParserState): void;
}

export interface JsonFormatTabRef {
    getState(): JsonFormatState;
    setState(state: JsonFormatState): void;
}

export interface JsonMinifyTabRef {
    getState(): JsonMinifyState;
    setState(state: JsonMinifyState): void;
}

export interface JsonExportTabRef {
    getState(): JsonExportState;
    setState(state: JsonExportState): void;
}
