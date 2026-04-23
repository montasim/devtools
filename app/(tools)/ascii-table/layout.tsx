import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('ascii-table');

export default function AsciiTableLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
