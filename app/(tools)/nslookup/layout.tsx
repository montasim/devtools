import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('nslookup');

export default function NslookupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
