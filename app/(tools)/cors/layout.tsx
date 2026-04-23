import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('cors');

export default function CorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
