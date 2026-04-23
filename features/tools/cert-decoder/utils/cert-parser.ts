export interface CertField {
    label: string;
    value: string;
    mono?: boolean;
}

export interface CertExtension {
    oid: string;
    name: string;
    value: string;
    critical: boolean;
}

export interface DecodedCert {
    version: number;
    serialNumber: string;
    signatureAlgorithm: string;
    issuer: CertField[];
    subject: CertField[];
    notBefore: string;
    notAfter: string;
    validityDays: number;
    isExpired: boolean;
    publicKeyAlgorithm: string;
    publicKeySize: string;
    extensions: CertExtension[];
    fingerprintSHA256: string;
    fingerprintSHA1: string;
    rawPem: string;
}

const OID_MAP: Record<string, string> = {
    '2.5.4.3': 'CN',
    '2.5.4.4': 'ST',
    '2.5.4.5': 'serialNumber',
    '2.5.4.6': 'C',
    '2.5.4.7': 'L',
    '2.5.4.8': 'ST',
    '2.5.4.9': 'street',
    '2.5.4.10': 'O',
    '2.5.4.11': 'OU',
    '2.5.4.12': 'title',
    '2.5.4.17': 'postalCode',
    '2.5.4.41': 'name',
    '2.5.4.42': 'GN',
    '2.5.4.44': 'generationQualifier',
    '2.5.4.46': 'dnQualifier',
    '2.5.4.97': 'organizationIdentifier',
    '1.2.840.113549.1.1.1': 'RSA',
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
    '1.2.840.10045.2.1': 'ECDSA',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '2.16.840.1.101.3.4.3.2': 'SHA-256 with RSA',
    '2.5.29.14': 'Subject Key Identifier',
    '2.5.29.15': 'Key Usage',
    '2.5.29.17': 'Subject Alternative Name',
    '2.5.29.19': 'Basic Constraints',
    '2.5.29.31': 'CRL Distribution Points',
    '2.5.29.32': 'Certificate Policies',
    '2.5.29.35': 'Authority Key Identifier',
    '2.5.29.37': 'Extended Key Usage',
    '1.3.6.1.5.5.7.1.1': 'Authority Information Access',
    '1.3.6.1.5.5.7.1.3': 'Qualified Certificate Statements',
    '1.3.6.1.4.1.11129.2.4.2': 'CT Precertificate SCTs',
};

function oidToName(oid: string): string {
    return OID_MAP[oid] ?? oid;
}

interface Asn1Node {
    tag: number;
    constructed: boolean;
    value: Uint8Array;
    children: Asn1Node[];
    raw: Uint8Array;
}

function parseAsn1(
    data: Uint8Array,
    offset: number = 0,
    end?: number,
): { node: Asn1Node; nextOffset: number } {
    const limit = end ?? data.length;
    if (offset >= limit) throw new Error('Unexpected end of data');

    const tag = data[offset++];
    const constructed = (tag & 0x20) !== 0;

    let length: number;
    const lenByte = data[offset++];
    if (lenByte & 0x80) {
        const numBytes = lenByte & 0x7f;
        length = 0;
        for (let i = 0; i < numBytes; i++) {
            length = (length << 8) | data[offset++];
        }
    } else {
        length = lenByte;
    }

    const valueStart = offset;
    const valueEnd = valueStart + length;
    const raw = data.slice(valueStart - 2 - (lenByte & 0x80 ? (lenByte & 0x7f) + 1 : 0), valueEnd);

    const value = data.slice(valueStart, valueEnd);
    const children: Asn1Node[] = [];

    if (constructed && length > 0) {
        let childOffset = valueStart;
        while (childOffset < valueEnd) {
            const { node, nextOffset } = parseAsn1(data, childOffset, valueEnd);
            children.push(node);
            childOffset = nextOffset;
        }
    }

    return { node: { tag, constructed, value, children, raw }, nextOffset: valueEnd };
}

function parseDer(der: Uint8Array): Asn1Node {
    const { node } = parseAsn1(der);
    return node;
}

function readBigInt(bytes: Uint8Array): string {
    let hex = '';
    for (const b of bytes) {
        hex += b.toString(16).padStart(2, '0');
    }
    return hex.toUpperCase().replace(/^(00)+/, '') || '0';
}

