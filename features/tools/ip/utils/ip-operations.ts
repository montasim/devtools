export type IpVersion = 'ipv4' | 'ipv6' | 'invalid';
export type IpType =
    | 'loopback'
    | 'private'
    | 'apipa'
    | 'multicast'
    | 'broadcast'
    | 'documentation'
    | 'reserved'
    | 'public';

export interface IpInfo {
    version: IpVersion;
    address: string;
    type: IpType;
    typeLabel: string;
    binary?: string; // IPv4 only: dotted binary "00001010.00000001.00000001.00000001"
    hex?: string; // IPv4 only: "0A.01.01.01"
    decimal?: number; // IPv4 only: 32-bit unsigned integer
    expanded?: string; // IPv6 only: full expanded form
    compressed?: string; // IPv6 only: compressed form
    isValid: boolean;
    error?: string;
}

export interface CidrInfo {
    cidr: string;
    network: string;
    broadcast: string;
    firstHost: string;
    lastHost: string;
    totalHosts: number;
    usableHosts: number;
    subnetMask: string;
    wildcardMask: string;
    prefixLength: number;
    ipClass: string; // A, B, C, D, E or N/A
    isPrivate: boolean;
    networkDecimal: number;
    broadcastDecimal: number;
    binary: {
        network: string;
        mask: string;
    };
    isValid: boolean;
    error?: string;
}

// ─── IPv4 helpers ────────────────────────────────────────────────────────────

export function ipToInt(ip: string): number {
    const parts = ip.split('.');
    return (
        ((parseInt(parts[0], 10) << 24) |
            (parseInt(parts[1], 10) << 16) |
            (parseInt(parts[2], 10) << 8) |
            parseInt(parts[3], 10)) >>>
        0
    );
}

export function intToIp(n: number): string {
    return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
}

function isValidIpv4(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => {
        if (p === '' || p.length > 3) return false;
        const n = Number(p);
        return Number.isInteger(n) && n >= 0 && n <= 255 && String(n) === p;
    });
}

function classifyIpv4(ip: string): { type: IpType; label: string } {
    const n = ipToInt(ip);

    // 255.255.255.255 — broadcast
    if (n === 0xffffffff) return { type: 'broadcast', label: 'Broadcast' };

    // 0.0.0.0/8 — reserved (this network)
    if (n >>> 24 === 0) return { type: 'reserved', label: 'Reserved (This Network)' };

    // 127.0.0.0/8 — loopback
    if (n >>> 24 === 127) return { type: 'loopback', label: 'Loopback' };

    // 169.254.0.0/16 — APIPA / link-local
    if (n >>> 16 === 0xa9fe) return { type: 'apipa', label: 'APIPA / Link-Local' };

    // 10.0.0.0/8 — private
    if (n >>> 24 === 10) return { type: 'private', label: 'Private (RFC 1918)' };

    // 172.16.0.0/12 — private
    if (n >>> 20 === (0xac1 << 4) >>> 4) {
        const second = (n >>> 16) & 0xff;
        if (second >= 16 && second <= 31) return { type: 'private', label: 'Private (RFC 1918)' };
    }

    // 192.168.0.0/16 — private
    if (n >>> 16 === 0xc0a8) return { type: 'private', label: 'Private (RFC 1918)' };

    // Documentation ranges
    // 192.0.2.0/24
    if (n >>> 8 === 0xc00002) return { type: 'documentation', label: 'Documentation (TEST-NET-1)' };
    // 198.51.100.0/24
    if (n >>> 8 === 0xc6336400 >>> 8)
        return { type: 'documentation', label: 'Documentation (TEST-NET-2)' };
    // 203.0.113.0/24
    if (n >>> 8 === 0xcb007100 >>> 8)
        return { type: 'documentation', label: 'Documentation (TEST-NET-3)' };

    // 224.0.0.0/4 — multicast
    if (n >>> 28 === 0xe) return { type: 'multicast', label: 'Multicast' };

    // 240.0.0.0/4 — reserved
    if (n >>> 28 === 0xf) return { type: 'reserved', label: 'Reserved' };

    return { type: 'public', label: 'Public' };
}

function toBinaryOctet(n: number): string {
    return n.toString(2).padStart(8, '0');
}

function toHexOctet(n: number): string {
    return n.toString(16).toUpperCase().padStart(2, '0');
}

// ─── IPv6 helpers ────────────────────────────────────────────────────────────

