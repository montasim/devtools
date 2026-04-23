import Link from 'next/link';
import {
    ArrowRight,
    Braces,
    Type,
    Binary,
    Zap,
    Shield,
    Sparkles,
    Heart,
    Terminal,
    Hash,
    Link2,
    Fingerprint,
    FileText,
    KeyRound,
    Pipette,
    ArrowLeftRight,
    Globe,
    Ruler,
    GitBranch,
    QrCode,
    Code2,
    Plug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { buildWebSiteSchema, buildSoftwareAppSchema } from '@/lib/seo/structured-data';

export const metadata = generatePageMetadata('home');

const TOOLS = [
    {
        href: '/json',
        label: 'JSON Tools',
        description: 'Format, minify, diff, validate, and transform JSON',
        icon: Braces,
    },
    {
        href: '/text',
        label: 'Text Tools',
        description: 'Convert case, clean text, diff, and analyze',
        icon: Type,
    },
    {
        href: '/base64',
        label: 'Base64 Tools',
        description: 'Encode and decode Base64 for files and media',
        icon: Binary,
    },
    {
        href: '/hash',
        label: 'Hash Generator',
        description: 'Generate hashes and HMAC signatures',
        icon: Hash,
    },
    {
        href: '/url-encode',
        label: 'URL Encode / Decode',
        description: 'Encode and decode percent-encoded URLs',
        icon: Link2,
    },
    {
        href: '/id',
        label: 'ID Generator',
        description: 'Generate UUIDs (v1/v4/v7) and ULIDs',
        icon: Fingerprint,
    },
    {
        href: '/markdown',
        label: 'Markdown Preview',
        description: 'Write Markdown with live preview',
        icon: FileText,
    },
    {
        href: '/regex',
        label: 'Regex Tester',
        description: 'Test regex with live matching and capture groups',
        icon: FileText,
    },
    {
        href: '/password',
        label: 'Password Generator',
        description: 'Generate secure passwords with strength meter',
        icon: KeyRound,
    },
    {
        href: '/color',
        label: 'Color Picker',
        description: 'Convert HEX, RGB, HSL, OKLCH and generate palettes',
        icon: Pipette,
    },
    {
        href: '/number-base',
        label: 'Number Base Converter',
        description: 'Binary, octal, decimal, hex, and custom radix',
        icon: Binary,
    },
    {
        href: '/unit',
        label: 'Unit Converter',
        description: 'Data sizes, time durations, and time zones',
        icon: ArrowLeftRight,
    },
    {
        href: '/http-status',
        label: 'HTTP Status Codes',
        description: 'Searchable reference with descriptions and specs',
        icon: Globe,
    },
    {
        href: '/mime-type',
        label: 'MIME Type Reference',
        description: 'File extension ↔ MIME type mapping',
        icon: FileText,
    },
    {
        href: '/css-unit',
        label: 'CSS Unit Converter',
        description: 'Convert between px, rem, em, vw, vh, pt, cm',
        icon: Ruler,
    },
    {
        href: '/qrcode',
        label: 'QR Code Generator',
        description: 'Generate customizable QR codes with colors and sizes',
        icon: QrCode,
    },
    {
        href: '/api-builder',
        label: 'API Request Builder',
        description: 'Build, test, and debug HTTP requests online',
        icon: Globe,
    },
    {
        href: '/curl',
        label: 'cURL Converter',
        description: 'Convert cURL to fetch, Axios, Python, and HTTPie',
        icon: Code2,
    },
    {
        href: '/websocket',
        label: 'WebSocket Tester',
        description: 'Connect to WS endpoints, send and receive messages',
        icon: Plug,
    },
    {
        href: '/git-branch-generator',
        label: 'Git Branch Generator',
        description: 'Generate consistent git branch names from templates',
        icon: GitBranch,
    },
    {
        href: '/url-shortener',
        label: 'URL Shortener',
        description: 'Shorten long URLs into compact shareable links',
        icon: Link2,
    },
];

const FEATURES = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'All tools run locally in your browser. No server uploads, no waiting.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your data never leaves your browser. 100% client-side processing.',
    },
    {
        icon: Sparkles,
        title: 'Modern Design',
        description: 'Clean, intuitive interface with dark mode support and responsive layout.',
    },
    {
        icon: Heart,
        title: 'Free Forever',
        description: 'All tools are completely free with no sign-up required.',
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([buildWebSiteSchema(), buildSoftwareAppSchema()]),
                }}
            />
            <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 py-16 sm:py-24">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
                            <Terminal className="h-4 w-4" />
                            <span className="font-semibold">Developer Tools</span>
                        </div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Powerful Tools for
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {' '}
                                Developers
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                            A comprehensive suite of 18+ developer tools for formatting, converting,
                            generating, and referencing. All tools run locally in your browser for
                            maximum privacy and speed.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" asChild>
                                <Link href="/json">
                                    <Braces className="mr-2 h-5 w-5" />
                                    Explore Tools
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/docs">
                                    <Terminal className="mr-2 h-5 w-5" />
                                    Documentation
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                            All Developer Tools
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                            Everything you need to build, debug, and ship faster.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {TOOLS.map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                                    <tool.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                                    {tool.label}
                                </h3>
                                <p className="text-sm text-muted-foreground">{tool.description}</p>
                                <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:gap-2">
                                    Get Started
                                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t bg-muted/30 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                            Why Choose Our Tools?
                        </h2>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
