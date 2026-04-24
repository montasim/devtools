export type HashAlgorithm = 'md5' | 'sha-1' | 'sha-256' | 'sha-512';

export interface HashAlgorithmOption {
    value: HashAlgorithm;
    label: string;
    description: string;
}

export const HASH_ALGORITHMS: HashAlgorithmOption[] = [
    { value: 'md5', label: 'MD5', description: '128-bit hash (not cryptographically secure)' },
    { value: 'sha-1', label: 'SHA-1', description: '160-bit hash (deprecated for security)' },
    { value: 'sha-256', label: 'SHA-256', description: '256-bit hash (recommended)' },
    { value: 'sha-512', label: 'SHA-512', description: '512-bit hash (high security)' },
];

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function computeMD5(text: string): string {
    const bytes = new TextEncoder().encode(text);

    const BIT_80 = 0x80;

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;

    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5,
        9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10,
        15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    ];

    const K = new Uint32Array([
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613,
        0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193,
        0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d,
        0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
        0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
        0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244,
        0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb,
        0xeb86d391,
    ]);

    function leftRotate(x: number, c: number): number {
        return ((x << c) | (x >>> (32 - c))) >>> 0;
    }

    const msgLen = bytes.length;
    const bitLen = msgLen * 8;
    const padLen = msgLen + 1 + ((55 - (msgLen % 64) + 64) % 64) + 8;
    const padded = new Uint8Array(padLen);
    padded.set(bytes);
    padded[msgLen] = BIT_80;

    const dv = new DataView(padded.buffer);
    dv.setUint32(padLen - 8, bitLen >>> 0, true);
    dv.setUint32(padLen - 4, 0, true);

    for (let offset = 0; offset < padLen; offset += 64) {
        const M = new Uint32Array(16);
        for (let j = 0; j < 16; j++) {
            M[j] = dv.getUint32(offset + j * 4, true);
        }

        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;

        for (let i = 0; i < 64; i++) {
            let F: number;
            let g: number;

            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            } else if (i < 32) {
                F = (D & B) | (~D & C);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * i) % 16;
            }

            F = (F + A + K[i] + M[g]) >>> 0;
            A = D;
            D = C;
            C = B;
            B = (B + leftRotate(F, S[i])) >>> 0;
        }

        a0 = (a0 + A) >>> 0;
        b0 = (b0 + B) >>> 0;
        c0 = (c0 + C) >>> 0;
        d0 = (d0 + D) >>> 0;
    }

    const result = new Uint8Array(16);
    const rv = new DataView(result.buffer);
    rv.setUint32(0, a0, true);
    rv.setUint32(4, b0, true);
    rv.setUint32(8, c0, true);
    rv.setUint32(12, d0, true);

    return Array.from(result)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

const SHA_ALGO_MAP: Record<string, string> = {
    'sha-1': 'SHA-1',
    'sha-256': 'SHA-256',
    'sha-512': 'SHA-512',
};

async function computeSHA(text: string, algorithm: string): Promise<string> {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(SHA_ALGO_MAP[algorithm], data);
    return bufferToHex(hashBuffer);
}

export async function computeHash(text: string, algorithm: HashAlgorithm): Promise<string> {
    if (algorithm === 'md5') {
        return computeMD5(text);
    }
    return computeSHA(text, algorithm);
}

export async function computeAllHashes(text: string): Promise<Record<HashAlgorithm, string>> {
    const entries = await Promise.all(
        HASH_ALGORITHMS.map(async (algo) => {
            const hash = await computeHash(text, algo.value);
            return [algo.value, hash] as const;
        }),
    );
    return Object.fromEntries(entries) as Record<HashAlgorithm, string>;
}

export type HmacAlgorithm = Exclude<HashAlgorithm, 'md5'>;

export interface HmacAlgorithmOption {
    value: HmacAlgorithm;
    label: string;
    description: string;
}

export const HMAC_ALGORITHMS: HmacAlgorithmOption[] = [
    { value: 'sha-256', label: 'HMAC-SHA256', description: '256-bit (recommended)' },
    { value: 'sha-1', label: 'HMAC-SHA1', description: '160-bit (legacy)' },
    { value: 'sha-512', label: 'HMAC-SHA512', description: '512-bit (high security)' },
];

export async function computeHmac(
    message: string,
    key: string,
    algorithm: HmacAlgorithm,
): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: SHA_ALGO_MAP[algorithm] },
        false,
        ['sign'],
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return bufferToHex(signature);
}

export async function computeAllHmacs(
    message: string,
    key: string,
): Promise<Record<HmacAlgorithm, string>> {
    const entries = await Promise.all(
        HMAC_ALGORITHMS.map(async (algo) => {
            const hmac = await computeHmac(message, key, algo.value);
            return [algo.value, hmac] as const;
        }),
    );
    return Object.fromEntries(entries) as Record<HmacAlgorithm, string>;
}
