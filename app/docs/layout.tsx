import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Documentation - Learn How to Use DevTools',
    description:
        'Complete documentation for DevTools. Learn how to use JSON tools, text tools, Git branch generator, keyboard shortcuts, and get the most out of our free online developer tools.',
    keywords: [
        'DevTools documentation',
        'how to use',
        'JSON tools tutorial',
        'text tools tutorial',
        'git branch generator guide',
        'keyboard shortcuts',
        'developer tools guide',
        'online tools help',
    ],
    alternates: {
        canonical: '/docs',
    },
    openGraph: {
        type: 'website',
        url: '/docs',
        title: 'Documentation - Learn How to Use DevTools',
        description:
            'Complete documentation for DevTools. Learn how to use all our free online developer tools.',
        images: [
            {
                url: '/og-docs.png',
                width: 1200,
                height: 630,
                alt: 'DevTools Documentation',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DevTools Documentation',
        description: 'Complete documentation for DevTools. Learn how to use all our tools.',
        images: ['/og-docs.png'],
    },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
