interface Shortcut {
    keys: string[];
    label: string;
    color?: string;
}

interface ShortcutCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    shortcuts: Shortcut[];
    gradientClass: string;
    borderClass: string;
    iconBgClass: string;
    iconTextClass: string;
    titleTextClass: string;
    descriptionTextClass: string;
}

function ShortcutList({ shortcuts }: { shortcuts: Shortcut[] }) {
    return (
        <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between group/item hover:bg-white/50 dark:hover:bg-black/20 rounded-lg px-3 py-2 -mx-3 transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                            <div key={keyIndex} className="flex items-center">
                                {keyIndex > 0 && <span className="text-gray-400 mx-1">+</span>}
                                <kbd className="px-2 py-1 text-xs font-semibold rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                    {key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ShortcutCard({ title, description, icon, shortcuts, gradientClass, borderClass, iconBgClass, iconTextClass, titleTextClass, descriptionTextClass }: ShortcutCardProps) {
    return (
        <div className={`group relative overflow-hidden rounded-2xl ${gradientClass} ${borderClass} p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl group-hover:bg-opacity-20 transition-all duration-500`} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
            <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${iconBgClass}`}>
                        {icon}
                    </div>
                    <h2 className={`text-xl font-bold ${titleTextClass}`}>{title}</h2>
                </div>
                <p className={`text-sm ${descriptionTextClass} mb-6`}>{description}</p>
                <ShortcutList shortcuts={shortcuts} />
            </div>
        </div>
    );
}

export default function ShortcutsPage() {
    const filterShortcuts: Shortcut[] = [
        { keys: ['⌘/Ctrl', '1'], label: 'All Changes' },
        { keys: ['⌘/Ctrl', '2'], label: 'Additions' },
        { keys: ['⌘/Ctrl', '3'], label: 'Deletions' },
        { keys: ['⌘/Ctrl', '4'], label: 'Modifications' },
    ];

    const exportShortcuts: Shortcut[] = [
        { keys: ['⌘/Ctrl', 'Shift', 'P'], label: 'JSON Patch' },
        { keys: ['⌘/Ctrl', 'Shift', 'G'], label: 'Merge Patch' },
        { keys: ['⌘/Ctrl', 'Shift', 'D'], label: 'Download' },
        { keys: ['⌘/Ctrl', 'Shift', 'H'], label: 'HTML Report' },
        { keys: ['⌘/Ctrl', 'Shift', 'J'], label: 'JSON Paths' },
    ];

    const panelShortcuts: Shortcut[] = [
        { keys: ['⌘/Ctrl', 'B'], label: 'Bookmarks' },
        { keys: ['⌘/Ctrl', 'T'], label: 'Tree Structure' },
        { keys: ['⌘/Ctrl', 'S'], label: 'Statistics' },
        { keys: ['⌘/Ctrl', 'V'], label: 'Validation' },
    ];

    return (
        <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header Section */}
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                    Keyboard Shortcuts
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Master your workflow with powerful keyboard combinations
                </p>
            </div>

            {/* Shortcuts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Filter Shortcuts Card */}
                <ShortcutCard
                    title="Filter"
                    description="Quickly filter by change type"
                    icon={
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    }
                    shortcuts={filterShortcuts}
                    gradientClass="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                    borderClass="border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                    iconBgClass="bg-blue-500/10"
                    iconTextClass="text-blue-600 dark:text-blue-400"
                    titleTextClass="text-blue-900 dark:text-blue-100"
                    descriptionTextClass="text-blue-700/70 dark:text-blue-300/70"
                />

                {/* Export Shortcuts Card */}
                <ShortcutCard
                    title="Export"
                    description="Export in multiple formats"
                    icon={
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    }
                    shortcuts={exportShortcuts}
                    gradientClass="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
                    borderClass="border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                    iconBgClass="bg-emerald-500/10"
                    iconTextClass="text-emerald-600 dark:text-emerald-400"
                    titleTextClass="text-emerald-900 dark:text-emerald-100"
                    descriptionTextClass="text-emerald-700/70 dark:text-emerald-300/70"
                />

                {/* Panel Toggle Shortcuts Card */}
                <ShortcutCard
                    title="Panels"
                    description="Toggle side panels"
                    icon={
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    }
                    shortcuts={panelShortcuts}
                    gradientClass="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
                    borderClass="border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
                    iconBgClass="bg-purple-500/10"
                    iconTextClass="text-purple-600 dark:text-purple-400"
                    titleTextClass="text-purple-900 dark:text-purple-100"
                    descriptionTextClass="text-purple-700/70 dark:text-purple-300/70"
                />
            </div>

            {/* Pro Tips Section */}
            <div className="rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-amber-500/10">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pro Tips</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>Use <kbd className="px-1.5 py-0.5 text-xs font-semibold rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">⌘</kbd> on Mac or <kbd className="px-1.5 py-0.5 text-xs font-semibold rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">Ctrl</kbd> on Windows/Linux</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>Hold <kbd className="px-1.5 py-0.5 text-xs font-semibold rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">Shift</kbd> with export shortcuts for different formats</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>All shortcuts work globally when viewing diff results</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
