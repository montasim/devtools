import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('html');

export default function HtmlLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
