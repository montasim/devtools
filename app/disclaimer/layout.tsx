import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer - DevTools',
    description:
        'Important disclaimers and limitations regarding the use of DevTools. Understand the risks and limitations of our tools.',
    keywords: [
        'disclaimer',
        'legal disclaimer',
        'tool limitations',
        'no warranty',
        'limitation of liability',
        'assumption of risk',
        'service disclaimer',
    ],
    alternates: {
        canonical: '/disclaimer',
    },
    openGraph: {
        type: 'website',
        url: '/disclaimer',
        title: 'Disclaimer - DevTools',
        description:
            'Important disclaimers and limitations regarding the use of DevTools services.',
    },
    twitter: {
        card: 'summary',
        title: 'Disclaimer - DevTools',
        description: 'Important disclaimers and limitations regarding the use of DevTools.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
