import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('curl');

export default function CurlLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
