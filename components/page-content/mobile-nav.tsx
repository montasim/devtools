import type { ReactNode } from 'react';

interface MobileNavSection {
    id: string;
    title: string;
    icon: ReactNode;
}

interface MobileNavProps {
    sections: MobileNavSection[];
    activeSection: string;
    onSectionClick: (sectionId: string) => void;
}

export function MobileNav({ sections, activeSection, onSectionClick }: MobileNavProps) {
    return (
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {sections.map((section) => (
                <button
                    key={section.id}
                    onClick={() => onSectionClick(section.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeSection === section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    <span className="flex-shrink-0">{section.icon}</span>
                    <span>{section.title}</span>
                </button>
            ))}
        </nav>
    );
}
