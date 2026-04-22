import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('unit');

export default function UnitLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
