import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('csv');

export default function CsvLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
