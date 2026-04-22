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
    Hash,
    Link,
    Fingerprint,
    Regex,
    KeyRound,
    Pipette,
    Binary,
    ArrowLeftRight,
    Globe,
    Ruler,
    QrCode,
    GitBranch,
    Link2,
    Palette,
    Clock,
    Timer,
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
    { id: 'hash-generator', title: 'Hash Generator', icon: <Hash className="h-5 w-5" /> },
    { id: 'url-encode-decode', title: 'URL Encode / Decode', icon: <Link className="h-5 w-5" /> },
    { id: 'id-generator', title: 'ID Generator', icon: <Fingerprint className="h-5 w-5" /> },
    { id: 'markdown-preview', title: 'Markdown Preview', icon: <FileText className="h-5 w-5" /> },
    { id: 'regex-tester', title: 'Regex Tester', icon: <Regex className="h-5 w-5" /> },
    {
        id: 'password-generator',
        title: 'Password Generator',
        icon: <KeyRound className="h-5 w-5" />,
    },
    { id: 'color-picker', title: 'Color Picker', icon: <Pipette className="h-5 w-5" /> },
    { id: 'number-base', title: 'Number Base Converter', icon: <Binary className="h-5 w-5" /> },
    { id: 'unit-converter', title: 'Unit Converter', icon: <ArrowLeftRight className="h-5 w-5" /> },
    { id: 'http-status', title: 'HTTP Status Codes', icon: <Globe className="h-5 w-5" /> },
    { id: 'mime-type', title: 'MIME Type Reference', icon: <FileText className="h-5 w-5" /> },
    { id: 'css-unit', title: 'CSS Unit Converter', icon: <Ruler className="h-5 w-5" /> },
    { id: 'qrcode-generator', title: 'QR Code Generator', icon: <QrCode className="h-5 w-5" /> },
    { id: 'git-branch', title: 'Git Branch Generator', icon: <GitBranch className="h-5 w-5" /> },
    { id: 'url-shortener', title: 'URL Shortener', icon: <Link2 className="h-5 w-5" /> },
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
                    description="A comprehensive suite of 18+ developer tools for JSON, text, encoding, hashing, generation, and reference lookups. Boost your productivity with powerful utilities designed for modern development."
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
                                Upload files (images, audio, video, PDF, ZIP) via drag-and-drop or
                                file picker. Converts to Base64 with image preview and file size
                                statistics.
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
                    </div>
                </PageSection>

                <PageSection
                    id="hash-generator"
                    title="Hash Generator"
                    description="Generate cryptographic hashes and HMAC signatures for text input."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Hash Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Instantly compute hashes for MD5, SHA-1, SHA-256, and SHA-512
                                simultaneously. Each hash can be individually copied to clipboard.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">HMAC Signatures</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate HMAC signatures with a message and secret key. Supports
                                HMAC-SHA256, HMAC-SHA1, and HMAC-SHA512 algorithms.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="url-encode-decode"
                    title="URL Encode / Decode"
                    description="Encode and decode percent-encoded URLs with support for component and URI-level encoding."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Link className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">URL Encode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                URL-encode plain text with two modes:{' '}
                                <code className="rounded bg-muted px-1 text-xs">
                                    encodeURIComponent
                                </code>{' '}
                                (encodes all special characters) and{' '}
                                <code className="rounded bg-muted px-1 text-xs">encodeURI</code>{' '}
                                (preserves URL structure characters like <code>:</code>,{' '}
                                <code>/</code>, <code>?</code>, <code>#</code>).
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">URL Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Decode percent-encoded strings back to plain text with validation
                                and error messages for invalid input.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="id-generator"
                    title="ID Generator"
                    description="Generate unique identifiers including UUIDs (v1–v8) and ULIDs with validation."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">UUID Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate UUIDs in versions v1, v3, v4, v5, v6, v7, and v8 with
                                configurable quantity (1–100). Includes a UUID validator that checks
                                format, version, and variant.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">ULID Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate ULIDs (Universally Unique Lexicographically Sortable
                                Identifiers) — 128-bit, sort-friendly identifiers using
                                Crockford&apos;s Base32 with embedded timestamps. Includes ULID
                                validation.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="markdown-preview"
                    title="Markdown Preview"
                    description="Write Markdown with a live HTML preview and export rendered output."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Live Preview</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Split-pane editor with live Markdown-to-HTML rendering. Shows
                                character, word, and line counts. Copy rendered HTML output
                                directly.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="regex-tester"
                    title="Regex Tester"
                    description="Test regular expressions with live matching, capture groups, and flag configuration."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Regex className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Regex Test</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Test regex patterns against input text with toggleable flags:{' '}
                                <strong>g</strong> (global), <strong>i</strong> (case-insensitive),{' '}
                                <strong>m</strong> (multiline), <strong>s</strong> (dotAll),{' '}
                                <strong>u</strong> (unicode). Shows highlighted matches, capture
                                groups (numbered and named), match count, and copy-all-matches
                                action.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="password-generator"
                    title="Password Generator"
                    description="Generate secure random passwords with strength analysis and configurable options."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Password Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate passwords with configurable length (4–128), toggleable
                                character sets (uppercase, lowercase, numbers, symbols). Shows 5
                                alternatives with strength rating (Very Weak to Very Strong), visual
                                meter, and entropy bit count.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="color-picker"
                    title="Color Picker"
                    description="Pick and convert colors between HEX, RGB, HSL, OKLCH and generate harmonious palettes."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Pipette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Color Picker</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Interactive color picker with native input and optional EyeDropper
                                API support. Edit in HEX, RGB, HSL, and OKLCH formats with sliders
                                for RGB, HSL, and alpha channels. Quick-copy buttons for all
                                formats.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Palette Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate color palettes in 6 modes: Shades, Analogous,
                                Complementary, Triadic, Split Complementary, and Tetradic. Each
                                color shows HEX, RGB, HSL, and OKLCH values.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="number-base"
                    title="Number Base Converter"
                    description="Convert numbers between binary, octal, decimal, hex, and custom radix with bit-level controls."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Binary className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Base Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert between Binary (base 2), Octal (base 8), Decimal (base 10),
                                Hexadecimal (base 16), and Custom Radix (2–36). Supports
                                configurable bit width (8, 16, 32, 64-bit) with signed/unsigned
                                toggle. Shows bit-level representation and ASCII equivalent.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="unit-converter"
                    title="Unit Converter"
                    description="Convert data sizes, time durations, and time zones with comprehensive unit support."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Data Size</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert between B, KB, MB, GB, TB, PB, EB. Supports both Decimal
                                (KB, MB) and Binary (KiB, MiB) unit systems with all conversions
                                shown simultaneously.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Time Duration</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert between nanoseconds through years with human-readable
                                duration breakdowns (e.g., &ldquo;1 d, 3 h, 24 min&rdquo;).
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Timezone</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert date/time between timezones with searchable comboboxes.
                                Includes a World Clock panel showing current time across popular
                                timezones.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="http-status"
                    title="HTTP Status Codes"
                    description="Searchable reference for all HTTP status codes with descriptions and spec references."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Status Code Reference</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Searchable and filterable table of HTTP status codes organized by
                                category: 1xx (Informational), 2xx (Success), 3xx (Redirection), 4xx
                                (Client Error), 5xx (Server Error). Shows code, phrase, spec
                                reference, and expandable descriptions.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="mime-type"
                    title="MIME Type Reference"
                    description="Searchable file extension and MIME type mapping reference."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">MIME Type Reference</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Searchable table filterable by category: application, audio, font,
                                image, model, text, video. Shows MIME type, file extensions, and
                                expandable details. Each entry can be individually copied.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="css-unit"
                    title="CSS Unit Converter"
                    description="Convert between all CSS units with configurable viewport and font-size contexts."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">CSS Unit Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert between px, rem, em, vw, vh, vmin, vmax, pt, pc, cm, mm, in,
                                and %. Configurable root font size, viewport width, and viewport
                                height. Includes common pixel presets and CSS snippet examples.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="qrcode-generator"
                    title="QR Code Generator"
                    description="Generate customizable QR codes from text or URLs with download support."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">QR Code Create</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate QR codes with configurable size (64–1024px), error
                                correction level (Low to High), foreground and background colors,
                                and margin. Download as PNG or copy as image to clipboard.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="git-branch"
                    title="Git Branch Generator"
                    description="Generate consistent, well-formatted git branch names from templates."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Branch Name Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Select an issue type (Feature, Bug Fix, Hotfix, Refactor, etc.),
                                optionally add an issue ID, and provide a description. Generates
                                branch names in{' '}
                                <code className="rounded bg-muted px-1 text-xs">
                                    type/issue-id/description
                                </code>{' '}
                                format with automatic cleaning — lowercase, hyphens for spaces, max
                                50 characters.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="url-shortener"
                    title="URL Shortener"
                    description="Shorten long URLs into compact, shareable links with click tracking."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Create Short URL</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter a long URL and get a shortened version instantly. Copy or open
                                shortened links in a new tab.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">URL History</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                View all previously shortened URLs with click tracking stats,
                                creation dates, copy and delete actions. Requires authentication.
                                Includes &ldquo;Clear All&rdquo; with confirmation dialog.
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
                                desc: 'Select from 18+ tools — JSON, Text, Base64, Hash, URL Encoding, ID Generation, Markdown, Regex, Password, Color, Number Base, Unit, HTTP Status, MIME Type, CSS Unit, QR Code, Git Branch, or URL Shortener.',
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
