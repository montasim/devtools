import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('css');

export default function CssLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
