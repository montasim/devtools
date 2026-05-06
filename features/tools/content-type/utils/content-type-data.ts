export type ContentCategory =
    | 'application'
    | 'audio'
    | 'font'
    | 'image'
    | 'message'
    | 'multipart'
    | 'text'
    | 'video';

export interface ContentTypeEntry {
    contentType: string;
    extensions: string[];
    category: ContentCategory;
    description: string;
    common?: boolean;
}

export const CATEGORY_META: Record<ContentCategory, { label: string; color: string }> = {
    application: {
        label: 'Application',
        color: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    },
    audio: {
        label: 'Audio',
        color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    },
    font: {
        label: 'Font',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    },
    image: {
        label: 'Image',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    },
    message: {
        label: 'Message',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    },
    multipart: {
        label: 'Multipart',
        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    },
    text: {
        label: 'Text',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    video: {
        label: 'Video',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
};

export const CONTENT_TYPES: ContentTypeEntry[] = [
    // ── Application ──────────────────────────────────────────
    {
        contentType: 'application/json',
        extensions: ['.json', '.map'],
        category: 'application',
        description: 'JSON data, the de facto standard for REST APIs',
        common: true,
    },
    {
        contentType: 'application/xml',
        extensions: ['.xml', '.xsl'],
        category: 'application',
        description: 'XML documents, used in SOAP APIs and configs',
        common: true,
    },
    {
        contentType: 'application/x-www-form-urlencoded',
        extensions: [],
        category: 'application',
        description: 'Default HTML form submission encoding',
        common: true,
    },
    {
        contentType: 'application/octet-stream',
        extensions: ['.bin', '.exe', '.dll', '.so'],
        category: 'application',
        description: 'Arbitrary binary data — fallback for unknown types',
        common: true,
    },
    {
        contentType: 'application/pdf',
        extensions: ['.pdf'],
        category: 'application',
        description: 'PDF documents',
        common: true,
    },
    {
        contentType: 'application/javascript',
        extensions: ['.js', '.mjs'],
        category: 'application',
        description: 'JavaScript source code',
        common: true,
    },
    {
        contentType: 'application/typescript',
        extensions: ['.ts'],
        category: 'application',
        description: 'TypeScript source code',
    },
    {
        contentType: 'application/graphql-response+json',
        extensions: [],
        category: 'application',
        description: 'GraphQL response over HTTP',
    },
    {
        contentType: 'application/ld+json',
        extensions: ['.jsonld'],
        category: 'application',
        description: 'JSON-LD linked data format',
    },
    {
        contentType: 'application/vnd.api+json',
        extensions: [],
        category: 'application',
        description: 'JSON:API specification response',
    },
    {
        contentType: 'application/problem+json',
        extensions: [],
        category: 'application',
        description: 'RFC 7807 problem details for HTTP APIs',
    },
    {
        contentType: 'application/geo+json',
        extensions: ['.geojson'],
        category: 'application',
        description: 'GeoJSON geographic data',
    },
    {
        contentType: 'application/wasm',
        extensions: ['.wasm'],
        category: 'application',
        description: 'WebAssembly binary module',
    },
    {
        contentType: 'application/gzip',
        extensions: ['.gz', '.gzip'],
        category: 'application',
        description: 'Gzip compressed archive',
    },
    {
        contentType: 'application/zip',
        extensions: ['.zip'],
        category: 'application',
        description: 'ZIP archive',
    },
    {
        contentType: 'application/x-tar',
        extensions: ['.tar'],
        category: 'application',
        description: 'Tape archive format',
    },
    {
        contentType: 'application/x-7z-compressed',
        extensions: ['.7z'],
        category: 'application',
        description: '7-Zip compressed archive',
    },
    {
        contentType: 'application/x-rar-compressed',
        extensions: ['.rar'],
        category: 'application',
        description: 'RAR compressed archive',
    },
    {
        contentType: 'application/x-bzip2',
        extensions: ['.bz2'],
        category: 'application',
        description: 'Bzip2 compressed archive',
    },
    {
        contentType: 'application/octet-stream',
        extensions: ['.bin'],
        category: 'application',
        description: 'Generic binary data',
    },
    {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extensions: ['.xlsx'],
        category: 'application',
        description: 'Microsoft Excel (OOXML)',
    },
    {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extensions: ['.docx'],
        category: 'application',
        description: 'Microsoft Word (OOXML)',
    },
    {
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extensions: ['.pptx'],
        category: 'application',
        description: 'Microsoft PowerPoint (OOXML)',
    },
    {
        contentType: 'application/vnd.ms-excel',
        extensions: ['.xls'],
        category: 'application',
        description: 'Microsoft Excel (legacy)',
    },
    {
        contentType: 'application/vnd.ms-powerpoint',
        extensions: ['.ppt'],
        category: 'application',
        description: 'Microsoft PowerPoint (legacy)',
    },
    {
        contentType: 'application/msword',
        extensions: ['.doc'],
        category: 'application',
        description: 'Microsoft Word (legacy)',
    },
    {
        contentType: 'application/epub+zip',
        extensions: ['.epub'],
        category: 'application',
        description: 'EPUB electronic publication',
    },
    {
        contentType: 'application/rtf',
        extensions: ['.rtf'],
        category: 'application',
        description: 'Rich Text Format document',
    },
    {
        contentType: 'application/java-archive',
        extensions: ['.jar'],
        category: 'application',
        description: 'Java archive',
    },
    {
        contentType: 'application/x-sh',
        extensions: ['.sh'],
        category: 'application',
        description: 'Shell script',
    },
    {
        contentType: 'application/php',
        extensions: ['.php'],
        category: 'application',
        description: 'PHP source code',
    },
    {
        contentType: 'application/xhtml+xml',
        extensions: ['.xhtml'],
        category: 'application',
        description: 'XHTML document',
    },
    {
        contentType: 'application/atom+xml',
        extensions: ['.atom'],
        category: 'application',
        description: 'Atom syndication feed',
    },
    {
        contentType: 'application/rss+xml',
        extensions: ['.rss'],
        category: 'application',
        description: 'RSS syndication feed',
    },
    {
        contentType: 'application/x-yaml',
        extensions: ['.yaml', '.yml'],
        category: 'application',
        description: 'YAML configuration data',
    },
    {
        contentType: 'application/toml',
        extensions: ['.toml'],
        category: 'application',
        description: 'TOML configuration data',
    },
    {
        contentType: 'application/manifest+json',
        extensions: ['.webmanifest'],
        category: 'application',
        description: 'Web app manifest for PWA',
    },
    {
        contentType: 'application/x-www-form-urlencoded',
        extensions: [],
        category: 'application',
        description: 'URL-encoded form data (key=value&key=value)',
        common: true,
    },
    {
        contentType: 'application/sdp',
        extensions: ['.sdp'],
        category: 'application',
        description: 'Session Description Protocol (WebRTC)',
    },
    {
        contentType: 'application/pem-certificate-chain',
        extensions: ['.pem', '.crt', '.ca-bundle'],
        category: 'application',
        description: 'PEM certificate chain',
    },

    // ── Audio ────────────────────────────────────────────────
    {
        contentType: 'audio/mpeg',
        extensions: ['.mp3'],
        category: 'audio',
        description: 'MP3 audio',
        common: true,
    },
    {
        contentType: 'audio/ogg',
        extensions: ['.oga', '.ogg'],
        category: 'audio',
        description: 'Ogg Vorbis audio',
    },
    {
        contentType: 'audio/wav',
        extensions: ['.wav'],
        category: 'audio',
        description: 'WAVE audio',
    },
    {
        contentType: 'audio/flac',
        extensions: ['.flac'],
        category: 'audio',
        description: 'FLAC lossless audio',
    },
    {
        contentType: 'audio/aac',
        extensions: ['.aac'],
        category: 'audio',
        description: 'AAC audio',
    },
    {
        contentType: 'audio/mp4',
        extensions: ['.m4a'],
        category: 'audio',
        description: 'MP4 audio container',
    },
    {
        contentType: 'audio/webm',
        extensions: ['.weba'],
        category: 'audio',
        description: 'WebM audio',
    },
    {
        contentType: 'audio/opus',
        extensions: ['.opus'],
        category: 'audio',
        description: 'Opus audio codec',
    },
    {
        contentType: 'audio/midi',
        extensions: ['.mid', '.midi'],
        category: 'audio',
        description: 'MIDI musical sequence',
    },

    // ── Font ─────────────────────────────────────────────────
    {
        contentType: 'font/woff2',
        extensions: ['.woff2'],
        category: 'font',
        description: 'WOFF 2.0 web font',
        common: true,
    },
    {
        contentType: 'font/woff',
        extensions: ['.woff'],
        category: 'font',
        description: 'WOFF 1.0 web font',
    },
    {
        contentType: 'font/ttf',
        extensions: ['.ttf'],
        category: 'font',
        description: 'TrueType font',
    },
    {
        contentType: 'font/otf',
        extensions: ['.otf'],
        category: 'font',
        description: 'OpenType font',
    },
    {
        contentType: 'font/collection',
        extensions: ['.ttc'],
        category: 'font',
        description: 'TrueType font collection',
    },

    // ── Image ────────────────────────────────────────────────
    {
        contentType: 'image/jpeg',
        extensions: ['.jpg', '.jpeg'],
        category: 'image',
        description: 'JPEG image',
        common: true,
    },
    {
        contentType: 'image/png',
        extensions: ['.png'],
        category: 'image',
        description: 'PNG image',
        common: true,
    },
    {
        contentType: 'image/gif',
        extensions: ['.gif'],
        category: 'image',
        description: 'GIF image',
        common: true,
    },
    {
        contentType: 'image/webp',
        extensions: ['.webp'],
        category: 'image',
        description: 'WebP image',
        common: true,
    },
    {
        contentType: 'image/svg+xml',
        extensions: ['.svg'],
        category: 'image',
        description: 'Scalable Vector Graphics',
        common: true,
    },
    {
        contentType: 'image/avif',
        extensions: ['.avif'],
        category: 'image',
        description: 'AVIF next-gen image format',
    },
    {
        contentType: 'image/apng',
        extensions: ['.apng'],
        category: 'image',
        description: 'Animated PNG',
    },
    {
        contentType: 'image/bmp',
        extensions: ['.bmp'],
        category: 'image',
        description: 'Bitmap image',
    },
    {
        contentType: 'image/tiff',
        extensions: ['.tif', '.tiff'],
        category: 'image',
        description: 'TIFF image',
    },
    {
        contentType: 'image/heic',
        extensions: ['.heic'],
        category: 'image',
        description: 'HEIC image (Apple)',
    },
    {
        contentType: 'image/heif',
        extensions: ['.heif'],
        category: 'image',
        description: 'HEIF image format',
    },
    {
        contentType: 'image/x-icon',
        extensions: ['.ico'],
        category: 'image',
        description: 'Icon image (favicon)',
    },
    {
        contentType: 'image/jxl',
        extensions: ['.jxl'],
        category: 'image',
        description: 'JPEG XL next-gen image format',
    },

    // ── Message ──────────────────────────────────────────────
    {
        contentType: 'message/http',
        extensions: [],
        category: 'message',
        description: 'Full HTTP message (request or response)',
    },
    {
        contentType: 'message/delivery-status',
        extensions: [],
        category: 'message',
        description: 'Email delivery status notification',
    },

    // ── Multipart ────────────────────────────────────────────
    {
        contentType: 'multipart/form-data',
        extensions: [],
        category: 'multipart',
        description: 'File uploads and mixed form fields',
        common: true,
    },
    {
        contentType: 'multipart/byteranges',
        extensions: [],
        category: 'multipart',
        description: 'Partial response with multiple byte ranges',
    },
    {
        contentType: 'multipart/alternative',
        extensions: [],
        category: 'multipart',
        description: 'Email with HTML and plain-text versions',
    },
    {
        contentType: 'multipart/related',
        extensions: [],
        category: 'multipart',
        description: 'Compound document with linked parts',
    },
    {
        contentType: 'multipart/mixed',
        extensions: [],
        category: 'multipart',
        description: 'Multiple independent parts in one message',
    },

    // ── Text ─────────────────────────────────────────────────
    {
        contentType: 'text/html',
        extensions: ['.html', '.htm'],
        category: 'text',
        description: 'HTML web page',
        common: true,
    },
    {
        contentType: 'text/plain',
        extensions: ['.txt', '.log', '.conf'],
        category: 'text',
        description: 'Plain text',
        common: true,
    },
    {
        contentType: 'text/css',
        extensions: ['.css'],
        category: 'text',
        description: 'CSS stylesheet',
        common: true,
    },
    {
        contentType: 'text/csv',
        extensions: ['.csv'],
        category: 'text',
        description: 'Comma-separated values',
        common: true,
    },
    {
        contentType: 'text/javascript',
        extensions: ['.js'],
        category: 'text',
        description: 'JavaScript (legacy MIME type, still common)',
    },
    {
        contentType: 'text/markdown',
        extensions: ['.md', '.markdown'],
        category: 'text',
        description: 'Markdown text',
    },
    {
        contentType: 'text/xml',
        extensions: ['.xml'],
        category: 'text',
        description: 'XML as human-readable text',
    },
    {
        contentType: 'text/tab-separated-values',
        extensions: ['.tsv'],
        category: 'text',
        description: 'Tab-separated values',
    },
    {
        contentType: 'text/calendar',
        extensions: ['.ics'],
        category: 'text',
        description: 'iCalendar event data',
    },
    {
        contentType: 'text/event-stream',
        extensions: [],
        category: 'text',
        description: 'Server-Sent Events (SSE) stream',
        common: true,
    },
    {
        contentType: 'text/vcard',
        extensions: ['.vcf'],
        category: 'text',
        description: 'vCard contact information',
    },

    // ── Video ────────────────────────────────────────────────
    {
        contentType: 'video/mp4',
        extensions: ['.mp4', '.m4v'],
        category: 'video',
        description: 'MP4 video container',
        common: true,
    },
    {
        contentType: 'video/webm',
        extensions: ['.webm'],
        category: 'video',
        description: 'WebM video',
        common: true,
    },
    {
        contentType: 'video/mpeg',
        extensions: ['.mpeg', '.mpg'],
        category: 'video',
        description: 'MPEG video',
    },
    {
        contentType: 'video/ogg',
        extensions: ['.ogv'],
        category: 'video',
        description: 'Ogg video',
    },
    {
        contentType: 'video/quicktime',
        extensions: ['.mov'],
        category: 'video',
        description: 'QuickTime video (Apple)',
    },
    {
        contentType: 'video/x-ms-wmv',
        extensions: ['.wmv'],
        category: 'video',
        description: 'Windows Media Video',
    },
    {
        contentType: 'video/x-flv',
        extensions: ['.flv'],
        category: 'video',
        description: 'Flash video',
    },
    {
        contentType: 'video/x-matroska',
        extensions: ['.mkv'],
        category: 'video',
        description: 'Matroska video container',
    },
    {
        contentType: 'video/3gpp',
        extensions: ['.3gp'],
        category: 'video',
        description: '3GPP mobile video',
    },
    {
        contentType: 'video/avi',
        extensions: ['.avi'],
        category: 'video',
        description: 'AVI video container',
    },
];

export function searchContentTypes(query: string): ContentTypeEntry[] {
    if (!query.trim()) return CONTENT_TYPES;
    const q = query.toLowerCase().trim();
    return CONTENT_TYPES.filter((entry) => {
        if (entry.contentType.toLowerCase().includes(q)) return true;
        if (entry.extensions.some((ext) => ext.toLowerCase().includes(q))) return true;
        if (entry.description.toLowerCase().includes(q)) return true;
        if (entry.category.includes(q)) return true;
        return false;
    });
}

export function lookupByExtension(ext: string): ContentTypeEntry[] {
    const normalized = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
    return CONTENT_TYPES.filter((entry) => entry.extensions.includes(normalized));
}
