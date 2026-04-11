import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About DevTools - Free Online Developer Tools',
    description:
        'Learn about DevTools - a collection of free, privacy-focused online developer tools for JSON, text processing, Git workflows, and more. All tools run entirely in your browser.',
    keywords: [
        'about DevTools',
        'developer tools',
        'online tools',
        'privacy-focused',
        'browser-based tools',
        'no data upload',
        'secure tools',
        'free dev tools',
    ],
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        type: 'website',
        url: '/about',
        title: 'About DevTools - Free Online Developer Tools',
        description:
            'Learn about DevTools - free, privacy-focused online developer tools running in your browser.',
        images: [
            {
                url: '/og-about.png',
                width: 1200,
                height: 630,
                alt: 'About DevTools',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About DevTools',
        description: 'Learn about DevTools - free, privacy-focused online developer tools.',
        images: ['/og-about.png'],
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
