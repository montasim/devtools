import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('http-header-parser');

export default function HttpHeaderParserLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
