import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('content-type');

export default function ContentTypeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
