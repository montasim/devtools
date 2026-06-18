import { NextRequest, NextResponse } from 'next/server';
import { webhookStore, MAX_REQUESTS_PER_ID, pruneStore } from '../_store';
import type { WebhookRequest } from '../_store';

async function handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id || id.length > 64) {
        return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        if (!key.startsWith('x-forwarded') && key !== 'host') {
            headers[key] = value;
        }
    });

    let body: string | null = null;
    try {
        const text = await req.text();
        if (text) body = text.slice(0, 50_000);
    } catch {
        // body read failed — leave as null
    }

    const query: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    const contentType = req.headers.get('content-type') ?? '';
    const entry: WebhookRequest = {
        id: crypto.randomUUID(),
        method: req.method,
        headers,
        body,
        query,
        timestamp: Date.now(),
        contentType,
        size: body ? new TextEncoder().encode(body).length : 0,
    };

    pruneStore();
    const existing = webhookStore.get(id) ?? [];
    existing.unshift(entry);
    if (existing.length > MAX_REQUESTS_PER_ID) existing.length = MAX_REQUESTS_PER_ID;
    webhookStore.set(id, existing);

    return NextResponse.json(
        { ok: true },
        {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Headers': '*',
            },
        },
    );
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
    handler as HEAD,
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
        },
    });
}
