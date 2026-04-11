import { ReactNode } from 'react';

export interface LegalSectionProps {
    id?: string;
    title: string;
    children: ReactNode;
    className?: string;
}

export function LegalSection({ id, title, children, className = '' }: LegalSectionProps) {
    // Generate id from title if not provided
    const sectionId =
        id ||
        title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');

    return (
        <section id={sectionId} className={`mb-12 scroll-mt-24 ${className}`}>
            <div className="group relative">
                <div className="absolute -left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-primary/50 to-transparent lg:block" />
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {title}
                </h2>
                <div className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    {children}
                </div>
            </div>
        </section>
    );
}

export interface LegalSubsectionProps {
    id?: string;
    title: string;
    children: ReactNode;
    level?: 3 | 4;
}

export function LegalSubsection({ id, title, children, level = 3 }: LegalSubsectionProps) {
    const HeadingTag = `h${level}` as 'h3' | 'h4';
    const headingClass =
        level === 3
            ? 'text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6 first:mt-0'
            : 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0';

    return (
        <div id={id} className="mb-6">
            <HeadingTag className={headingClass}>{title}</HeadingTag>
            <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {children}
            </div>
        </div>
    );
}

export interface LegalListProps {
    children: ReactNode;
    className?: string;
}

export function LegalList({ children, className = '' }: LegalListProps) {
    return <ul className={`list-disc list-inside space-y-2 ml-4 ${className}`}>{children}</ul>;
}

export interface LegalListItemProps {
    children: ReactNode;
    className?: string;
}

export function LegalListItem({ children, className = '' }: LegalListItemProps) {
    return <li className={`text-gray-700 dark:text-gray-300 ${className}`}>{children}</li>;
}
