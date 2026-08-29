import { describe, expect, it } from 'vitest';
import { jsonToToon, toonToJson } from './toon-operations';

describe('TOON conversions', () => {
    const value = {
        users: [
            { id: 1, name: 'Ada', active: true },
            { id: 2, name: 'Linus', active: false },
        ],
    };

    it('encodes JSON as TOON', () => {
        expect(jsonToToon(JSON.stringify(value))).toBe(
            ['users[2]{id,name,active}:', '  1,Ada,true', '  2,Linus,false'].join('\n'),
        );
    });

    it('decodes TOON as formatted JSON', () => {
        const toon = jsonToToon(JSON.stringify(value));
        expect(JSON.parse(toonToJson(toon))).toEqual(value);
    });

    it('rejects invalid input in both directions', () => {
        expect(() => jsonToToon('{invalid')).toThrow();
        expect(() => toonToJson('users[2]: one')).toThrow();
    });
});
