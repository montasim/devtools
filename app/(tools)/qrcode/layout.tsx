import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('qrcode');

export default function QrcodeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
