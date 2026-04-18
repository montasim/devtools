import type { ReactNode } from 'react';

interface PageSectionProps {
    id: string;
    title: string;
    description?: string;
    children: ReactNode;
}

export function PageSection({ id, title, description, children }: PageSectionProps) {
    return (
        <section id={id} className="scroll-mt-24 sm:scroll-mt-32">
            <div className="mb-4 sm:mb-6">
                <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">{title}</h2>
                {description && (
                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}
