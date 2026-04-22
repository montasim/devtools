import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('hash');

export default function HashLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
