import { NextResponse } from 'next/server';
import { Resolver } from 'dns/promises';

const DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const SUPPORTED_TYPES = new Set(['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR']);

interface NormalizedRecord {
    value: string;
    priority?: number;
    additional?: Record<string, string | number>;
}

function normalizeRecords(raw: unknown, type: string): NormalizedRecord[] {
    if (!raw) return [];

    if (type === 'NS' || type === 'CNAME' || type === 'PTR') {
        return (raw as string[]).map((v) => ({ value: v }));
    }
    if (type === 'A' || type === 'AAAA') {
        return (raw as string[]).map((v) => ({ value: v }));
    }
    if (type === 'MX') {
        return (raw as { exchange: string; priority: number }[]).map((r) => ({
            value: r.exchange,
            priority: r.priority,
        }));
    }
    if (type === 'TXT') {
        return (raw as string[][]).map((parts) => ({ value: parts.join(' ') }));
    }
    if (type === 'SOA') {
        const soa = raw as {
            nsname: string;
            hostmaster: string;
            serial: number;
            refresh: number;
            retry: number;
            expire: number;
            minttl: number;
        };
        return [
            {
                value: soa.nsname,
                additional: {
                    hostmaster: soa.hostmaster,
                    serial: soa.serial,
                    refresh: soa.refresh,
                    retry: soa.retry,
                    expire: soa.expire,
                    'min ttl': soa.minttl,
                },
            },
        ];
    }

    return [{ value: String(raw) }];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain')?.trim();
        const type = (searchParams.get('type') ?? 'NS').toUpperCase();

        if (!domain) {
            return NextResponse.json(
                { ok: false, error: { code: 'VALIDATION', message: 'Domain is required' } },
                { status: 400 },
            );
        }

        if (!SUPPORTED_TYPES.has(type)) {
            return NextResponse.json(
                {
                    ok: false,
                    error: {
                        code: 'INVALID_TYPE',
                        message: `Unsupported record type: ${type}. Supported: ${[...SUPPORTED_TYPES].join(', ')}`,
                    },
                },
                { status: 400 },
            );
        }

        const resolver = new Resolver();
        resolver.setServers(DNS_SERVERS);

        const start = performance.now();
        let rawRecords: unknown;

        switch (type) {
            case 'A':
                rawRecords = await resolver.resolve4(domain);
                break;
            case 'AAAA':
                rawRecords = await resolver.resolve6(domain);
                break;
            case 'MX':
                rawRecords = await resolver.resolveMx(domain);
                break;
            case 'TXT':
                rawRecords = await resolver.resolveTxt(domain);
                break;
            case 'NS':
                rawRecords = await resolver.resolveNs(domain);
                break;
            case 'CNAME':
                rawRecords = await resolver.resolveCname(domain);
                break;
            case 'SOA':
                rawRecords = await resolver.resolveSoa(domain);
                break;
            case 'PTR':
                rawRecords = await resolver.reverse(domain);
                break;
            default:
                rawRecords = [];
        }

        const queryTime = Math.round(performance.now() - start);
        const records = normalizeRecords(rawRecords, type);

        return NextResponse.json({
            ok: true,
            data: {
                domain,
                type,
                records,
                dnsServer: DNS_SERVERS[0],
                queryTime,
            },
        });
    } catch (error: unknown) {
        const dnsError = error as { code?: string; message?: string };
        if (dnsError.code === 'ENOTFOUND') {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'NXDOMAIN', message: `Domain not found: ${dnsError.message}` },
                },
                { status: 404 },
            );
        }
        if (dnsError.code === 'ENODATA') {
            return NextResponse.json({
                ok: true,
                data: {
                    domain: '',
                    type: '',
                    records: [],
                    dnsServer: DNS_SERVERS[0],
                    queryTime: 0,
                },
            });
        }
        if (dnsError.code === 'ETIMEOUT') {
            return NextResponse.json(
                {
                    ok: false,
                    error: { code: 'TIMEOUT', message: 'DNS query timed out. Please try again.' },
                },
                { status: 504 },
            );
        }

        return NextResponse.json(
            {
                ok: false,
                error: {
                    code: 'RESOLVE_ERROR',
                    message: dnsError.message ?? 'Failed to resolve DNS records',
                },
            },
            { status: 500 },
        );
    }
}
