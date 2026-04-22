import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('mime-type');

export default function MimeTypeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
