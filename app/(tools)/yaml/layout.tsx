import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('yaml');

export default function YamlLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