function isValidIpv6(ip: string): boolean {
    // Handle embedded IPv4 in IPv6 (e.g. ::ffff:192.0.2.1)
    const ipv4Embedded = ip.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
    let testIp = ip;
    if (ipv4Embedded) {
        if (!isValidIpv4(ipv4Embedded[2])) return false;
        testIp = ipv4Embedded[1] + '0:0';
    }

    const doubleColonCount = (testIp.match(/::/g) || []).length;
    if (doubleColonCount > 1) return false;

    const sides = testIp.split('::');
    const groups: string[] = [];

    if (sides.length === 2) {
        const left = sides[0] ? sides[0].split(':') : [];
        const right = sides[1] ? sides[1].split(':') : [];
        if (left.length + right.length > 7) return false;
        groups.push(...left, ...right);
    } else {
        const parts = testIp.split(':');
        if (parts.length !== 8) return false;
        groups.push(...parts);
    }

    return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
}

function expandIpv6(ip: string): string {
    // Handle embedded IPv4
    const ipv4Embedded = ip.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
    if (ipv4Embedded && isValidIpv4(ipv4Embedded[2])) {
        const ipv4Parts = ipv4Embedded[2].split('.').map(Number);
        const last2Groups =
            toHexOctet(ipv4Parts[0]) +
            toHexOctet(ipv4Parts[1]) +
            ':' +
            toHexOctet(ipv4Parts[2]) +
            toHexOctet(ipv4Parts[3]);
        ip = ipv4Embedded[1] + last2Groups;
    }

    const halves = ip.split('::');
    let full: string[];

    if (halves.length === 2) {
        const left = halves[0] ? halves[0].split(':') : [];
        const right = halves[1] ? halves[1].split(':') : [];
        const missing = 8 - left.length - right.length;
        full = [...left, ...Array(missing).fill('0'), ...right];
    } else {
        full = ip.split(':');
    }

    return full.map((g) => g.padStart(4, '0')).join(':');
}

function compressIpv6(expanded: string): string {
    const groups = expanded.split(':');

    // Find the longest run of consecutive all-zero groups
    let bestStart = -1;
    let bestLen = 0;
    let curStart = -1;
    let curLen = 0;

    for (let i = 0; i < groups.length; i++) {
        if (parseInt(groups[i], 16) === 0) {
            if (curStart === -1) {
                curStart = i;
                curLen = 1;
            } else {
                curLen++;
            }
            if (curLen > bestLen) {
                bestStart = curStart;
                bestLen = curLen;
            }
        } else {
            curStart = -1;
            curLen = 0;
        }
    }

    const stripped = groups.map((g) => parseInt(g, 16).toString(16));

    if (bestLen < 2) return stripped.join(':');

    const left = stripped.slice(0, bestStart).join(':');
    const right = stripped.slice(bestStart + bestLen).join(':');

    if (bestStart === 0 && bestStart + bestLen === 8) return '::';
    if (bestStart === 0) return '::' + right;
    if (bestStart + bestLen === 8) return left + '::';
    return left + '::' + right;
}

