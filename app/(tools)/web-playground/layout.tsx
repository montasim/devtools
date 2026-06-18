import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('web-playground');

export default function WebPlaygroundLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
