import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'History - Your Tool Usage History',
    description:
        'View your tool usage history. All your JSON and text tool activities are stored locally in your browser for quick access and reference.',
    keywords: [
        'history',
        'usage history',
        'recent activities',
        'tool history',
        'local storage',
        'browser history',
        'JSON history',
        'text history',
    ],
    alternates: {
        canonical: '/history',
    },
    openGraph: {
        type: 'website',
        url: '/history',
        title: 'History - Your Tool Usage History',
        description: 'View your tool usage history. All activities stored locally in your browser.',
        images: [
            {
                url: '/og-history.png',
                width: 1200,
                height: 630,
                alt: 'DevTools History',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'History - Your Tool Usage',
        description: 'View your tool usage history. All activities stored locally in your browser.',
        images: ['/og-history.png'],
    },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
