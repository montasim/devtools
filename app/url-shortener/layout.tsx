import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('url-shortener');

export default function UrlShortenerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
