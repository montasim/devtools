import { NextRequest, NextResponse } from 'next/server';
import { webhookStore } from '../../_store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id || id.length > 64) {
        return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
    }

    const data = webhookStore.get(id) ?? [];
    return NextResponse.json({ ok: true, data });
}
