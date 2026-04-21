'use client';

import { useMemo } from 'react';
import {
    Code,
    FileCode,
    FileJson,
    FileText,
    Sparkles,
    BookOpen,
    Play,
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
} from '@/components/page-content';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

const docSections = [
    { id: 'overview', title: 'Overview', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'json-tools', title: 'JSON Tools', icon: <FileJson className="h-5 w-5" /> },
    { id: 'text-tools', title: 'Text Tools', icon: <FileText className="h-5 w-5" /> },
    { id: 'base64-tools', title: 'Base64 Tools', icon: <FileCode className="h-5 w-5" /> },
    { id: 'features', title: 'Key Features', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'getting-started', title: 'Getting Started', icon: <Play className="h-5 w-5" /> },
];

export default function DocsPage() {
    const sections = useMemo(() => docSections, []);
    const { activeSection, scrollToSection } = useScrollSpy(sections);

    return (
        <PageLayout>
            <PageHeader
                icon={<FileText className="h-6 w-6 text-white" />}
                title="DevTools Documentation"
                description="Complete guide to all development tools"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={sections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
                        sections={sections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
            >
                <PageSection
                    id="overview"
                    title="Overview"
                    description="A comprehensive suite of developer tools for JSON, text, and Base64 workflows. Boost your productivity with powerful utilities designed for modern development."
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="mb-1 font-semibold text-blue-900 dark:text-blue-100">
                                Powerful
                            </h3>
                            <p className="text-sm text-blue-700/70 dark:text-blue-300/70">
                                Advanced tools for complex tasks
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="mb-1 font-semibold text-emerald-900 dark:text-emerald-100">
                                Fast
                            </h3>
                            <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                                Optimized for quick workflows
                            </p>
                        </div>
                        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="mb-1 font-semibold text-purple-900 dark:text-purple-100">
                                Secure
                            </h3>
                            <p className="text-sm text-purple-700/70 dark:text-purple-300/70">
                                All data stays in your browser
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="json-tools"
                    title="JSON Tools"
                    description="Complete JSON toolkit for validation, formatting, comparison, and transformation."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">JSON Diff</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Compare two JSON files with split and unified view modes. See added,
                                removed, and changed lines with detailed stats.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold">JSON Format & Minify</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Beautify or minify JSON with real-time validation and syntax
                                highlighting.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">JSON Parser & Viewer</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Parse and validate JSON with detailed error messages. View JSON in
                                an expandable tree structure with syntax highlighting.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileJson className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <h3 className="font-semibold">JSON Schema & Export</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Validate JSON against schemas and export data in multiple formats.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="text-tools"
                    title="Text Tools"
                    description="Process and manipulate text with powerful transformation and analysis tools."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Text Diff</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Compare two text blocks side-by-side with line-by-line highlighting.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Text Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Transform text with case conversion, encoding/decoding, and format
                                conversions.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                <h3 className="font-semibold">Text Clean</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Remove extra spaces, trim lines, eliminate special characters, and
                                normalize whitespace.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="base64-tools"
                    title="Base64 Tools"
                    description="Encode and decode Base64 data with support for media files and automatic MIME type detection."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Media to Base64</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert any media file to Base64 encoding. Upload files directly,
                                preview images, and view file size statistics.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Base64 to Media</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Decode Base64 strings back to media files with automatic MIME type
                                detection. Preview decoded images and download converted files.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Base64 History</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Access your Base64 conversion history with persistent storage. View,
                                restore, copy, or clear individual history items.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection id="features" title="Key Features">
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Save className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Auto-Save</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                All your content is automatically saved to localStorage as you work.
                                Never lose your data due to accidental page refreshes.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <History className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">History Management</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Access your tool usage history across all pages. View, restore,
                                copy, or clear individual history items.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Zap className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Keyboard Shortcuts</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Power user keyboard shortcuts for quick filtering, exporting, and
                                panel toggling.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Privacy First</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                All data processing happens locally in your browser. Your data stays
                                yours.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection id="getting-started" title="Getting Started">
                    <div className="space-y-4">
                        {[
                            {
                                step: 1,
                                title: 'Choose Your Tool',
                                desc: 'Select from JSON Tools, Text Tools, or Base64 Tools from the navigation menu based on your task.',
                            },
                            {
                                step: 2,
                                title: 'Input Your Data',
                                desc: 'Paste, type, or upload files into the editor panels. The tools support syntax highlighting and real-time validation.',
                            },
                            {
                                step: 3,
                                title: 'Configure & Process',
                                desc: 'Adjust options to customize the output. Click the action button to process your data and view results instantly.',
                            },
                            {
                                step: 4,
                                title: 'Export & Share',
                                desc: 'Copy results to clipboard, download files, or generate shareable links. Your work is automatically saved for later access.',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="flex gap-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
