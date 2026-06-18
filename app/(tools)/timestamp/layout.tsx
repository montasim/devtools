import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('timestamp');

export default function TimestampLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
