import type { TextDiffState, TextConvertState, TextCleanState } from '@/lib/types/share';

export interface TextDiffTabRef {
    getState(): TextDiffState;
    setState(state: TextDiffState): void;
}

export interface TextConvertTabRef {
    getState(): TextConvertState;
    setState(state: TextConvertState): void;
}

export interface TextCleanTabRef {
    getState(): TextCleanState;
    setState(state: TextCleanState): void;
}
