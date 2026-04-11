import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - DevTools',
    description:
        'Learn how DevTools collects, uses, and protects your personal information. Our privacy-first approach ensures your data stays on your device.',
    keywords: [
        'privacy policy',
        'data protection',
        'user privacy',
        'GDPR compliant',
        'data security',
        'cookie policy',
        'browser local storage',
        'privacy-first tools',
        'no data upload',
    ],
    alternates: {
        canonical: '/privacy',
    },
    openGraph: {
        type: 'website',
        url: '/privacy',
        title: 'Privacy Policy - DevTools',
        description:
            'Learn how DevTools protects your privacy. All processing happens in your browser.',
    },
    twitter: {
        card: 'summary',
        title: 'Privacy Policy - DevTools',
        description: 'Learn how DevTools protects your privacy with client-side processing.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
