import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('id');

export default function IdLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
