import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('regex');

export default function RegexLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
