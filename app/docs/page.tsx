'use client';

import { useState, useEffect } from 'react';
import {
    Target,
    Zap,
    Wrench,
    Search,
    Download,
    Keyboard,
    Save,
    Globe,
    Layers,
    BookOpen,
    Play,
    FlaskRound,
    Lightbulb,
    Settings,
    Sparkles,
    Crosshair,
    FileText,
} from 'lucide-react';
import { PageLayout, PageHeader, SidebarNav, PageSection, PageContent } from '@/components/docs';

interface DocSection {
    id: string;
    title: string;
    icon: React.ReactNode;
}

const docSections: DocSection[] = [
    {
        id: 'overview',
        title: 'Overview',
        icon: <BookOpen className="w-5 h-5" />,
    },
    {
        id: 'features',
        title: 'Features',
        icon: <Sparkles className="w-5 h-5" />,
    },
    {
        id: 'configuration',
        title: 'Configuration',
        icon: <Settings className="w-5 h-5" />,
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Play className="w-5 h-5" />,
    },
    {
        id: 'advanced',
        title: 'Advanced Features',
        icon: <FlaskRound className="w-5 h-5" />,
    },
    {
        id: 'tips',
        title: 'Pro Tips',
        icon: <Lightbulb className="w-5 h-5" />,
    },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        const handleScroll = () => {
            const sections = docSections.map((section) => document.getElementById(section.id));
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(docSections[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    return (
        <PageLayout>
            <PageHeader
                icon={<FileText className="w-6 h-6 text-white" />}
                title="JSON Diff Tool"
                description="Documentation & Usage Guide"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={docSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
            >
                {/* Overview Section */}
                <PageSection
                    id="overview"
                    title="Overview"
                    description="The JSON Diff Tool is a powerful utility for comparing and analyzing differences between JSON documents. It provides multiple comparison modes, export options, and advanced features to help you understand and communicate changes in your data."
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 mb-2 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Crosshair className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Accurate
                            </h3>
                            <p className="text-sm text-blue-700/70 dark:text-blue-300/70">
                                Precise diff detection with multiple algorithms
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="w-8 h-8 mb-2 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                                Fast
                            </h3>
                            <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                                Optimized for quick comparisons
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                            <div className="w-8 h-8 mb-2 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                Flexible
                            </h3>
                            <p className="text-sm text-purple-700/70 dark:text-purple-300/70">
                                Multiple view modes and export options
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Features Section */}
                <PageSection id="features" title="Key Features">
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Layers className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Multiple View Modes
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Choose between unified, split, inline, and tree views to visualize
                                changes in the way that works best for you.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Smart Filtering
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Filter by change type to focus on what matters: additions,
                                deletions, or modifications.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Export Options
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Export diffs in multiple formats including JSON Patch, Merge Patch,
                                downloadable files, and HTML reports.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Keyboard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Keyboard Shortcuts
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Power user keyboard shortcuts for quick filtering, exporting, and
                                panel toggling.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Save className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Auto-Save
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your content is automatically saved to localStorage, preventing
                                accidental data loss.
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Configuration Section */}
                <PageSection id="configuration" title="Configuration Options">
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Ignore Key Order
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Compare objects regardless of key ordering
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                    Default: On
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                When enabled, the comparison ignores the order of keys in JSON
                                objects. This is useful when comparing JSON generated by different
                                serializers that may produce equivalent data with different key
                                ordering.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Pretty Print
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Format output with proper indentation
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                                    Default: On
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Automatically formats JSON output with proper indentation and line
                                breaks for better readability in the diff display.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Ignore Whitespace
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Skip whitespace-only differences
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                                    Default: Off
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                When enabled, whitespace differences are ignored during comparison.
                                Useful when comparing JSON that differs only in formatting or
                                spacing.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        Semantic Type Diff
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Intelligent type-aware comparisons
                                    </p>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
                                    Default: Off
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Performs intelligent type-aware comparisons that understand data
                                types and structures, detecting semantic changes beyond simple text
                                differences.
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Getting Started Section */}
                <PageSection id="getting-started" title="Getting Started">
                    <div className="space-y-4">
                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Input JSON Data
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Paste or type your JSON content into the left and right editor
                                    panels. The editors support syntax highlighting and real-time
                                    validation.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Configure Options
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Toggle the comparison options at the top to customize how the
                                    diff is computed based on your needs.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Compare
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click the &ldquo;Compare&rdquo; button to generate the diff.
                                    Results appear below, showing additions, deletions, and
                                    modifications.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                4
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Analyze & Export
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Use filter options to focus on specific change types. Export the
                                    diff in various formats or use keyboard shortcuts for
                                    navigation.
                                </p>
                            </div>
                        </div>
                    </div>
                </PageSection>

                {/* Advanced Features Section */}
                <PageSection id="advanced" title="Advanced Features">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    Filter Shortcuts
                                </h3>
                            </div>
                            <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mb-2">
                                Use{' '}
                                <kbd className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700">
                                    ⌘/Ctrl + 1-4
                                </kbd>{' '}
                                to quickly filter by change type
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                    Export Shortcuts
                                </h3>
                            </div>
                            <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70 mb-2">
                                Use{' '}
                                <kbd className="px-1.5 py-0.5 text-xs font-semibold rounded bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700">
                                    ⌘/Ctrl + Shift + Key
                                </kbd>{' '}
                                for quick exports
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                                    Side Panels
                                </h3>
                            </div>
                            <p className="text-sm text-purple-700/70 dark:text-purple-300/70 mb-2">
                                Toggle tree structure, statistics, validation, and bookmarks panels
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                                    Dark Mode
                                </h3>
                            </div>
                            <p className="text-sm text-orange-700/70 dark:text-orange-300/70 mb-2">
                                Automatic dark mode support for comfortable viewing in any lighting
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Pro Tips Section */}
                <PageSection id="tips" title="Pro Tips">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span className="text-sm text-amber-900 dark:text-amber-100">
                                    Use <strong>Ignore Key Order</strong> when comparing JSON from
                                    different sources with different serialization approaches
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span className="text-sm text-amber-900 dark:text-amber-100">
                                    Enable <strong>Semantic Type Diff</strong> for smarter
                                    comparisons that understand data types and structures
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span className="text-sm text-amber-900 dark:text-amber-100">
                                    Visit the{' '}
                                    <strong className="text-emerald-600 dark:text-emerald-400">
                                        Shortcuts page
                                    </strong>{' '}
                                    for the complete list of keyboard shortcuts
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span className="text-sm text-amber-900 dark:text-amber-100">
                                    Your content is <strong>automatically saved</strong> and
                                    restored when you return to the page
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                <span className="text-sm text-amber-900 dark:text-amber-100">
                                    Use <strong>bookmarks</strong> to mark important hunks for quick
                                    reference during analysis
                                </span>
                            </li>
                        </ul>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