function readInteger(node: Asn1Node): number {
    if (node.tag !== 0x02) return 0;
    let val = 0;
    for (const b of node.value) {
        val = (val << 8) | b;
    }
    return val;
}

function readIntegerHex(node: Asn1Node): string {
    return readBigInt(node.value);
}

function readOid(node: Asn1Node): string {
    if (node.tag !== 0x06) return '';
    const bytes = node.value;
    if (bytes.length === 0) return '';

    const components: string[] = [];
    const first = bytes[0];
    components.push(String(Math.floor(first / 40)));
    components.push(String(first % 40));

    let val = 0;
    for (let i = 1; i < bytes.length; i++) {
        val = (val << 7) | (bytes[i] & 0x7f);
        if (!(bytes[i] & 0x80)) {
            components.push(String(val));
            val = 0;
        }
    }

    return components.join('.');
}

function readString(node: Asn1Node): string {
    if (node.tag === 0x0c) return decodeUtf8(node.value);
    if (node.tag === 0x13 || node.tag === 0x16 || node.tag === 0x1a) {
        return decodeUtf8(node.value);
    }
    if (node.tag === 0x0e) return decodeUtf8(node.value);
    if (node.tag === 0x05 && node.value.length === 0) return '';
    if (node.tag === 0x04) return decodeUtf8(node.value);
    return Array.from(node.value)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(':');
}

function decodeUtf8(bytes: Uint8Array): string {
    return new TextDecoder('utf-8').decode(bytes);
}

function readTime(node: Asn1Node): string {
    const str = decodeUtf8(node.value);
    if (node.tag === 0x17) {
        const yy = parseInt(str.slice(0, 2));
        const year = yy >= 50 ? 1900 + yy : 2000 + yy;
        const month = str.slice(2, 4);
        const day = str.slice(4, 6);
        const hour = str.slice(6, 8);
        const min = str.slice(8, 10);
        const sec = str.slice(10, 12);
        return `${year}-${month}-${day} ${hour}:${min}:${sec} UTC`;
    }
    if (node.tag === 0x18) {
        return str.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}).*/, '$1-$2-$3 $4:$5:$6 UTC');
    }
    return str;
}

function parseName(node: Asn1Node): CertField[] {
    const fields: CertField[] = [];
    for (const set of node.children) {
        for (const seq of set.children) {
            if (seq.children.length >= 2) {
                const oid = readOid(seq.children[0]);
                const value = readString(seq.children[1]);
                fields.push({ label: oidToName(oid), value, mono: false });
            }
        }
    }
    return fields;
}

function parseExtensions(node: Asn1Node): CertExtension[] {
    const exts: CertExtension[] = [];
    for (const seq of node.children) {
        if (seq.children.length < 2) continue;

        const oid = readOid(seq.children[0]);
        let idx = 1;
        let critical = false;

        if (idx < seq.children.length && seq.children[idx].tag === 0x01) {
            critical = seq.children[idx].value[0] !== 0;
            idx++;
        }

        let value = '';
        if (idx < seq.children.length && seq.children[idx].tag === 0x04) {
            const octet = seq.children[idx];
            try {
                const inner = parseAsn1(octet.value, 0, octet.value.length);
                value = formatExtensionValue(oid, inner.node);
            } catch {
                value = decodeUtf8(octet.value);
            }
        }

        exts.push({ oid, name: oidToName(oid), value, critical });
    }
    return exts;
}

function formatExtensionValue(oid: string, node: Asn1Node): string {
    if (oid === '2.5.29.17') {
        const names: string[] = [];
        for (const child of node.children) {
            const alt = readString(child);
            if (child.tag === 0x82) names.push(`DNS:${alt}`);
            else if (child.tag === 0x81) names.push(`RFC822:${alt}`);
            else if (child.tag === 0x86) names.push(`URI:${alt}`);
            else if (child.tag === 0x87) names.push(`IP:${readBigInt(child.value)}`);
            else names.push(alt);
        }
        return names.join(', ');
    }
    if (oid === '2.5.29.19') {
        if (node.children.length > 0 && node.children[0].tag === 0x01) {
            const isCA = node.children[0].value[0] !== 0;
            return isCA ? 'CA:TRUE' : 'CA:FALSE';
        }
        return 'CA:FALSE';
    }
    if (oid === '2.5.29.14' || oid === '2.5.29.35') {
        return readBigInt(node.children.length > 0 ? node.children[0].value : node.value);
    }
    if (oid === '2.5.29.15') {
        if (node.children.length > 0) {
            const bits = node.children[0];
            return `0x${readBigInt(bits.value)}`;
        }
        return readBigInt(node.value);
    }
    if (oid === '2.5.29.37') {
        const usages: string[] = [];
        for (const child of node.children) {
            usages.push(oidToName(readOid(child)));
        }
        return usages.join(', ');
    }
    try {
        const parts: string[] = [];
        for (const child of node.children) {
            parts.push(readString(child));
        }
        return parts.filter(Boolean).join(', ') || readBigInt(node.value);
    } catch {
        return readBigInt(node.value);
    }
}

