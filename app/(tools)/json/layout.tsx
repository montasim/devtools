import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('json');

export default function JsonLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
