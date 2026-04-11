import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Keyboard Shortcuts - Boost Your Productivity',
    description:
        'Master keyboard shortcuts for DevTools. Speed up your workflow with quick access to JSON tools, text tools, Git branch generator, and all developer tools.',
    keywords: [
        'keyboard shortcuts',
        'productivity shortcuts',
        'hotkeys',
        'quick actions',
        'developer shortcuts',
        'JSON tools shortcuts',
        'text tools shortcuts',
        'git shortcuts',
        'efficiency tips',
    ],
    alternates: {
        canonical: '/shortcuts',
    },
    openGraph: {
        type: 'website',
        url: '/shortcuts',
        title: 'Keyboard Shortcuts - Boost Your Productivity',
        description:
            'Master keyboard shortcuts for DevTools. Speed up your workflow with quick access to all tools.',
        images: [
            {
                url: '/og-shortcuts.png',
                width: 1200,
                height: 630,
                alt: 'DevTools Keyboard Shortcuts',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Keyboard Shortcuts - Boost Your Productivity',
        description: 'Master keyboard shortcuts for DevTools. Speed up your workflow.',
        images: ['/og-shortcuts.png'],
    },
};

export default function ShortcutsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
