import type { SEOConfig } from '@/lib/seo/types';

export const seoConfig: SEOConfig = {
    site: {
        siteName: 'DevTools',
        siteUrl: 'https://devtools.dev',
        titleDefault: 'DevTools - Developer Utilities',
        description:
            'A comprehensive suite of 20+ free developer tools — JSON, Text, Base64, Hash, Regex, Markdown, Color Picker, QR Code, Unit Converter, User Agent Analyzer, API Builder, and more. All tools run locally in your browser.',
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
            title: 'DevTools - Free Online Developer Utilities',
            description:
                '20+ free developer tools for JSON, Text, Base64, Hash, URL Encoding, ID Generation, Markdown, Regex, Password, Color, Unit Conversion, User Agent Analysis, and more. All client-side, no data leaves your browser.',
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
            title: 'Documentation - DevTools',
            description:
                'Complete documentation for all DevTools utilities. Learn how to use JSON Tools, Text Tools, Base64 Tools, Hash Generator, Regex Tester, and 13+ more developer tools.',
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
            title: 'JSON Tools - Format, Minify, Diff, Validate & Export',
            description:
                'Free online JSON tools: format, minify, diff comparison, tree viewer, parser, schema validation, and export to CSV, XML, YAML. All processing runs locally in your browser.',
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
            title: 'Text Tools - Diff, Case Convert & Clean Text Online',
            description:
                'Free online text tools: compare text differences, convert case (camelCase, snake_case, kebab-case), and clean text (trim, remove duplicates, sort lines).',
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
            title: 'Base64 Encoder & Decoder - Encode/Decode Files Online',
            description:
                'Free online Base64 encoder and decoder. Convert images, audio, video, and files to Base64 strings and back. Supports drag-and-drop with automatic MIME type detection.',
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
            title: 'Hash Generator - MD5, SHA-1, SHA-256, SHA-512 & HMAC',
            description:
                'Free online hash generator. Compute MD5, SHA-1, SHA-256, SHA-512 hashes and HMAC-SHA256, HMAC-SHA1, HMAC-SHA512 signatures instantly. All processing runs in your browser.',
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
            title: 'URL Encoder & Decoder - Encode/Decode Percent-Encoding',
            description:
                'Free online URL encoder and decoder. Encode URLs with encodeURIComponent or encodeURI modes. Decode percent-encoded strings back to plain text.',
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
                'Free online UUID, ULID, and NanoID generator. Generate UUIDs in versions v1, v3, v4, v5, v6, v7, v8, ULIDs, and customizable NanoIDs. Includes validators for each ID type. Batch generation up to 100 IDs.',
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
                'Free online Markdown editor with live HTML preview. Write Markdown and see rendered output in real-time. Shows word count, line count, and supports HTML export.',
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
            title: 'Regex Tester - Test Regular Expressions with Live Matching',
            description:
                'Free online regex tester. Test regular expressions with live match highlighting, capture groups, and flag configuration (g, i, m, s, u). Shows all matches with numbered and named groups.',
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
                'Free online password generator. Create secure random passwords with configurable length (4-128), character sets, and real-time strength analysis with entropy display.',
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
                'Free online color picker and converter. Pick colors in HEX, RGB, HSL, OKLCH formats. Generate harmonious color palettes: analogous, complementary, triadic, split-complementary, tetradic.',
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
                'Free online number base converter. Convert between binary, octal, decimal, hexadecimal, and custom radix (2-36). Supports 8/16/32/64-bit width with signed/unsigned modes.',
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
                'Free online unit converter. Convert data sizes (B to EB), time durations (ns to years) with human-readable output, and timezone conversions with world clock.',
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
                'Complete searchable HTTP status codes reference. Filter by category (1xx-5xx), search by code or phrase, with spec references and detailed descriptions.',
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
                'Searchable MIME type reference table. Map file extensions to MIME types and vice versa. Filter by category: application, audio, font, image, text, video.',
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
                'Free online CSS unit converter. Convert between px, rem, em, vw, vh, vmin, vmax, pt, pc, cm, mm, in, and %. Configurable root font size and viewport dimensions.',
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
                'Free online QR code generator. Create customizable QR codes with configurable size, error correction, foreground and background colors. Download as PNG or copy to clipboard.',
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
                'Free online User-Agent string analyzer. Parse and decode browser, OS, device, and engine information from any User-Agent string. Detect bots, mobile devices, and more.',
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
            title: 'API Request Builder - Test & Debug HTTP Requests Online',
            description:
                'Free online API request builder. Build, test, and debug HTTP requests with support for all methods, headers, query params, request body, and auth. Shareable request configurations.',
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
            title: 'cURL Converter - Convert cURL Commands to fetch, Axios, Python & HTTPie',
            description:
                'Free online cURL converter. Paste cURL commands and instantly convert to JavaScript fetch, Axios, Python requests, and HTTPie. Supports headers, data, auth, and all HTTP methods.',
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
                'Free online WebSocket tester. Connect to WebSocket endpoints, send and receive messages in real-time. Supports wss:// and ws:// protocols with live connection status and message history.',
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
            title: 'CORS Checker - Test Cross-Origin Resource Sharing Headers',
            description:
                'Free online CORS checker. Test if a URL allows cross-origin requests, inspect CORS headers (Access-Control-Allow-Origin, Methods, Headers, Credentials), and debug CORS issues instantly.',
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
                'Free online HTML entity encoder and decoder. Convert special characters to named entities (&amp;, &lt;, &quot;), decimal (&#60;), or hexadecimal (&#x3C;) references. Decode HTML entities back to readable text.',
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
                'Free online Unicode character lookup. Search by name, codepoint (U+0041), character, or block. Copy in HTML decimal, hex, CSS, JavaScript, and UTF-8 formats. Browse 150+ common characters with category filters.',
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

        'password-hash': {
            title: 'Bcrypt & Argon2 Password Hasher - Hash and Verify Passwords Online',
            description:
                'Free online password hasher. Hash passwords with bcrypt (configurable rounds) and Argon2 (id/i/d with custom memory and iterations). Verify existing hashes. All processing runs locally in your browser.',
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
            title: 'RSA Key Generator - Generate RSA Key Pairs Online (PEM / DER)',
            description:
                'Free online RSA key pair generator. Generate 2048, 3072, or 4096-bit RSA keys. Export as PEM or DER (Base64). Includes SHA-256 fingerprint. All key generation happens locally in your browser.',
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
                'Free online SSL/TLS certificate decoder. Paste a PEM-encoded X.509 certificate to inspect subject, issuer, validity, extensions, SAN, fingerprints (SHA-256/SHA-1), and public key details. All parsing runs locally in your browser.',
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

        'git-branch-generator': {
            title: 'Git Branch Name Generator - Consistent Branch Naming',
            description:
                'Generate consistent, well-formatted git branch names instantly. Select issue type, add issue ID, and description. Supports feature, bugfix, hotfix, refactor and more.',
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
                'Free URL shortener. Shorten long URLs into compact, shareable links with click tracking. View history of shortened URLs with analytics.',
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
            description: 'Privacy policy for DevTools — free online developer utilities.',
            keywords: ['privacy policy', 'devtools privacy'],
            path: '/privacy',
            priority: 0.3,
            changeFrequency: 'yearly',
        },

        terms: {
            title: 'Terms of Service - DevTools',
            description: 'Terms of service for DevTools — free online developer utilities.',
            keywords: ['terms of service', 'devtools terms'],
            path: '/terms',
            priority: 0.3,
            changeFrequency: 'yearly',
        },

        cookies: {
            title: 'Cookie Policy - DevTools',
            description: 'Cookie policy for DevTools — free online developer utilities.',
            keywords: ['cookie policy', 'devtools cookies'],
            path: '/cookies',
            priority: 0.3,
            changeFrequency: 'yearly',
        },

        disclaimer: {
            title: 'Disclaimer - DevTools',
            description: 'Disclaimer for DevTools — free online developer utilities.',
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
