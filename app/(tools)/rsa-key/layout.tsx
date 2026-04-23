import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('rsa-key');

export default function RsaKeyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
