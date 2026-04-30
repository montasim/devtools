import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('temp-email');

export default function TempEmailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
