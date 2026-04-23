import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('password-hash');

export default function PasswordHashLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
