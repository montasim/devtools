import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('privacy');

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
