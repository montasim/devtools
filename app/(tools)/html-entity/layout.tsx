import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('html-entity');

export default function HtmlEntityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
