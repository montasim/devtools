import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('url-encode');

export default function UrlEncodeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
