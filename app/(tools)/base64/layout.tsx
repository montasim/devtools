import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('base64');

export default function Base64Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
