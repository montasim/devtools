import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('css-unit');

export default function CssUnitLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
