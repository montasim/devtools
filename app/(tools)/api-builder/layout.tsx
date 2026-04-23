import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('api-builder');

export default function ApiBuilderLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
