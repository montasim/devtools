import type { ReactNode } from 'react';

interface NavSection {
    id: string;
    title: string;
    icon: ReactNode;
    count?: number;
}

interface SidebarNavProps {
    sections: NavSection[];
    activeSection: string;
    onSectionClick: (sectionId: string) => void;
}

export function SidebarNav({ sections, activeSection, onSectionClick }: SidebarNavProps) {
    return (
        <aside className="w-96 shrink-0">
            <nav className="fixed top-40 space-y-1 h-[80vh] overflow-y-auto">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => onSectionClick(section.id)}
                        className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                            activeSection === section.id
                                ? 'bg-primary/10 text-primary shadow-lg'
                                : 'hover:bg-primary/20 hover:text-primary'
                        }`}
                    >
                        <span className="shrink-0">{section.icon}</span>
                        <span className="font-medium">{section.title}</span>
                        {section.count !== undefined && (
                            <span className="ml-auto text-sm opacity-70">{section.count}</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