function readBitLength(node: Asn1Node): string {
    if (node.children.length === 0) return 'unknown';
    const bits = node.children[0];
    const keyBytes = bits.value.slice(1);
    const bitLen = keyBytes.length * 8;
    return `${bitLen} bits`;
}

function parsePublicKeyInfo(spki: Asn1Node): { algorithm: string; size: string } {
    if (spki.children.length < 2) return { algorithm: 'unknown', size: 'unknown' };

    const algoSeq = spki.children[0];
    const oid = readOid(algoSeq.children[0]);
    const algo = oidToName(oid);

    let size = 'unknown';
    try {
        size = readBitLength(spki.children[1]);
    } catch {}

    return { algorithm: algo, size };
}

function pemToDer(pem: string): Uint8Array {
    const b64 = pem
        .replace(/-----BEGIN [^-]+-----/, '')
        .replace(/-----END [^-]+-----/, '')
        .replace(/\s/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function computeFingerprints(der: Uint8Array): Promise<{ sha256: string; sha1: string }> {
    const [sha256Buf, sha1Buf] = await Promise.all([
        crypto.subtle.digest('SHA-256', der.buffer as ArrayBuffer),
        crypto.subtle.digest('SHA-1', der.buffer as ArrayBuffer),
    ]);
    const toHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(':');
    return { sha256: toHex(sha256Buf), sha1: toHex(sha1Buf) };
}

export function isLikelyPem(input: string): boolean {
    return /-----BEGIN\s+(CERTIFICATE|X\.?509)/.test(input.trim());
}

export async function decodeCertificate(pem: string): Promise<DecodedCert> {
    const trimmed = pem.trim();
    const der = pemToDer(trimmed);
    const root = parseDer(der);

    const tbsCert = root.children[0];

    const versionNode = tbsCert.children[0];
    const version = versionNode.tag === 0xa0 ? readInteger(versionNode.children[0]) + 1 : 1;

    let childIdx = versionNode.tag === 0xa0 ? 1 : 0;
    const serialNumber = readIntegerHex(tbsCert.children[childIdx++]);
    const signatureAlgorithm = oidToName(readOid(tbsCert.children[childIdx].children[0]));
    childIdx++;

    const issuer = parseName(tbsCert.children[childIdx++]);
    const validity = tbsCert.children[childIdx++];
    const notBefore = readTime(validity.children[0]);
    const notAfter = readTime(validity.children[1]);

    const subject = parseName(tbsCert.children[childIdx++]);
    const pubKeyInfo = parsePublicKeyInfo(tbsCert.children[childIdx++]);

    let extensions: CertExtension[] = [];
    while (childIdx < tbsCert.children.length) {
        const child = tbsCert.children[childIdx++];
        if (child.tag === 0xa3 && child.children.length > 0) {
            const extSeq = child.children[0];
            extensions = parseExtensions(extSeq);
        }
    }

    const notBeforeDate = new Date(notBefore.replace(' UTC', 'Z'));
    const notAfterDate = new Date(notAfter.replace(' UTC', 'Z'));
    const validityDays = Math.round(
        (notAfterDate.getTime() - notBeforeDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isExpired = new Date() > notAfterDate;

    const fingerprints = await computeFingerprints(der);

    return {
        version,
        serialNumber,
        signatureAlgorithm,
        issuer,
        subject,
        notBefore,
        notAfter,
        validityDays,
        isExpired,
        publicKeyAlgorithm: pubKeyInfo.algorithm,
        publicKeySize: pubKeyInfo.size,
        extensions,
        fingerprintSHA256: fingerprints.sha256,
        fingerprintSHA1: fingerprints.sha1,
        rawPem: trimmed,
    };
}
