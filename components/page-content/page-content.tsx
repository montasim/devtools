import type { ReactNode } from 'react';

interface PageContentProps {
    sidebar: ReactNode;
    children: ReactNode;
    mobileNav?: ReactNode;
}

export function PageContent({ sidebar, children, mobileNav }: PageContentProps) {
    return (
        <div className="mx-auto py-4">
            {mobileNav && <div className="mb-6 md:hidden">{mobileNav}</div>}
            <div className="flex flex-col gap-6 md:gap-8 md:flex-row">
                {sidebar}
                <main className="min-w-0 flex-1 space-y-12 pb-12 sm:space-y-16 sm:pb-16">
                    {children}
                </main>
            </div>
        </div>
    );
}
