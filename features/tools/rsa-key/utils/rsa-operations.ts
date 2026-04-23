export type RsaKeySize = 2048 | 3072 | 4096;
export type KeyFormat = 'pem' | 'der-base64';
export type KeyType = 'public' | 'private';

export const RSA_KEY_SIZES: { value: RsaKeySize; label: string; description: string }[] = [
    { value: 2048, label: '2048-bit', description: 'Standard security' },
    { value: 3072, label: '3072-bit', description: 'Enhanced security' },
    { value: 4096, label: '4096-bit', description: 'Maximum security' },
];

export interface RsaKeyPair {
    publicKeyPem: string;
    privateKeyPem: string;
    publicKeyDerBase64: string;
    privateKeyDerBase64: string;
    keySize: RsaKeySize;
    fingerprint: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

function arrayBufferToPem(buffer: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
    const base64 = arrayBufferToBase64(buffer);
    const lines = base64.match(/.{1,64}/g) ?? [];
    return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}

async function computeFingerprint(buffer: ArrayBuffer): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(':');
}

export async function generateRsaKeyPair(keySize: RsaKeySize): Promise<RsaKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: keySize,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['sign', 'verify'],
    );

    const [publicBuffer, privateBuffer] = await Promise.all([
        crypto.subtle.exportKey('spki', keyPair.publicKey),
        crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
    ]);

    const fingerprint = await computeFingerprint(publicBuffer);

    return {
        publicKeyPem: arrayBufferToPem(publicBuffer, 'PUBLIC KEY'),
        privateKeyPem: arrayBufferToPem(privateBuffer, 'PRIVATE KEY'),
        publicKeyDerBase64: arrayBufferToBase64(publicBuffer),
        privateKeyDerBase64: arrayBufferToBase64(privateBuffer),
        keySize,
        fingerprint,
    };
}
