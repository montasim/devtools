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
                description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
                icon: <Hash className="size-5 shrink-0" />,
                url: '/hash',
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
