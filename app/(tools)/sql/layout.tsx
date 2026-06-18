import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('sql');

export default function SqlLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
