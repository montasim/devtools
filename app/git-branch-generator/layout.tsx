import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('git-branch-generator');

export default function GitBranchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
