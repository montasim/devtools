'use client';

import { useMemo } from 'react';
import { TOOL_COUNT_LABEL } from '@/lib/utils/constants';
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
    Terminal,
    Braces,
    Languages,
    Lock,
    Monitor,
    Plug,
    ShieldCheck,
    Table2,
    Radio,
    Route,
    MailX,
    Database,
    MailQuestion,
    ShieldAlert,
    Globe2,
    Type,
    Smile,
    Search,
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
    { id: 'features', title: 'Key Features', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'getting-started', title: 'Getting Started', icon: <Play className="h-5 w-5" /> },
    { id: 'json-tools', title: 'JSON Tools', icon: <FileJson className="h-5 w-5" /> },
    { id: 'text-tools', title: 'Text Tools', icon: <FileText className="h-5 w-5" /> },
    { id: 'base64-tools', title: 'Base64 Tools', icon: <FileCode className="h-5 w-5" /> },
    { id: 'url-encode-decode', title: 'URL Encode / Decode', icon: <Link className="h-5 w-5" /> },
    {
        id: 'html-entity',
        title: 'HTML Entity Encode / Decode',
        icon: <Braces className="h-5 w-5" />,
    },
    { id: 'curl-converter', title: 'cURL Converter', icon: <Terminal className="h-5 w-5" /> },
    { id: 'number-base', title: 'Number Base Converter', icon: <Binary className="h-5 w-5" /> },
    { id: 'css-unit', title: 'CSS Unit Converter', icon: <Ruler className="h-5 w-5" /> },
    { id: 'color-picker', title: 'Color Picker', icon: <Pipette className="h-5 w-5" /> },
    { id: 'markdown-preview', title: 'Markdown Preview', icon: <FileText className="h-5 w-5" /> },
    { id: 'id-generator', title: 'ID Generator', icon: <Fingerprint className="h-5 w-5" /> },
    { id: 'hash-generator', title: 'Hash Generator', icon: <Hash className="h-5 w-5" /> },
    {
        id: 'password-hash',
        title: 'Bcrypt / Argon2 Hasher',
        icon: <Lock className="h-5 w-5" />,
    },
    { id: 'rsa-key', title: 'RSA Key Generator', icon: <KeyRound className="h-5 w-5" /> },
    {
        id: 'password-generator',
        title: 'Password Generator',
        icon: <KeyRound className="h-5 w-5" />,
    },
    { id: 'qrcode-generator', title: 'QR Code Generator', icon: <QrCode className="h-5 w-5" /> },
    { id: 'git-branch', title: 'Git Branch Generator', icon: <GitBranch className="h-5 w-5" /> },
    {
        id: 'api-builder',
        title: 'API Request Builder',
        icon: <Zap className="h-5 w-5" />,
    },
    {
        id: 'websocket-tester',
        title: 'WebSocket Tester',
        icon: <Plug className="h-5 w-5" />,
    },
    { id: 'cors-checker', title: 'CORS Checker', icon: <ShieldCheck className="h-5 w-5" /> },
    {
        id: 'cert-decoder',
        title: 'Certificate Decoder',
        icon: <Fingerprint className="h-5 w-5" />,
    },
    {
        id: 'user-agent',
        title: 'User Agent Analyzer',
        icon: <Monitor className="h-5 w-5" />,
    },
    { id: 'dns-lookup', title: 'DNS Lookup', icon: <Globe className="h-5 w-5" /> },
    { id: 'stun-checker', title: 'STUN Server Checker', icon: <Radio className="h-5 w-5" /> },
    { id: 'turn-checker', title: 'TURN Server Checker', icon: <Route className="h-5 w-5" /> },
    { id: 'regex-tester', title: 'Regex Tester', icon: <Regex className="h-5 w-5" /> },
    { id: 'http-status', title: 'HTTP Status Codes', icon: <Globe className="h-5 w-5" /> },
    { id: 'mime-type', title: 'MIME Type Reference', icon: <FileText className="h-5 w-5" /> },
    { id: 'content-type', title: 'Content-Type Reference', icon: <FileCode className="h-5 w-5" /> },
    { id: 'unicode-lookup', title: 'Unicode Lookup', icon: <Languages className="h-5 w-5" /> },
    { id: 'ascii-table', title: 'ASCII Table', icon: <Table2 className="h-5 w-5" /> },
    { id: 'cron-builder', title: 'CRON Builder', icon: <Timer className="h-5 w-5" /> },
    { id: 'unit-converter', title: 'Unit Converter', icon: <ArrowLeftRight className="h-5 w-5" /> },
    { id: 'url-shortener', title: 'URL Shortener', icon: <Link2 className="h-5 w-5" /> },
    {
        id: 'temp-email',
        title: 'Temporary Email Checker',
        icon: <MailX className="h-5 w-5" />,
    },
    {
        id: 'free-email',
        title: 'Free Email Checker',
        icon: <MailQuestion className="h-5 w-5" />,
    },
    {
        id: 'spam-words',
        title: 'Spam Words Checker',
        icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
        id: 'timezones',
        title: 'Timezones',
        icon: <Globe2 className="h-5 w-5" />,
    },
    {
        id: 'fancy-text',
        title: 'Fancy Text Generator',
        icon: <Sparkles className="h-5 w-5" />,
    },
    {
        id: 'leet-text',
        title: 'Leet Text Encoder / Decoder',
        icon: <Terminal className="h-5 w-5" />,
    },
    {
        id: 'text-art',
        title: 'Text Art Generator',
        icon: <Type className="h-5 w-5" />,
    },
    {
        id: 'emoji',
        title: 'Emoji Picker',
        icon: <Smile className="h-5 w-5" />,
    },
];

