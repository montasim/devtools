'use client';

import { useState, useEffect } from 'react';
import {
    GitBranch,
    Code,
    FileCode,
    FileJson,
    FileText,
    Sparkles,
    BookOpen,
    Play,
    Lightbulb,
    Settings,
    Wrench,
    Layers,
    History,
    Zap,
    Shield,
    Save,
} from 'lucide-react';
import {
    PageLayout,
    PageHeader,
    SidebarNav,
    PageSection,
    PageContent,
    MobileNav,
} from '@/components/docs';

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
        id: 'json-tools',
        title: 'JSON Tools',
        icon: <FileJson className="w-5 h-5" />,
    },
    {
        id: 'text-tools',
        title: 'Text Tools',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'base64-tools',
        title: 'Base64 Tools',
        icon: <FileCode className="w-5 h-5" />,
    },
    {
        id: 'git-tools',
        title: 'Git Tools',
        icon: <GitBranch className="w-5 h-5" />,
    },
    {
        id: 'features',
        title: 'Key Features',
        icon: <Sparkles className="w-5 h-5" />,
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Play className="w-5 h-5" />,
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
                title="DevTools Documentation"
                description="Complete guide to all development tools"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={docSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
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
                    description="A comprehensive suite of developer tools for JSON, text, and git workflows. Boost your productivity with powerful utilities designed for modern development."
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 mb-2 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Powerful
                            </h3>
                            <p className="text-sm text-blue-700/70 dark:text-blue-300/70">
                                Advanced tools for complex tasks
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
                                Optimized for quick workflows
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                            <div className="w-8 h-8 mb-2 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                Secure
                            </h3>
                            <p className="text-sm text-purple-700/70 dark:text-purple-300/70">
                                All data stays in your browser
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* JSON Tools Section */}
                <PageSection
                    id="json-tools"
                    title="JSON Tools"
                    description="Complete JSON toolkit for validation, formatting, comparison, and transformation."
                >
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    JSON Diff
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Compare two JSON files with multiple view modes (unified, split,
                                inline, tree). Filter by change type, export diffs, and use keyboard
                                shortcuts for power users.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    JSON Format & Minify
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Beautify or minify JSON with customizable indentation and formatting
                                options. Real-time validation and syntax highlighting.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    JSON Parser & Viewer
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Parse and validate JSON with detailed error messages. View JSON in
                                an expandable tree structure with syntax highlighting.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <FileJson className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    JSON Schema & Export
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Validate JSON against schemas and export data in multiple formats.
                                Generate JSON Patch and Merge Patch documents.
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Text Tools Section */}
                <PageSection
                    id="text-tools"
                    title="Text Tools"
                    description="Process and manipulate text with powerful transformation and analysis tools."
                >
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Text Diff
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Compare two text blocks side-by-side with line-by-line highlighting.
                                Perfect for reviewing document changes and code modifications.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Text Convert
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Transform text with case conversion (upper, lower, title, sentence),
                                encoding/decoding, and format conversions.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Text Clean
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Remove extra spaces, trim lines, eliminate special characters, and
                                normalize whitespace in your text.
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Base64 Tools Section */}
                <PageSection
                    id="base64-tools"
                    title="Base64 Tools"
                    description="Encode and decode Base64 data with support for media files and automatic MIME type detection."
                >
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Media to Base64
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Convert any media file (images, PDFs, documents) to Base64 encoding.
                                Upload files directly or fetch from URLs. Preview images and
                                download the Base64 output. View character count and file size
                                statistics.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Base64 to Media
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Decode Base64 strings back to media files with automatic MIME type
                                detection. Supports PNG, JPEG, GIF, WebP, PDF, and SVG formats.
                                Preview decoded images and download the converted files.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Base64 History
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Access your Base64 conversion history with persistent storage. View,
                                restore, copy, or clear individual history items. Filter by tool
                                type and manage your data efficiently.
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Git Tools Section */}
                <PageSection
                    id="git-tools"
                    title="Git Tools"
                    description="Streamline your git workflow with intelligent branch name generation."
                >
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <GitBranch className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Branch Name Generator
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Generate consistent git branch names with issue type prefixes,
                                ticket numbers, and formatted descriptions. Supports 11 issue types
                                including feature, fix, hotfix, refactor, docs, test, chore,
                                performance, style, and CI/CD. Saves your last generated branch for
                                quick reference.
                            </p>
                        </div>
                    </div>
                </PageSection>

                {/* Features Section */}
                <PageSection id="features" title="Key Features">
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Save className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Auto-Save
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                All your content is automatically saved to localStorage as you work.
                                Never lose your data due to accidental page refreshes or browser
                                crashes.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    History Management
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Access your tool usage history across all pages. View, restore,
                                copy, or clear individual history items. Grouped by JSON, Text, and
                                Base64 tools.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Keyboard Shortcuts
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Power user keyboard shortcuts for quick filtering, exporting, and
                                panel toggling. Visit the Shortcuts page for the complete list.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Privacy First
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                All data processing happens locally in your browser. No information
                                is sent to external servers. Your data stays yours.
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
                                    Choose Your Tool
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select from JSON Tools, Text Tools, XML Tools, CSV Tools, Base64
                                    Tools, or Git Tools from the navigation menu based on your task.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Input Your Data
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Paste, type, or upload files into the editor panels. The tools
                                    support syntax highlighting and real-time validation.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Configure & Process
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Adjust options to customize the output. Click the action button
                                    to process your data and view results instantly.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                                4
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Export & Share
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Copy results to clipboard, download files, or generate shareable
                                    links. Your work is automatically saved for later access.
                                </p>
                            </div>
                        </div>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
