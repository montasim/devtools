import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Tools - Diff, Format, Minify, Validate & More',
    description:
        'Free online JSON tools: Diff two JSON files, format/beautify, minify, validate, view, export to CSV, and generate JSON schema. All processing happens in your browser - no data upload required.',
    keywords: [
        'JSON tools',
        'JSON diff',
        'JSON formatter',
        'JSON beautifier',
        'JSON minify',
        'JSON validator',
        'JSON parser',
        'JSON viewer',
        'JSON to CSV',
        'JSON schema generator',
        'online JSON editor',
        'compare JSON',
        'JSON export',
    ],
    alternates: {
        canonical: '/json',
    },
    openGraph: {
        type: 'website',
        url: '/json',
        title: 'JSON Tools - Diff, Format, Minify, Validate & More',
        description:
            'Free online JSON tools: Diff, format, minify, validate, view, export, and generate schema. All processing in your browser.',
        images: [
            {
                url: '/og-json.png',
                width: 1200,
                height: 630,
                alt: 'JSON Tools - Free Online JSON Diff, Format, Minify, Validate',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JSON Tools - Free Online JSON Diff, Format, Minify, Validate',
        description:
            'Free online JSON tools: Diff, format, minify, validate, view, export, and generate schema.',
        images: ['/og-json.png'],
    },
};

export default function JsonLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
