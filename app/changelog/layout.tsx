import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Changelog - DevTools Updates and New Features',
    description:
        "Stay updated with the latest changes, new features, and improvements to DevTools. See what's new in our free online developer tools.",
    keywords: [
        'changelog',
        'updates',
        'new features',
        'release notes',
        'DevTools updates',
        "what's new",
        'version history',
        'improvements',
        'bug fixes',
    ],
    alternates: {
        canonical: '/changelog',
    },
    openGraph: {
        type: 'website',
        url: '/changelog',
        title: 'Changelog - DevTools Updates and New Features',
        description:
            'Stay updated with the latest changes, new features, and improvements to DevTools.',
        images: [
            {
                url: '/og-changelog.png',
                width: 1200,
                height: 630,
                alt: 'DevTools Changelog',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Changelog - DevTools Updates',
        description: 'Stay updated with the latest changes and new features to DevTools.',
        images: ['/og-changelog.png'],
    },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
