import type { SEOConfig } from '@/lib/seo/types';

export const siteLinks = {
    name: 'DevTools',
    openSource: 'https://github.com/montasim/devtools',
    website: 'https://devtoolsn.vercel.app',
    feedback: 'montasimmamun@gmail.com',
} as const;

export const seoConfig: SEOConfig = {
    site: {
        siteName: siteLinks.name,
        siteUrl: siteLinks.website,
        titleDefault: 'DevTools - Free Developer Tools That Run in Your Browser',
        description:
            '30+ free developer tools that run instantly in your browser — no installs, no sign-ups, no data leaves your machine. JSON, regex, hashing, API testing, DNS lookup, and more.',
        locale: 'en_US',
        twitterHandle: '@devtools',
        ogImage: '/og-default.png',
        keywords: [
            'developer tools',
            'web developer tools',
            'online developer tools',
            'JSON formatter',
            'Base64 encoder',
            'hash generator',
            'regex tester',
            'free developer tools',
        ],
    },

    pages: {
        home: {
            title: 'DevTools - 30+ Free Developer Tools | No Install Required',
            description:
                'Stop switching tabs. 30+ free tools for JSON, regex, hashing, API testing, encoding, and more — all running in your browser. No installs, no accounts, no data sent anywhere.',
            keywords: [
                'developer tools',
                'online tools',
                'free developer utilities',
                'JSON tools',
                'text tools',
                'web developer tools',
            ],
            path: '/',
            priority: 1.0,
            changeFrequency: 'weekly',
        },

        docs: {
            title: 'Documentation - Master Every Tool in Under 2 Minutes | DevTools',
            description:
                'Learn how to use all 30+ DevTools in seconds. Step-by-step guides for JSON tools, regex tester, API builder, password hasher, DNS lookup, and more.',
            keywords: [
                'devtools documentation',
                'developer tools guide',
                'how to use devtools',
                'JSON tools guide',
            ],
            path: '/docs',
            priority: 0.8,
            changeFrequency: 'weekly',
        },

        json: {
            title: 'JSON Tools - Format, Minify, Diff & Validate JSON Instantly',
            description:
                'Stop wrestling with broken JSON. Format, minify, diff, validate, and export — all in one place. Paste messy JSON and get clean results in seconds. Runs locally in your browser.',
            keywords: [
                'JSON formatter',
                'JSON minifier',
                'JSON diff',
                'JSON validator',
                'JSON viewer',
                'JSON to CSV',
                'JSON to XML',
                'JSON to YAML',
                'JSON schema validator',
                'online JSON tools',
            ],
            path: '/json',
            priority: 0.9,
            changeFrequency: 'monthly',
        },

        text: {
            title: 'Text Tools - Diff, Case Convert & Clean Text in Seconds',
            description:
                'Compare text side-by-side, convert between camelCase/snake_case/kebab-case, and clean messy copy-pasted text — all without leaving your browser.',
            keywords: [
                'text diff',
                'text compare',
                'case converter',
                'camelCase converter',
                'snake_case converter',
                'kebab-case converter',
                'text cleaner',
                'online text tools',
            ],
            path: '/text',
            priority: 0.9,
            changeFrequency: 'monthly',
        },

        base64: {
            title: 'Base64 Encoder & Decoder - Convert Files Instantly',
            description:
                'Drag and drop any file — images, audio, video, PDFs — and get a Base64 string instantly. Or paste Base64 and download the original file. No upload needed.',
            keywords: [
                'base64 encoder',
                'base64 decoder',
                'base64 encode image',
                'base64 decode',
                'image to base64',
                'base64 to image',
                'file to base64',
            ],
            path: '/base64',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        hash: {
            title: 'Hash Generator - Get MD5, SHA-256, SHA-512 All at Once',
            description:
                'Paste any text and instantly get MD5, SHA-1, SHA-256, and SHA-512 hashes — plus HMAC signatures. No terminal needed. Everything runs in your browser.',
            keywords: [
                'hash generator',
                'MD5 hash',
                'SHA-256 hash',
                'SHA-512 hash',
                'SHA-1 hash',
                'HMAC generator',
                'HMAC-SHA256',
                'online hash tool',
            ],
            path: '/hash',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'url-encode': {
            title: 'URL Encoder & Decoder - Fix Mangled URLs in One Click',
            description:
                'Encode or decode URLs instantly. Choose encodeURIComponent to encode everything or encodeURI to keep URL structure intact. Paste and go.',
            keywords: [
                'URL encoder',
                'URL decoder',
                'percent encoding',
                'encode URL',
                'decode URL',
                'encodeURIComponent',
                'URL encode online',
            ],
            path: '/url-encode',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        id: {
            title: 'ID Generator - UUID (v1-v8), ULID & NanoID Generator with Validation',
            description:
                'Generate UUIDs (v1 through v8), ULIDs, and NanoIDs with validation. Batch generate up to 100 IDs at once. No server calls — everything runs in your browser.',
            keywords: [
                'UUID generator',
                'ULID generator',
                'NanoID generator',
                'UUID v4',
                'UUID v7',
                'UUID validator',
                'ULID validator',
                'NanoID validator',
                'unique ID generator',
                'online UUID',
                'nanoid online',
            ],
            path: '/id',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        markdown: {
            title: 'Markdown Preview - Live Markdown Editor & Renderer',
            description:
                'Write Markdown and see rendered HTML in real-time. Word count, line count, and one-click HTML copy. No save needed — everything auto-saves locally.',
            keywords: [
                'markdown preview',
                'markdown editor',
                'markdown renderer',
                'live markdown',
                'markdown to HTML',
                'online markdown editor',
            ],
            path: '/markdown',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        regex: {
            title: 'Regex Tester - Test Regex Live with Match Highlighting',
            description:
                'Stop guessing if your regex works. Test patterns with live match highlighting, numbered and named capture groups, and toggleable flags. See matches as you type.',
            keywords: [
                'regex tester',
                'regular expression tester',
                'regex matcher',
                'regex online',
                'regex capture groups',
                'test regex',
                'regex flags',
            ],
            path: '/regex',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        password: {
            title: 'Password Generator - Secure Random Passwords with Strength Meter',
            description:
                'Create strong passwords with real-time strength analysis and entropy scoring. Pick from 5 alternatives, customize length and character sets. No data sent anywhere.',
            keywords: [
                'password generator',
                'secure password',
                'random password',
                'password strength',
                'password strength meter',
                'strong password generator',
            ],
            path: '/password',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        color: {
            title: 'Color Picker - HEX, RGB, HSL, OKLCH Converter & Palette Generator',
            description:
                'Pick colors and convert between HEX, RGB, HSL, and OKLCH. Generate professional palettes — complementary, analogous, triadic, and more. One-click copy for every format.',
            keywords: [
                'color picker',
                'HEX to RGB',
                'RGB to HSL',
                'OKLCH converter',
                'color palette generator',
                'color converter',
                'complementary colors',
            ],
            path: '/color',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'number-base': {
            title: 'Number Base Converter - Binary, Octal, Decimal, Hex & Custom Radix',
            description:
                'Convert between binary, octal, decimal, hex, and any base 2-36 — all shown at once. Configurable 8/16/32/64-bit width with signed/unsigned modes.',
            keywords: [
                'number base converter',
                'binary converter',
                'hex converter',
                'decimal to binary',
                'binary to hex',
                'radix converter',
                'base converter',
            ],
            path: '/number-base',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        unit: {
            title: 'Unit Converter - Data Size, Time Duration & Timezone Converter',
            description:
                'Convert data sizes (bytes to petabytes), time durations (nanoseconds to years), and timezones with a world clock. All conversions shown at once.',
            keywords: [
                'unit converter',
                'data size converter',
                'bytes to GB',
                'time converter',
                'timezone converter',
                'world clock',
                'duration converter',
            ],
            path: '/unit',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        'http-status': {
            title: 'HTTP Status Codes Reference - Searchable List with Descriptions',
            description:
                'Every HTTP status code explained in plain English. Search by code or phrase, filter by 1xx-5xx categories, with RFC spec references and real-world explanations.',
            keywords: [
                'HTTP status codes',
                'HTTP 404',
                'HTTP 200',
                'HTTP status reference',
                'HTTP response codes',
                'status code lookup',
            ],
            path: '/http-status',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        'mime-type': {
            title: 'MIME Type Reference - File Extension & MIME Type Mapping',
            description:
                'Stop Googling MIME types. Search by file extension or type, filter by category (application, audio, font, image, text, video), and copy in one click.',
            keywords: [
                'MIME type',
                'MIME type reference',
                'file extension MIME',
                'content type',
                'media type',
                'MIME type lookup',
            ],
            path: '/mime-type',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        'css-unit': {
            title: 'CSS Unit Converter - px, rem, em, vw, vh & More',
            description:
                'Stop guessing rem-to-px conversions. Convert between px, rem, em, vw, vh, pt, cm and more — with your actual root font size and viewport dimensions.',
            keywords: [
                'CSS unit converter',
                'px to rem',
                'rem to px',
                'px to em',
                'CSS converter',
                'pixel to rem',
                'viewport unit converter',
            ],
            path: '/css-unit',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        qrcode: {
            title: 'QR Code Generator - Create Custom QR Codes Online',
            description:
                'Create custom QR codes with your colors, size, and error correction level. Download as PNG or copy to clipboard. Your QR code, your style.',
            keywords: [
                'QR code generator',
                'create QR code',
                'QR code maker',
                'free QR code',
                'QR code online',
                'custom QR code',
            ],
            path: '/qrcode',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        'user-agent': {
            title: 'User Agent Analyzer - Parse & Decode User-Agent Strings',
            description:
                'Paste any User-Agent string and get browser, OS, device type, and bot detection instantly. Debug responsive layouts and analytics with clear breakdowns.',
            keywords: [
                'user agent analyzer',
                'user agent parser',
                'UA parser',
                'browser detection',
                'device detection',
                'bot detection',
                'user agent decoder',
                'UA string',
            ],
            path: '/user-agent',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        'api-builder': {
            title: 'API Request Builder - Test APIs Without Installing Postman',
            description:
                'Build, test, and debug HTTP requests right in your browser. Set method, headers, body, and auth — then see the response with status, timing, and size.',
            keywords: [
                'API request builder',
                'HTTP client',
                'Postman alternative',
                'API tester',
                'REST client',
                'API debugging',
                'HTTP request tester',
                'online API tool',
            ],
            path: '/api-builder',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        curl: {
            title: 'cURL Converter - Paste cURL, Get Fetch/Axios/Python Code',
            description:
                'Copy a cURL command from your terminal and get ready-to-use code for fetch, Axios, Python requests, and HTTPie — headers, body, and auth included.',
            keywords: [
                'cURL converter',
                'cURL to fetch',
                'cURL to axios',
                'cURL to Python',
                'cURL to HTTPie',
                'convert cURL command',
                'cURL code generator',
            ],
            path: '/curl',
            priority: 0.9,
            changeFrequency: 'monthly',
        },

        websocket: {
            title: 'WebSocket Tester - Connect, Send & Receive Messages in Real-Time',
            description:
                'Debug WebSocket connections without writing client code. Connect to any ws:// or wss:// endpoint, send messages, and see responses flow in real-time.',
            keywords: [
                'WebSocket tester',
                'WebSocket client',
                'WebSocket debug',
                'test WebSocket',
                'WebSocket online',
                'ws tester',
                'WebSocket inspector',
            ],
            path: '/websocket',
            priority: 0.9,
            changeFrequency: 'monthly',
        },

        cors: {
            title: 'CORS Checker - Fix CORS Errors in Minutes, Not Hours',
            description:
                'See exactly which CORS headers are present or missing. Get a clear Enabled/Failed status, response time, and a copyable report for your backend team.',
            keywords: [
                'CORS checker',
                'CORS tester',
                'cross-origin test',
                'CORS headers',
                'Access-Control-Allow-Origin',
                'CORS debug',
                'CORS inspector',
                'test CORS policy',
            ],
            path: '/cors',
            priority: 0.9,
            changeFrequency: 'monthly',
        },

        'html-entity': {
            title: 'HTML Entity Encoder / Decoder - Encode & Decode HTML Entities',
            description:
                'Make special characters HTML-safe or turn entities back into readable text. Supports named, decimal, and hex entities. Paste and get results instantly.',
            keywords: [
                'HTML entity encoder',
                'HTML entity decoder',
                'HTML entities',
                'encode HTML',
                'decode HTML entities',
                'HTML special characters',
                'ampersand encode',
                'HTML escape',
                'HTML unescape',
            ],
            path: '/html-entity',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        unicode: {
            title: 'Unicode Character Lookup - Search Unicode by Name, Codepoint & Character',
            description:
                'Find any Unicode character by name, codepoint, or block. Copy in HTML, CSS, JavaScript, and UTF-8 formats with one click. Browse 150+ common characters by category.',
            keywords: [
                'Unicode lookup',
                'Unicode search',
                'Unicode character',
                'codepoint lookup',
                'Unicode table',
                'character search',
                'Unicode reference',
                'U+ codepoint',
            ],
            path: '/unicode',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'ascii-table': {
            title: 'ASCII Table - Interactive ASCII/Unicode Reference with Search & Copy',
            description:
                'The ASCII reference you keep coming back to. Search 256 characters by decimal, hex, binary, or name. Copy any format — decimal, hex, binary, HTML entity, escape sequence, or octal.',
            keywords: [
                'ASCII table',
                'ASCII chart',
                'ASCII codes',
                'ASCII reference',
                'ASCII character table',
                'extended ASCII',
                'ASCII lookup',
                'ASCII search',
            ],
            path: '/ascii-table',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'password-hash': {
            title: 'Bcrypt & Argon2 Password Hasher - Hash and Verify Passwords Online',
            description:
                'Hash passwords with bcrypt or Argon2 — the same algorithms trusted by production auth systems. Verify existing hashes to debug login flows. All processing stays in your browser.',
            keywords: [
                'bcrypt hash',
                'argon2 hash',
                'password hasher',
                'password hash online',
                'bcrypt generator',
                'argon2 generator',
                'password verify',
                'bcrypt verify',
                'argon2 verify',
                'password hashing tool',
            ],
            path: '/password-hash',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'rsa-key': {
            title: 'RSA Key Generator - Generate Keys Without OpenSSL Commands',
            description:
                'Generate 2048 or 4096-bit RSA key pairs with PEM or DER output. Get SHA-256 fingerprint and one-click copy — no terminal required. All generation happens locally.',
            keywords: [
                'RSA key generator',
                'RSA key pair',
                'generate RSA key',
                'PEM key',
                'DER key',
                'RSA 2048',
                'RSA 4096',
                'public key generator',
                'private key generator',
            ],
            path: '/rsa-key',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'cert-decoder': {
            title: 'SSL/TLS Certificate Decoder - Inspect X.509 Certificate Fields',
            description:
                'Paste a PEM certificate and decode it — no OpenSSL needed. See validity, subject, issuer, extensions, and fingerprints at a glance. Every field is copyable.',
            keywords: [
                'certificate decoder',
                'SSL certificate decoder',
                'X.509 decoder',
                'TLS certificate inspector',
                'PEM certificate parser',
                'certificate viewer',
                'SSL checker',
                'decode certificate online',
            ],
            path: '/cert-decoder',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        cron: {
            title: 'CRON Builder - Build Cron Expressions Without Memorizing Syntax',
            description:
                'Build cron schedules visually and see a plain-English description in real-time. Preview the next 6 execution times before you deploy. Includes common presets.',
            keywords: [
                'cron expression builder',
                'cron generator',
                'cron schedule',
                'crontab generator',
                'cron next run',
                'cron expression validator',
                'cron visual builder',
                'schedule expression',
            ],
            path: '/cron',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        nslookup: {
            title: 'DNS Lookup - Check DNS Records Without Opening a Terminal',
            description:
                'Query A, AAAA, MX, TXT, CNAME, NS, SOA, and PTR records for any domain. Results appear instantly with copy-per-row and JSON export.',
            keywords: [
                'DNS lookup',
                'NS lookup',
                'DNS records',
                'nameserver lookup',
                'DNS query',
                'DNS checker',
                'A record lookup',
                'MX record lookup',
                'TXT record lookup',
                'online DNS tool',
            ],
            path: '/nslookup',
            priority: 0.8,
            changeFrequency: 'monthly',
        },

        'git-branch-generator': {
            title: 'Git Branch Name Generator - Consistent Branch Naming',
            description:
                'Never waste time deciding on a branch name again. Pick issue type, add ID and description — get a clean type/issue-id/description branch name instantly.',
            keywords: [
                'git branch generator',
                'git branch naming',
                'branch name generator',
                'git naming convention',
                'feature branch name',
            ],
            path: '/git-branch-generator',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        'url-shortener': {
            title: 'URL Shortener - Shorten Long URLs into Compact Links',
            description:
                'Turn long, ugly URLs into short links you can actually share. Click tracking, full history, and one-click copy. Sign up to save your shortened URLs.',
            keywords: [
                'URL shortener',
                'shorten URL',
                'link shortener',
                'URL shortener online',
                'short link generator',
            ],
            path: '/url-shortener',
            priority: 0.7,
            changeFrequency: 'monthly',
        },

        privacy: {
            title: 'Privacy Policy - DevTools',
            description:
                "We don't just respect your privacy — we designed DevTools so your data never leaves your browser. Read our full privacy policy.",
            keywords: ['privacy policy', 'devtools privacy'],
            path: '/privacy',
            priority: 0.3,
            changeFrequency: 'yearly',
        },

        terms: {
            title: 'Terms of Service - DevTools',
            description:
                'Straightforward rules for using our free tools — written for humans, not lawyers.',
            keywords: ['terms of service', 'devtools terms'],
            path: '/terms',
            priority: 0.3,
            changeFrequency: 'yearly',
        },

        cookies: {
            title: 'Cookie Policy - DevTools',
            description:
                'A no-surprises look at the few cookies we use and why. Zero advertising cookies, zero cross-site tracking.',
            keywords: ['cookie policy', 'devtools cookies'],
            path: '/cookies',
            priority: 0.3,
            changeFrequency: 'yearly',
        },

        disclaimer: {
            title: 'Disclaimer - DevTools',
            description:
                'What you should know before relying on these free tools for important work. Built with care — but always verify before you ship.',
            keywords: ['disclaimer', 'devtools disclaimer'],
            path: '/disclaimer',
            priority: 0.3,
            changeFrequency: 'yearly',
        },
    },

    disallowedPaths: [
        '/api/',
        '/s/',
        '/share/',
        '/login',
        '/signup',
        '/profile',
        '/reset-password',
    ],
};