function classifyIpv6(ip: string): { type: IpType; label: string } {
    const expanded = expandIpv6(ip);
    const groups = expanded.split(':').map((g) => parseInt(g, 16));

    // ::1 — loopback
    if (groups.every((g, i) => (i === 7 ? g === 1 : g === 0))) {
        return { type: 'loopback', label: 'Loopback (::1)' };
    }

    // fc00::/7 — Unique Local (private)
    if ((groups[0] & 0xfe00) === 0xfc00) {
        return { type: 'private', label: 'Unique Local (RFC 4193)' };
    }

    // fe80::/10 — link-local (APIPA equivalent)
    if ((groups[0] & 0xffc0) === 0xfe80) {
        return { type: 'apipa', label: 'Link-Local (fe80::/10)' };
    }

    // ff00::/8 — multicast
    if ((groups[0] & 0xff00) === 0xff00) {
        return { type: 'multicast', label: 'Multicast' };
    }

    // 2001:db8::/32 — documentation
    if (groups[0] === 0x2001 && groups[1] === 0x0db8) {
        return { type: 'documentation', label: 'Documentation (2001:db8::/32)' };
    }

    return { type: 'public', label: 'Global Unicast (Public)' };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function analyzeIp(input: string): IpInfo {
    const address = input.trim();

    if (!address) {
        return {
            version: 'invalid',
            address,
            type: 'public',
            typeLabel: '',
            isValid: false,
            error: 'Empty input',
        };
    }

    // Try IPv4
    if (isValidIpv4(address)) {
        const parts = address.split('.').map(Number);
        const { type, label } = classifyIpv4(address);
        const binary = parts.map(toBinaryOctet).join('.');
        const hex = parts.map(toHexOctet).join('.');
        const decimal = ipToInt(address);

        return {
            version: 'ipv4',
            address,
            type,
            typeLabel: label,
            binary,
            hex,
            decimal,
            isValid: true,
        };
    }

    // Try IPv6
    if (isValidIpv6(address)) {
        const { type, label } = classifyIpv6(address);
        const expanded = expandIpv6(address);
        const compressed = compressIpv6(expanded);

        return {
            version: 'ipv6',
            address,
            type,
            typeLabel: label,
            expanded,
            compressed,
            isValid: true,
        };
    }

    return {
        version: 'invalid',
        address,
        type: 'public',
        typeLabel: '',
        isValid: false,
        error: `"${address}" is not a valid IPv4 or IPv6 address`,
    };
}

export function parseCidr(input: string): CidrInfo {
    const trimmed = input.trim();
    const slashIdx = trimmed.lastIndexOf('/');

    if (slashIdx === -1) {
        return {
            cidr: trimmed,
            network: '',
            broadcast: '',
            firstHost: '',
            lastHost: '',
            totalHosts: 0,
            usableHosts: 0,
            subnetMask: '',
            wildcardMask: '',
            prefixLength: 0,
            ipClass: 'N/A',
            isPrivate: false,
            networkDecimal: 0,
            broadcastDecimal: 0,
            binary: { network: '', mask: '' },
            isValid: false,
            error: 'Missing prefix length (e.g. 192.168.1.0/24)',
        };
    }

    const ipPart = trimmed.slice(0, slashIdx);
    const prefixStr = trimmed.slice(slashIdx + 1);
    const prefixLength = parseInt(prefixStr, 10);

    if (!isValidIpv4(ipPart)) {
        return {
            cidr: trimmed,
            network: '',
            broadcast: '',
            firstHost: '',
            lastHost: '',
            totalHosts: 0,
            usableHosts: 0,
            subnetMask: '',
            wildcardMask: '',
            prefixLength: 0,
            ipClass: 'N/A',
            isPrivate: false,
            networkDecimal: 0,
            broadcastDecimal: 0,
            binary: { network: '', mask: '' },
            isValid: false,
            error: `"${ipPart}" is not a valid IPv4 address`,
        };
    }

    if (
        isNaN(prefixLength) ||
        prefixLength < 0 ||
        prefixLength > 32 ||
        String(prefixLength) !== prefixStr
    ) {
        return {
            cidr: trimmed,
            network: '',
            broadcast: '',
            firstHost: '',
            lastHost: '',
            totalHosts: 0,
            usableHosts: 0,
            subnetMask: '',
            wildcardMask: '',
            prefixLength: 0,
            ipClass: 'N/A',
            isPrivate: false,
            networkDecimal: 0,
            broadcastDecimal: 0,
            binary: { network: '', mask: '' },
            isValid: false,
            error: `Prefix length must be 0–32, got "${prefixStr}"`,
        };
    }

    // Subnet mask: prefix-length 1-bits then 0-bits
    const maskInt = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
    const wildcardInt = ~maskInt >>> 0;

    const ipInt = ipToInt(ipPart);
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const network = intToIp(networkInt);
    const broadcast = intToIp(broadcastInt);

    let firstHost: string;
    let lastHost: string;
    let totalHosts: number;
    let usableHosts: number;

    if (prefixLength >= 31) {
        // /31 — point-to-point (RFC 3021), /32 — host route
        firstHost = network;
        lastHost = broadcast;
        totalHosts = prefixLength === 32 ? 1 : 2;
        usableHosts = prefixLength === 32 ? 1 : 2;
    } else {
        firstHost = intToIp(networkInt + 1);
        lastHost = intToIp(broadcastInt - 1);
        totalHosts = wildcardInt + 1;
        usableHosts = totalHosts - 2;
    }

    const subnetMask = intToIp(maskInt);
    const wildcardMask = intToIp(wildcardInt);

    // IP class based on first octet of the host IP (not network address)
    const firstOctet = (ipInt >>> 24) & 0xff;
    let ipClass: string;
    if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'A';
    else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
    else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
    else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D (Multicast)';
    else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'E (Reserved)';
    else ipClass = 'N/A';

    const { type } = classifyIpv4(network);
    const isPrivate = type === 'private' || type === 'loopback' || type === 'apipa';

    // Binary representations
    const networkBinary = intToIp(networkInt).split('.').map(Number).map(toBinaryOctet).join('.');
    const maskBinary = intToIp(maskInt).split('.').map(Number).map(toBinaryOctet).join('.');

    return {
        cidr: `${network}/${prefixLength}`,
        network,
        broadcast,
        firstHost,
        lastHost,
        totalHosts,
        usableHosts,
        subnetMask,
        wildcardMask,
        prefixLength,
        ipClass,
        isPrivate,
        networkDecimal: networkInt,
        broadcastDecimal: broadcastInt,
        binary: {
            network: networkBinary,
            mask: maskBinary,
        },
        isValid: true,
    };
}

export function cidrToRange(cidr: string): { start: string; end: string; count: number } | null {
    const info = parseCidr(cidr);
    if (!info.isValid) return null;
    return {
        start: info.network,
        end: info.broadcast,
        count: info.totalHosts,
    };
}
