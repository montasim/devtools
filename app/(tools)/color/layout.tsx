import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('color');

export default function ColorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
