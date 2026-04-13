import type { Base64EncodeState, Base64DecodeState } from '@/lib/types/share';

export interface Base64EncodeTabRef {
    getState(): Base64EncodeState;
    setState(state: Base64EncodeState): void;
}

export interface Base64DecodeTabRef {
    getState(): Base64DecodeState;
    setState(state: Base64DecodeState): void;
}
