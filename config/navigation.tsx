import {
    Book,
    FileJson,
    FileText,
    FileCode,
    Share2,
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
} from 'lucide-react';

export interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}

export const navigationMenu: MenuItem[] = [
    {
        title: 'Tools',
        url: '#',
        items: [
            {
                title: 'JSON Tools',
                description: 'Validate, format, and transform JSON data',
                icon: <FileJson className="size-5 shrink-0" />,
                url: '/json',
            },
            {
                title: 'Text Tools',
                description: 'Process and manipulate text',
                icon: <FileText className="size-5 shrink-0" />,
                url: '/text',
            },
            {
                title: 'Base64 Tools',
                description: 'Encode and decode Base64 data',
                icon: <FileCode className="size-5 shrink-0" />,
                url: '/base64',
            },
            {
                title: 'Hash Generator',
                description: 'Generate hashes and HMAC signatures',
                icon: <Hash className="size-5 shrink-0" />,
                url: '/hash',
            },
            {
                title: 'URL Encode / Decode',
                description: 'Encode and decode percent-encoded URLs',
                icon: <Link className="size-5 shrink-0" />,
                url: '/url-encode',
            },
            {
                title: 'ID Generator',
                description: 'Generate UUIDs (v1/v4/v7) and ULIDs',
                icon: <Fingerprint className="size-5 shrink-0" />,
                url: '/id',
            },
            {
                title: 'Markdown Preview',
                description: 'Write Markdown with live preview',
                icon: <FileText className="size-5 shrink-0" />,
                url: '/markdown',
            },
            {
                title: 'Regex Tester',
                description: 'Test regex with live matching and capture groups',
                icon: <Regex className="size-5 shrink-0" />,
                url: '/regex',
            },
            {
                title: 'Password Generator',
                description: 'Generate secure passwords with strength meter',
                icon: <KeyRound className="size-5 shrink-0" />,
                url: '/password',
            },
            {
                title: 'Color Picker',
                description: 'Convert colors between HEX, RGB, HSL, OKLCH and generate palettes',
                icon: <Pipette className="size-5 shrink-0" />,
                url: '/color',
            },
            {
                title: 'Number Base Converter',
                description: 'Convert numbers between binary, octal, decimal, hex and custom radix',
                icon: <Binary className="size-5 shrink-0" />,
                url: '/number-base',
            },
            {
                title: 'Unit Converter',
                description: 'Convert data sizes, time durations, and time zones',
                icon: <ArrowLeftRight className="size-5 shrink-0" />,
                url: '/unit',
            },
            {
                title: 'HTTP Status Codes',
                description: 'Searchable reference for HTTP status codes with descriptions',
                icon: <Globe className="size-5 shrink-0" />,
                url: '/http-status',
            },
            {
                title: 'MIME Type Reference',
                description: 'Searchable file extension ↔ MIME type mapping',
                icon: <FileText className="size-5 shrink-0" />,
                url: '/mime-type',
            },
            {
                title: 'Git Branch Generator',
                description: 'Generate consistent git branch names',
                icon: <GitBranch className="size-5 shrink-0" />,
                url: '/git-branch-generator',
            },
            {
                title: 'URL Shortener',
                description: 'Shorten long URLs into compact links',
                icon: <Link2 className="size-5 shrink-0" />,
                url: '/url-shortener',
            },
            {
                title: 'QR Code Generator',
                description: 'Generate customizable QR codes',
                icon: <QrCode className="size-5 shrink-0" />,
                url: '/qrcode',
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
