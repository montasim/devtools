import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('docs');

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
