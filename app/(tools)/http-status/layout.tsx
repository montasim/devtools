import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('http-status');

export default function HttpStatusLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
