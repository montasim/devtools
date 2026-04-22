import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('number-base');

export default function NumberBaseLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
