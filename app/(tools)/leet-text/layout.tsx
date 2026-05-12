import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('leet-text');

export default function LeetTextLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
