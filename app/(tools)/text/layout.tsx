import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('text');

export default function TextLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
