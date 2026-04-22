import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('password');

export default function PasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
