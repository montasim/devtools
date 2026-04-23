import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('unicode');

export default function UnicodeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
