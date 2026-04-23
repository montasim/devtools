import {
    Book,
    FileJson,
    FileText,
    FileCode,
    GitBranch,
    Link2,
    QrCode,
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
    Monitor,
    Zap,
    Code2,
    Plug,
    ShieldCheck,
    Braces,
    Network,
    Wrench,
    Languages,
    Lock,
} from 'lucide-react';

export interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    category?: string;
    items?: MenuItem[];
}

export const navigationMenu: MenuItem[] = [
    {
        title: 'Tools',
        url: '#',
        items: [
            {
                title: 'JSON Tools',
                description: 'Format, minify, diff, validate, and transform JSON',
                icon: <FileJson className="size-5 shrink-0" />,
                url: '/json',
                category: 'Formatters & Converters',
            },
            {
                title: 'Text Tools',
                description: 'Diff, case conversion, and text cleaning',
                icon: <FileText className="size-5 shrink-0" />,
                url: '/text',
                category: 'Formatters & Converters',
            },
            {
                title: 'Base64 Tools',
                description: 'Encode and decode Base64 data',
                icon: <FileCode className="size-5 shrink-0" />,
                url: '/base64',
                category: 'Formatters & Converters',
            },
            {
                title: 'URL Encode / Decode',
                description: 'Encode and decode percent-encoded URLs',
                icon: <Link className="size-5 shrink-0" />,
                url: '/url-encode',
                category: 'Formatters & Converters',
            },
            {
                title: 'HTML Entity Encode / Decode',
                description: 'Encode and decode HTML entities (&amp;, &lt;, &#x27;, etc.)',
                icon: <FileCode className="size-5 shrink-0" />,
                url: '/html-entity',
                category: 'Formatters & Converters',
            },
            {
                title: 'cURL Converter',
                description: 'Convert cURL to fetch, Axios, Python, and HTTPie',
                icon: <Code2 className="size-5 shrink-0" />,
                url: '/curl',
                category: 'Formatters & Converters',
            },
            {
                title: 'Number Base Converter',
                description: 'Binary, octal, decimal, hex, and custom radix',
                icon: <Binary className="size-5 shrink-0" />,
                url: '/number-base',
                category: 'Formatters & Converters',
            },
            {
                title: 'CSS Unit Converter',
                description: 'Convert between px, rem, em, vw, vh, pt, cm',
                icon: <Ruler className="size-5 shrink-0" />,
                url: '/css-unit',
                category: 'Formatters & Converters',
            },
            {
                title: 'Color Picker',
                description: 'HEX, RGB, HSL, OKLCH and palette generator',
                icon: <Pipette className="size-5 shrink-0" />,
                url: '/color',
                category: 'Formatters & Converters',
            },
            {
                title: 'Markdown Preview',
                description: 'Write Markdown with live preview',
                icon: <FileText className="size-5 shrink-0" />,
                url: '/markdown',
                category: 'Formatters & Converters',
            },
            {
                title: 'ID Generator',
                description: 'Generate UUIDs, ULIDs, and NanoIDs',
                icon: <Fingerprint className="size-5 shrink-0" />,
                url: '/id',
                category: 'Generators',
            },
            {
                title: 'Hash Generator',
                description: 'Generate hashes and HMAC signatures',
                icon: <Hash className="size-5 shrink-0" />,
                url: '/hash',
                category: 'Generators',
            },
            {
                title: 'Bcrypt / Argon2 Hasher',
                description: 'Hash and verify passwords with bcrypt and Argon2',
                icon: <Lock className="size-5 shrink-0" />,
                url: '/password-hash',
                category: 'Generators',
            },
            {
                title: 'RSA Key Generator',
                description: 'Generate RSA key pairs, format as PEM or DER',
                icon: <KeyRound className="size-5 shrink-0" />,
                url: '/rsa-key',
                category: 'Generators',
            },
            {
                title: 'Password Generator',
                description: 'Secure passwords with strength meter',
                icon: <KeyRound className="size-5 shrink-0" />,
                url: '/password',
                category: 'Generators',
            },
            {
                title: 'QR Code Generator',
                description: 'Generate customizable QR codes',
                icon: <QrCode className="size-5 shrink-0" />,
                url: '/qrcode',
                category: 'Generators',
            },
            {
                title: 'Git Branch Generator',
                description: 'Generate consistent git branch names',
                icon: <GitBranch className="size-5 shrink-0" />,
                url: '/git-branch-generator',
                category: 'Generators',
            },
            {
                title: 'API Request Builder',
                description: 'Build, test, and debug HTTP requests',
                icon: <Zap className="size-5 shrink-0" />,
                url: '/api-builder',
                category: 'Network & API',
            },
            {
                title: 'WebSocket Tester',
                description: 'Connect to WS endpoints, send/receive in real-time',
                icon: <Plug className="size-5 shrink-0" />,
                url: '/websocket',
                category: 'Network & API',
            },
            {
                title: 'CORS Checker',
                description: 'Test cross-origin requests and inspect CORS headers',
                icon: <ShieldCheck className="size-5 shrink-0" />,
                url: '/cors',
                category: 'Network & API',
            },
            {
                title: 'User Agent Analyzer',
                description: 'Parse and decode User-Agent strings',
                icon: <Monitor className="size-5 shrink-0" />,
                url: '/user-agent',
                category: 'Network & API',
            },
            {
                title: 'Regex Tester',
                description: 'Test regex with live matching and capture groups',
                icon: <Regex className="size-5 shrink-0" />,
                url: '/regex',
                category: 'Reference',
            },
            {
                title: 'HTTP Status Codes',
                description: 'Searchable reference with descriptions and specs',
                icon: <Globe className="size-5 shrink-0" />,
                url: '/http-status',
                category: 'Reference',
            },
            {
                title: 'MIME Type Reference',
                description: 'File extension ↔ MIME type mapping',
                icon: <FileText className="size-5 shrink-0" />,
                url: '/mime-type',
                category: 'Reference',
            },
            {
                title: 'Unicode Lookup',
                description:
                    'Search Unicode characters by name, codepoint, and copy in various formats',
                icon: <Languages className="size-5 shrink-0" />,
                url: '/unicode',
                category: 'Reference',
            },
            {
                title: 'Unit Converter',
                description: 'Data sizes, time durations, and time zones',
                icon: <ArrowLeftRight className="size-5 shrink-0" />,
                url: '/unit',
                category: 'Utilities',
            },
            {
                title: 'URL Shortener',
                description: 'Shorten long URLs into compact links',
                icon: <Link2 className="size-5 shrink-0" />,
                url: '/url-shortener',
                category: 'Utilities',
            },
        ],
    },
    {
        title: 'Share Text',
        url: '/share/text',
    },
    {
        title: 'Resources',
        url: '#',
        items: [
            {
                title: 'Documentation',
                description: 'Guides and API references',
                icon: <Book className="size-5 shrink-0" />,
                url: '/docs',
            },
        ],
    },
];

export const authButtons = {
    login: { title: 'Login', url: '/login' },
    signup: { title: 'Sign up', url: '/signup' },
};

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Formatters & Converters': <Braces className="size-3.5" />,
    Generators: <Hash className="size-3.5" />,
    'Network & API': <Network className="size-3.5" />,
    Reference: <Book className="size-3.5" />,
    Utilities: <Wrench className="size-3.5" />,
};
