import { NextRequest, NextResponse } from 'next/server';
import rawWords from '@/features/tools/spam-words/data/words.json';
import { rateLimit } from '@/lib/rate-limit';

type SpamWord = { word: string; category: string; length: number };

export async function POST(req: NextRequest) {
    try {
        // Rate limit by IP
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const rl = rateLimit(`${ip}:spam-words-check`, { limit: 100, windowMs: 60000 });
        if (!rl.success) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        // Parse request
        const body = await req.json();
        const { text } = body;

        if (typeof text !== 'string' || !text.trim()) {
            return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
        }

        const inputLower = text.toLowerCase();
        const spamWords = rawWords as SpamWord[];
        let hasSpam = false;

        for (const sw of spamWords) {
            // Escape regex characters and handle wildcard placeholder '%'
            const escapedWord = sw.word
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace(/%/g, '\\d*%?');
            
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
            
            if (regex.test(inputLower)) {
                hasSpam = true;
                break; // Stop checking immediately once any spam match is found
            }
        }

        return NextResponse.json({
            spam: hasSpam,
        }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
