import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - DevTools',
    description:
        'Terms and conditions governing your use of DevTools services and features. Understand your rights and responsibilities.',
    keywords: [
        'terms of service',
        'terms and conditions',
        'user agreement',
        'legal terms',
        'service terms',
        'usage rights',
        'liability disclaimer',
    ],
    alternates: {
        canonical: '/terms',
    },
    openGraph: {
        type: 'website',
        url: '/terms',
        title: 'Terms of Service - DevTools',
        description: 'Terms and conditions governing your use of DevTools services.',
    },
    twitter: {
        card: 'summary',
        title: 'Terms of Service - DevTools',
        description: 'Terms and conditions governing your use of DevTools services.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
