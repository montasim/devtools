import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Live Web Editor | DevTools',
    description:
        'Write HTML, CSS, and JS code in separate editors and see the live preview instantly.',
};

export default function LiveWebEditorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
