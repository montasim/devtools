import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('svg');

export default function SvgLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
