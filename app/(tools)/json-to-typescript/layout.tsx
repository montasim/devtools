import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('json-to-typescript');

export default function JsonToTypescriptLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
