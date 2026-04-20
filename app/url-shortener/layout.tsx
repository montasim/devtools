import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'URL Shortener - DevTools',
    description: 'Shorten long URLs into compact, shareable links.',
};

export default function UrlShortenerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
