import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('sample');

export default function SampleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
