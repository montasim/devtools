import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('markdown');

export default function MarkdownLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