export default function DocsPage() {
    const sections = useMemo(() => docSections, []);
    const { activeSection, scrollToSection } = useScrollSpy(sections);

    return (
        <PageLayout>
            <PageHeader
                icon={<FileText className="h-6 w-6 text-white" />}
                title="DevTools Documentation"
                description="Master every tool in under 2 minutes"
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
                    description={`${TOOL_COUNT_LABEL} tools you'll actually use — not just bookmark. No installs, no accounts, no data leaving your browser. Open any tool and get results in seconds.`}
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="mb-1 font-semibold text-blue-900 dark:text-blue-100">
                                Works Instantly
                            </h3>
                            <p className="text-sm text-blue-700/70 dark:text-blue-300/70">
                                No loading screens, no waiting &mdash; results before your coffee
                                cools
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="mb-1 font-semibold text-emerald-900 dark:text-emerald-100">
                                Zero Friction
                            </h3>
                            <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                                No installs, no sign-ups, no accounts &mdash; just open and use
                            </p>
                        </div>
                        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30">
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="mb-1 font-semibold text-purple-900 dark:text-purple-100">
                                Your Data Stays Yours
                            </h3>
                            <p className="text-sm text-purple-700/70 dark:text-purple-300/70">
                                Everything runs locally. Nothing ever leaves your machine.
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
                                Your work is saved automatically as you type. Close the tab by
                                accident? Your data is still here when you come back.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <History className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">History Management</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Every tool remembers what you did. Restore, copy, or clear past
                                inputs and outputs across all pages.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Zap className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Keyboard Shortcuts</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Work faster with shortcuts for filtering, exporting, and toggling
                                panels &mdash; keep your hands on the keyboard.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold">Privacy First</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Everything runs in your browser. No servers, no tracking, no data
                                collection &mdash; your data never leaves your machine.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection id="getting-started" title="Getting Started">
                    <div className="space-y-4">
                        {[
                            {
                                step: 1,
                                title: 'Pick a tool',
                                desc: `Browse ${TOOL_COUNT_LABEL} tools by category or search for what you need. Every tool is one click away.`,
                            },
                            {
                                step: 2,
                                title: 'Paste your data',
                                desc: 'Drop in your text, JSON, file, or URL. Syntax highlighting and validation happen as you type.',
                            },
                            {
                                step: 3,
                                title: 'Get instant results',
                                desc: 'Adjust options if needed, then copy, download, or share the output. No waiting, no server round-trips.',
                            },
                            {
                                step: 4,
                                title: 'Come back anytime',
                                desc: 'Your inputs are auto-saved per tool. Reopen the page and everything is right where you left it.',
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

                <PageSection
                    id="json-tools"
                    title="JSON Tools"
                    description="Stop wrestling with malformed JSON. Format, compare, and validate in one place."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">JSON Diff</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Spot every difference between two JSON files instantly. Split and
                                unified views show exactly what was added, removed, or changed
                                &mdash; no more manual comparison.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold">JSON Format &amp; Minify</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste messy JSON and get perfectly formatted output instantly
                                &mdash; or minify it for production. Catches syntax errors before
                                they hit your code.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">JSON Parser &amp; Viewer</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Navigate complex JSON with an expandable tree view. Pinpoint exactly
                                where errors are with detailed messages instead of guessing.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileJson className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <h3 className="font-semibold">JSON Schema &amp; Export</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Validate data against schemas and export to any format you need.
                                Stop writing conversion scripts by hand.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="text-tools"
                    title="Text Tools"
                    description="Transform, clean, and compare any text without leaving your browser."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Text Diff</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Never miss a change again. Side-by-side comparison highlights every
                                added, removed, or modified line.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Text Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Switch between camelCase, snake_case, Title Case, and more in one
                                click. Stop doing case conversions by hand.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                <h3 className="font-semibold">Text Clean</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Strip extra whitespace, remove special characters, and normalize
                                line breaks &mdash; fix messy copy-pasted text in seconds.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="base64-tools"
                    title="Base64 Tools"
                    description="Convert files to Base64 and back — perfect for embedding assets inline."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Media to Base64</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop any file &mdash; images, audio, video, PDFs, ZIPs
                                &mdash; and get a Base64 string instantly with preview and size
                                stats.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Base64 to Media</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste a Base64 string and get the original file back with
                                auto-detected MIME type. Preview images and download the result.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="url-encode-decode"
                    title="URL Encode / Decode"
                    description="Fix mangled URLs instantly — encode special characters or decode percent-encoded strings."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Link className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">URL Encode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Need to safely pass text in a URL? Choose{' '}
                                <code className="rounded bg-muted px-1 text-xs">
                                    encodeURIComponent
                                </code>{' '}
                                to encode everything, or{' '}
                                <code className="rounded bg-muted px-1 text-xs">encodeURI</code> to
                                keep URL structure intact (<code>:</code>, <code>/</code>,{' '}
                                <code>?</code>, <code>#</code>).
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">URL Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Turn <code>%20</code> back into spaces and <code>%3F</code> back
                                into <code>?</code>. Paste any encoded URL and get the readable
                                version instantly.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="html-entity"
                    title="HTML Entity Encode / Decode"
                    description="Make special characters HTML-safe, or turn entities back into readable text."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Braces className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <h3 className="font-semibold">HTML Entity Encode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Stop manually typing <code>&amp;amp;</code> and{' '}
                                <code>&amp;lt;</code>. Paste your text and get properly encoded HTML
                                entities instantly &mdash; named, decimal, or hex formats.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Code className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="font-semibold">HTML Entity Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste a wall of HTML entities and get readable text back. Handles
                                invalid entities gracefully.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="curl-converter"
                    title="cURL Converter"
                    description="Stop writing HTTP requests from scratch. Paste a cURL command, pick your language, done."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Terminal className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                <h3 className="font-semibold">cURL Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Copy a cURL command from your terminal and get ready-to-use code for{' '}
                                <strong>fetch</strong>, <strong>Axios</strong>,{' '}
                                <strong>Python</strong>, or <strong>HTTPie</strong> &mdash; headers,
                                body, and auth included.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="number-base"
                    title="Number Base Converter"
                    description="No more reaching for a calculator. Convert between any number base instantly."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Binary className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Base Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Binary, octal, decimal, hex, or any base 2&ndash;36 &mdash; all
                                conversions shown at once with configurable bit width and
                                signedness. See the bit-level representation and ASCII equivalent
                                side by side.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="css-unit"
                    title="CSS Unit Converter"
                    description="Stop guessing rem-to-px conversions. Get precise results with your actual viewport and font-size."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">CSS Unit Convert</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert between px, rem, em, vw, vh, pt, cm, and more &mdash; with
                                your actual root font size and viewport dimensions. Includes common
                                pixel presets and ready-to-copy CSS snippets.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="color-picker"
                    title="Color Picker"
                    description="Pick the perfect color and build harmonious palettes without switching tools."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Pipette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Color Picker</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Pick any color with the native picker or EyeDropper API, then edit
                                in HEX, RGB, HSL, or OKLCH with live sliders. One-click copy for
                                every format.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Palette Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate professional color palettes in 6 modes &mdash; Shades,
                                Analogous, Complementary, Triadic, Split Complementary, and
                                Tetradic. Every color shows all format values ready to copy.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="markdown-preview"
                    title="Markdown Preview"
                    description="Write Markdown and see the rendered output side by side — no save needed."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Live Preview</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Split-pane editor that renders Markdown as you type. See character,
                                word, and line counts at a glance. Copy the rendered HTML with one
                                click.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="id-generator"
                    title="ID Generator"
                    description="Generate production-ready UUIDs and ULIDs in every version you'll ever need."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">UUID Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Need a quick UUID? Generate v1 through v8 in batches up to 100 at
                                once. Includes a validator to verify format, version, and variant of
                                existing UUIDs.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">ULID Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate sort-friendly ULIDs with embedded timestamps &mdash;
                                perfect for databases where ordering matters. Includes validation.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="hash-generator"
                    title="Hash Generator"
                    description="Get MD5, SHA-1, SHA-256, and SHA-512 hashes at once — no terminal needed."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Hash Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste any text and get MD5, SHA-1, SHA-256, and SHA-512 hashes
                                simultaneously &mdash; each ready to copy with one click.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">HMAC Signatures</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Sign messages with a secret key using HMAC-SHA256, SHA1, or SHA512
                                &mdash; essential for API authentication and webhook verification.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="password-hash"
                    title="Bcrypt / Argon2 Hasher"
                    description="Hash and verify passwords using the same algorithms production apps rely on."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold">Password Hash</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Hash passwords with <strong>bcrypt</strong> (adjustable rounds) or{' '}
                                <strong>Argon2</strong> (id/i/d with configurable memory and
                                iterations) &mdash; the same algorithms trusted by production auth
                                systems.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Password Verify</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Check if a password matches a hash. Auto-detects bcrypt or Argon2
                                and shows the result instantly &mdash; handy for debugging auth
                                flows.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="rsa-key"
                    title="RSA Key Generator"
                    description="Generate RSA key pairs in your browser — no OpenSSL commands to remember."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <KeyRound className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                <h3 className="font-semibold">RSA Key Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generate 2048 or 4096-bit RSA key pairs with PEM or DER output. Get
                                the public key, private key, SHA-256 fingerprint, and copy-each
                                buttons &mdash; all generated locally, nothing sent anywhere.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="password-generator"
                    title="Password Generator"
                    description="Create strong passwords you can actually trust — with entropy scoring built in."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Password Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Set the length and character sets, then pick from 5 generated
                                alternatives. Each password comes with a strength rating and entropy
                                score so you know exactly how strong it is.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="qrcode-generator"
                    title="QR Code Generator"
                    description="Turn any URL or text into a QR code you can customize and download instantly."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">QR Code Create</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Customize size, error correction level, colors, and margin &mdash;
                                then download as PNG or copy to clipboard. Your QR code, your style.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="git-branch"
                    title="Git Branch Generator"
                    description="Never waste time deciding on a branch name again."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Branch Name Generator</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Pick an issue type, add an optional ID, and describe the task. Get a
                                clean{' '}
                                <code className="rounded bg-muted px-1 text-xs">
                                    type/issue-id/description
                                </code>{' '}
                                branch name automatically &mdash; lowercase, hyphenated, max 50
                                chars. Your team will thank you.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="api-builder"
                    title="API Request Builder"
                    description="Your browser-based Postman — build and debug HTTP requests without installing anything."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold">HTTP Client</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Full HTTP client: set the method, URL, query params, headers, body
                                (JSON/text/form), and auth (Bearer/Basic) &mdash; then see the
                                response with status, timing, and size at a glance.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="websocket-tester"
                    title="WebSocket Tester"
                    description="Debug WebSocket connections in real-time without writing a single line of client code."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Plug className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                                <h3 className="font-semibold">WebSocket Client</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Connect to any <code>ws://</code> or <code>wss://</code> endpoint
                                and see messages flow in real-time with timestamps and direction
                                arrows. Send messages, copy the full log, or clear it &mdash; all
                                with live connection status.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="cors-checker"
                    title="CORS Checker"
                    description="Fix CORS errors in minutes, not hours — see exactly which headers are missing."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">CORS Check</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter a URL and instantly see which CORS headers are present or
                                missing. Get a clear Enabled/Failed status, response time, and a
                                copyable report you can send to your backend team.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="cert-decoder"
                    title="Certificate Decoder"
                    description="Paste a PEM certificate and see every field decoded — no OpenSSL required."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Fingerprint className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="font-semibold">Certificate Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Decode any PEM certificate locally &mdash; see validity, subject,
                                issuer, public key, extensions, and fingerprints (SHA-256/SHA-1) at
                                a glance. Every field is copyable.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="user-agent"
                    title="User Agent Analyzer"
                    description="Find out exactly what a User-Agent string means — browser, OS, device, and bot detection."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Monitor className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                <h3 className="font-semibold">UA Analyze</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste any User-Agent or pick from presets. Get a clear breakdown of
                                browser, OS, device type, and bot detection &mdash; perfect for
                                debugging responsive layouts or analytics.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="dns-lookup"
                    title="DNS Lookup"
                    description="Check any domain's DNS records without opening a terminal."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Globe className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                <h3 className="font-semibold">DNS Query</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter a domain, pick a record type (A, AAAA, MX, TXT, CNAME, NS,
                                SOA, PTR), and get results instantly with copy-per-row. Export
                                everything as JSON when you need to share.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="stun-checker"
                    title="STUN Server Checker"
                    description="Test STUN server connectivity and discover your public IP address using WebRTC."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Radio className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold">STUN Connectivity Test</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter a STUN server URL (e.g.{' '}
                                <code className="rounded bg-muted px-1 text-xs">
                                    stun:stun.l.google.com:19302
                                </code>
                                ) or pick from built-in presets. The tool uses WebRTC ICE to test
                                server reachability, discover your public IP via server reflexive
                                candidates, and display all gathered candidates with expandable
                                details.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold">Public IP Discovery</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                When the STUN server responds, your public IP address is extracted
                                from the srflx (server reflexive) ICE candidates &mdash; no server
                                round-trips needed, everything runs locally in your browser.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="turn-checker"
                    title="TURN Server Checker"
                    description="Verify TURN server credentials, test relay allocation, and debug WebRTC connectivity."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Route className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <h3 className="font-semibold">TURN Relay Allocation</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter a TURN server URL with username and credential (password) to
                                test relay allocation. The tool attempts to allocate a relay via
                                WebRTC ICE and reports whether the server accepted the credentials
                                and successfully allocated a relay address. Supports UDP and TCP
                                transports.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Credential Verification</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Quickly validate TURN credentials before deploying them. Get clear
                                pass/fail status, relay IP addresses, response time, and a full ICE
                                candidate breakdown &mdash; host, srflx, and relay candidates all
                                shown with expandable details and raw SDP.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="regex-tester"
                    title="Regex Tester"
                    description="Stop guessing if your regex works. Test it live with highlighted matches and capture groups."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Regex className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Regex Test</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Write a pattern, paste your test string, and see matches highlighted
                                in real-time. Toggle flags (<strong>g</strong>, <strong>i</strong>,{' '}
                                <strong>m</strong>, <strong>s</strong>, <strong>u</strong>), inspect
                                numbered and named capture groups, and copy all matches at once.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="http-status"
                    title="HTTP Status Codes"
                    description="Look up any status code in seconds — with spec references and plain-English explanations."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Status Code Reference</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Search and filter by category &mdash; 1xx through 5xx. Every code
                                includes the reason phrase, RFC spec link, and a plain-English
                                explanation you can actually understand.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="mime-type"
                    title="MIME Type Reference"
                    description="Stop Googling file MIME types. Look them up here in seconds."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">MIME Type Reference</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Search by type or filter by category (application, audio, font,
                                image, text, video, model). Every entry shows the MIME type and file
                                extensions &mdash; ready to copy.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="content-type"
                    title="Content-Type Reference"
                    description="Look up HTTP Content-Type headers with descriptions, extensions, and common usage flags."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <FileCode className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                <h3 className="font-semibold">Content-Type Reference</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Search by Content-Type header, file extension, or description.
                                Filter by category (application, audio, font, image, message,
                                multipart, text, video). Common types like{' '}
                                <code>application/json</code> and <code>multipart/form-data</code>{' '}
                                are flagged for quick discovery. Every entry is one-click copyable.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="unicode-lookup"
                    title="Unicode Lookup"
                    description="Find any Unicode character by name, codepoint, or block — and copy it in every format."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Languages className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold">Unicode Search</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Search by name, codepoint (e.g. <code>U+0041</code>), or the
                                character itself. Expand any result to get HTML Decimal, HTML Hex,
                                CSS, JavaScript, and UTF-8 byte representations &mdash; each
                                one-click copyable.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="ascii-table"
                    title="ASCII Table"
                    description="The ASCII reference you'll keep coming back to — searchable, filterable, and copyable."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Table2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold">ASCII Reference</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Search by name, decimal, hex, binary, or the character itself.
                                Expand any entry to get Decimal, Hex, Binary, HTML Entity, Escape
                                Sequence, and Octal &mdash; all ready to copy. Control characters
                                included.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="cron-builder"
                    title="CRON Builder"
                    description="Build cron expressions without memorizing the syntax — see the next 6 run times before you commit."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Timer className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="font-semibold">Cron Expression Builder</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Configure each field visually (Every, Specific, Range, Step, Custom)
                                and see the expression built in real-time with a plain-English
                                description. Preview the next 6 execution times before you deploy.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="unit-converter"
                    title="Unit Converter"
                    description="Convert data sizes, time durations, and time zones without reaching for a calculator."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Data Size</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Bytes to petabytes, Decimal or Binary units &mdash; see every
                                conversion at once so you pick the right one.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Time Duration</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Nanoseconds to years with human-readable breakdowns (e.g., &ldquo;1
                                d, 3 h, 24 min&rdquo;).
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Timezone</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Convert times between any timezone with a World Clock showing
                                current times across popular cities.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="url-shortener"
                    title="URL Shortener"
                    description="Turn long, ugly URLs into short links you can actually share."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Create Short URL</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste any URL and get a shortened version instantly. Copy it or open
                                it in a new tab &mdash; one click, done.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">URL History</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                See all your shortened URLs with click counts and creation dates.
                                Copy, delete, or clear all with one action. Requires authentication.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="temp-email"
                    title="Temporary Email Checker"
                    description="Detect disposable and temporary email addresses instantly."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <MailX className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <h3 className="font-semibold">Email Checker</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste any email address to check if its domain is disposable. The
                                tool matches against a database of 53,000+ known temporary email
                                domains and shows whether the address is safe or disposable, along
                                with a full check history.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold">Sample Data</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse the full list of known disposable domains with search,
                                filtering, and pagination. View TLD distribution charts and keyword
                                cluster stats to understand the landscape of temporary email
                                providers.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="free-email"
                    title="Free Email Checker"
                    description="Detect free email provider domains like Gmail, Yahoo, and Outlook."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <MailQuestion className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold">Email Checker</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste any email address to check if its domain is a free email
                                provider. The tool matches against a database of 4,700+ known free
                                email domains (Gmail, Yahoo, Outlook, AOL, etc.) and shows whether
                                the address is personal or business, along with a full check
                                history.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold">Sample Data</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse the full list of known free email provider domains with
                                search, filtering, and pagination. View TLD distribution charts and
                                keyword cluster stats to understand the landscape of free email
                                providers.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="spam-words"
                    title="Spam Words Checker"
                    description="Detect spam trigger words in your email content to improve deliverability."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <h3 className="font-semibold">Content Checker</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste your email content, subject line, or marketing copy to find
                                spam trigger words. The tool matches against a database of 558+
                                known spam words across 12 categories, shows a risk level
                                assessment, and lists all matched words with hit counts.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold">Word Browser</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse the full list of spam trigger words with search, category
                                filtering, and pagination. View category distribution charts and
                                starting letter statistics to understand the landscape of spam
                                triggers.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="timezones"
                    title="Timezones"
                    description="World clock and timezone database for 247 countries."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">World Clock</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Add cities to see their current time in real-time. Search by city
                                name or timezone, and compare times across the globe with live
                                updating clocks and UTC offset badges.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Globe2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold">Timezone Browser</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse 247 countries and their 437 IANA timezones. Filter by region,
                                search countries, and expand to see all timezones per country with
                                one-click copy.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="fancy-text"
                    title="Fancy Text Generator"
                    description="Transform plain text into 109 Unicode styles — bold, script, circled, and more."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                <h3 className="font-semibold">Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Type or paste text and see 109 Unicode styles instantly — bold,
                                italic, script, fraktur, circled, squared, fullwidth, braille,
                                runic, georgian, and more. Copy any style with one click.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ArrowLeftRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste fancy Unicode text and auto-detect the style. The decoder
                                reverses character mappings and strips combining marks to recover
                                the original plain text.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Characters</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse all 109 styles with their character mappings, grouped by
                                category. Filter by type or search to find the right style.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="leet-text"
                    title="Leet Text Encoder / Decoder"
                    description="Encode text into 10 leet speak variants and decode leet back to plain text."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Terminal className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                <h3 className="font-semibold">Encode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Transform plain text into 10 leet speak variants — from basic
                                substitutions to advanced multi-character replacements. Each variant
                                shows the full mapping and one-click copy.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ArrowLeftRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste leet text and the auto-detect decoder identifies the variant
                                and reverses it back to plain English. Works across all 10 encoding
                                levels.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Characters</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse the full character reference for all 10 leet variants,
                                grouped by category with filter and search.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="text-art"
                    title="Text Art Generator"
                    description="Create ASCII banners, text boxes, and Unicode block art from plain text."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Type className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-semibold">Generate</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Type or paste text and instantly see 48+ art styles — figlet banners
                                (Standard, Block, Shadow, Doom, Star Wars, etc.), text boxes with
                                various borders, and Unicode block pixel art. Filter by category and
                                copy any style with one click.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <ArrowLeftRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold">Decode</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Paste text art and the decoder strips box borders and decorative
                                characters to recover the original plain text.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Styles</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse all available styles with live previews, grouped by category.
                                Filter by type or search to find the right style.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="emoji"
                    title="Emoji Picker"
                    description="Browse and copy 1,900+ emojis for any platform."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Smile className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="font-semibold">Browse & Copy</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Browse 1,900+ emojis organized into 9 Unicode categories — Smileys
                                &amp; Emotion, People &amp; Body, Animals &amp; Nature, Food &amp;
                                Drink, Travel &amp; Places, Activities, Objects, Symbols, and Flags.
                                Click any emoji to copy it instantly. Works on iOS, Android, macOS,
                                Windows, Linux, and ChromeOS. Paste directly into Twitter, Facebook,
                                Slack, Instagram, WhatsApp, GitHub, and more.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">Search</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Find any emoji by name or keyword. Results update as you type.
                                Filter by category using the pill buttons to narrow results.
                            </p>
                        </div>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
