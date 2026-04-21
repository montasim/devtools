import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Git Branch Name Generator - DevTools',
    description:
        'Generate consistent and well-formatted git branch names instantly. Support for issue types, issue IDs, and customizable word separators.',
};

export default function GitBranchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
