import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Text Tools - Diff, Convert, Clean & Process Text',
    description:
        'Free online text tools: Compare two texts with diff viewer, convert case (upper, lower, title, sentence), clean whitespace and formatting. All processing happens locally in your browser.',
    keywords: [
        'text tools',
        'text diff',
        'compare text',
        'text comparison',
        'case converter',
        'uppercase lowercase',
        'title case',
        'sentence case',
        'text cleaner',
        'remove whitespace',
        'text formatter',
        'online text tools',
        'text processing',
    ],
    alternates: {
        canonical: '/text',
    },
    openGraph: {
        type: 'website',
        url: '/text',
        title: 'Text Tools - Diff, Convert, Clean & Process Text',
        description:
            'Free online text tools: Compare text, convert case, clean formatting. All processing in your browser.',
        images: [
            {
                url: '/og-text.png',
                width: 1200,
                height: 630,
                alt: 'Text Tools - Free Online Text Diff, Convert, Clean',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Text Tools - Free Online Text Diff, Convert, Clean',
        description: 'Free online text tools: Compare text, convert case, clean formatting.',
        images: ['/og-text.png'],
    },
};

export default function TextLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
