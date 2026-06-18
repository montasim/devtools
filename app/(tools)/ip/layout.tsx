import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('ip');

export default function IpLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
