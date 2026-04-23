import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('cert-decoder');

export default function CertDecoderLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
