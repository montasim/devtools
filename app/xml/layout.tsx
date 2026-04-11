import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'XML Tools - Format, Validate, and Process XML',
    description:
        'Free online XML tools. Format/beautify, validate, and process XML files directly in your browser. No data upload required - all processing happens locally.',
    keywords: [
        'XML tools',
        'XML formatter',
        'XML beautifier',
        'XML validator',
        'XML parser',
        'XML viewer',
        'XML editor',
        'online XML tools',
        'XML processing',
        'XML minify',
    ],
    alternates: {
        canonical: '/xml',
    },
    openGraph: {
        type: 'website',
        url: '/xml',
        title: 'XML Tools - Format, Validate, and Process XML',
        description:
            'Free online XML tools. Format, validate, and process XML files in your browser.',
        images: [
            {
                url: '/og-xml.png',
                width: 1200,
                height: 630,
                alt: 'XML Tools - Free Online XML Processing',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'XML Tools - Free Online XML Processing',
        description:
            'Free online XML tools. Format, validate, and process XML files in your browser.',
        images: ['/og-xml.png'],
    },
};

export default function XmlLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
