import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('xml');

export default function XmlLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
