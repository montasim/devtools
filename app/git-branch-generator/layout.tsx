import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Git Branch Name Generator - Free Online Tool | DevTools',
    description:
        'Generate consistent and well-formatted git branch names instantly. Support for issue types (feature, fix, hotfix, etc.), issue IDs, and customizable word separators. Free online tool.',
    keywords: [
        'git branch name generator',
        'branch naming convention',
        'git workflow',
        'branch naming tool',
        'feature branch',
        'git best practices',
        'branch name formatter',
        'JIRA branch generator',
        'issue tracker branch naming',
    ],
    authors: [{ name: 'DevTools' }],
    creator: 'DevTools',
    publisher: 'DevTools',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://devtools.com'),
    alternates: {
        canonical: '/git-branch-generator',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/git-branch-generator',
        title: 'Git Branch Name Generator - Free Online Tool',
        description:
            'Generate consistent and well-formatted git branch names instantly. Support for multiple issue types, JIRA integration, and customizable separators.',
        siteName: 'DevTools',
        images: [
            {
                url: '/og-git-branch-generator.png',
                width: 1200,
                height: 630,
                alt: 'Git Branch Name Generator',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Git Branch Name Generator - Free Online Tool',
        description:
            'Generate consistent and well-formatted git branch names instantly. Support for multiple issue types and customizable separators.',
        images: ['/og-git-branch-generator.png'],
        creator: '@devtools',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'google-site-verification-token',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
