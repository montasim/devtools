import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('fancy-text');

export default function FancyTextLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
