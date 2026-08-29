import { decode, encode } from '@toon-format/toon';

export function jsonToToon(content: string): string {
    return encode(JSON.parse(content));
}

export function toonToJson(content: string): string {
    return JSON.stringify(decode(content), null, 2);
}
