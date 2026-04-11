import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy - DevTools',
    description:
        'Learn how DevTools uses cookies and similar technologies. Understand essential, preference, and analytics cookies.',
    keywords: [
        'cookie policy',
        'cookies',
        'browser cookies',
        'local storage',
        'cookie consent',
        'GDPR cookies',
        'privacy cookies',
        'cookie preferences',
    ],
    alternates: {
        canonical: '/cookies',
    },
    openGraph: {
        type: 'website',
        url: '/cookies',
        title: 'Cookie Policy - DevTools',
        description:
            'Learn how DevTools uses cookies and similar technologies to enhance your experience.',
    },
    twitter: {
        card: 'summary',
        title: 'Cookie Policy - DevTools',
        description: 'Learn how DevTools uses cookies to enhance your experience.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
