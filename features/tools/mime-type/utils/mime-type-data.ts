export type MimeCategory = 'application' | 'audio' | 'font' | 'image' | 'model' | 'text' | 'video';

export interface MimeEntry {
    mimeType: string;
    extensions: string[];
    category: MimeCategory;
}

export const CATEGORY_META: Record<MimeCategory, { label: string; color: string }> = {
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
    model: {
        label: '3D Model',
        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    },
    text: { label: 'Text', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    video: {
        label: 'Video',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
};

export const MIME_TYPES: MimeEntry[] = [
    // Application
    { mimeType: 'application/atom+xml', extensions: ['.atom'], category: 'application' },
    { mimeType: 'application/csv', extensions: ['.csv'], category: 'application' },
    { mimeType: 'application/epub+zip', extensions: ['.epub'], category: 'application' },
    { mimeType: 'application/gzip', extensions: ['.gz', '.gzip'], category: 'application' },
    { mimeType: 'application/java-archive', extensions: ['.jar'], category: 'application' },
    { mimeType: 'application/javascript', extensions: ['.js', '.mjs'], category: 'application' },
    { mimeType: 'application/json', extensions: ['.json', '.map'], category: 'application' },
    { mimeType: 'application/jsonld', extensions: ['.jsonld'], category: 'application' },
    { mimeType: 'application/ld+json', extensions: ['.jsonld'], category: 'application' },
    { mimeType: 'application/msword', extensions: ['.doc'], category: 'application' },
    {
        mimeType: 'application/octet-stream',
        extensions: ['.bin', '.exe', '.dll', '.so', '.dmg'],
        category: 'application',
    },
    { mimeType: 'application/ogg', extensions: ['.ogx'], category: 'application' },
    { mimeType: 'application/pdf', extensions: ['.pdf'], category: 'application' },
    { mimeType: 'application/php', extensions: ['.php'], category: 'application' },
    { mimeType: 'application/rtf', extensions: ['.rtf'], category: 'application' },
    { mimeType: 'application/tar', extensions: ['.tar'], category: 'application' },
    { mimeType: 'application/typescript', extensions: ['.ts'], category: 'application' },
    { mimeType: 'application/vnd.api+json', extensions: [], category: 'application' },
    { mimeType: 'application/vnd.apple.pkpass', extensions: ['.pkpass'], category: 'application' },
    { mimeType: 'application/vnd.ms-excel', extensions: ['.xls'], category: 'application' },
    { mimeType: 'application/vnd.ms-powerpoint', extensions: ['.ppt'], category: 'application' },
    {
        mimeType: 'application/vnd.oasis.opendocument.presentation',
        extensions: ['.odp'],
        category: 'application',
    },
    {
        mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
        extensions: ['.ods'],
        category: 'application',
    },
    {
        mimeType: 'application/vnd.oasis.opendocument.text',
        extensions: ['.odt'],
        category: 'application',
    },
    {
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extensions: ['.pptx'],
        category: 'application',
    },
    {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extensions: ['.xlsx'],
        category: 'application',
    },
    {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extensions: ['.docx'],
        category: 'application',
    },
    { mimeType: 'application/wasm', extensions: ['.wasm'], category: 'application' },
    { mimeType: 'application/x-7z-compressed', extensions: ['.7z'], category: 'application' },
    { mimeType: 'application/x-bzip', extensions: ['.bz'], category: 'application' },
    { mimeType: 'application/x-bzip2', extensions: ['.bz2'], category: 'application' },
    { mimeType: 'application/x-cdf', extensions: ['.cda'], category: 'application' },
    { mimeType: 'application/x-rar-compressed', extensions: ['.rar'], category: 'application' },
    { mimeType: 'application/x-sh', extensions: ['.sh'], category: 'application' },
    { mimeType: 'application/x-shockwave-flash', extensions: ['.swf'], category: 'application' },
    { mimeType: 'application/x-tar', extensions: ['.tar'], category: 'application' },
    { mimeType: 'application/x-www-form-urlencoded', extensions: [], category: 'application' },
    { mimeType: 'application/x-yaml', extensions: ['.yaml', '.yml'], category: 'application' },
    { mimeType: 'application/xhtml+xml', extensions: ['.xhtml'], category: 'application' },
    { mimeType: 'application/xml', extensions: ['.xml', '.xsl'], category: 'application' },
    { mimeType: 'application/zip', extensions: ['.zip'], category: 'application' },

    // Audio
    { mimeType: 'audio/aac', extensions: ['.aac'], category: 'audio' },
    { mimeType: 'audio/flac', extensions: ['.flac'], category: 'audio' },
    { mimeType: 'audio/midi', extensions: ['.mid', '.midi'], category: 'audio' },
    { mimeType: 'audio/mp4', extensions: ['.m4a'], category: 'audio' },
    { mimeType: 'audio/mpeg', extensions: ['.mp3'], category: 'audio' },
    { mimeType: 'audio/ogg', extensions: ['.oga', '.ogg'], category: 'audio' },
    { mimeType: 'audio/opus', extensions: ['.opus'], category: 'audio' },
    { mimeType: 'audio/wav', extensions: ['.wav'], category: 'audio' },
    { mimeType: 'audio/webm', extensions: ['.weba'], category: 'audio' },

    // Font
    { mimeType: 'font/otf', extensions: ['.otf'], category: 'font' },
    { mimeType: 'font/ttf', extensions: ['.ttf'], category: 'font' },
    { mimeType: 'font/woff', extensions: ['.woff'], category: 'font' },
    { mimeType: 'font/woff2', extensions: ['.woff2'], category: 'font' },

    // Image
    { mimeType: 'image/avif', extensions: ['.avif'], category: 'image' },
    { mimeType: 'image/bmp', extensions: ['.bmp'], category: 'image' },
    { mimeType: 'image/gif', extensions: ['.gif'], category: 'image' },
    { mimeType: 'image/heic', extensions: ['.heic'], category: 'image' },
    { mimeType: 'image/heif', extensions: ['.heif'], category: 'image' },
    { mimeType: 'image/jpeg', extensions: ['.jpg', '.jpeg'], category: 'image' },
    { mimeType: 'image/png', extensions: ['.png'], category: 'image' },
    { mimeType: 'image/svg+xml', extensions: ['.svg'], category: 'image' },
    { mimeType: 'image/tiff', extensions: ['.tif', '.tiff'], category: 'image' },
    { mimeType: 'image/webp', extensions: ['.webp'], category: 'image' },
    { mimeType: 'image/x-icon', extensions: ['.ico'], category: 'image' },

    // Model
    { mimeType: 'model/gltf+json', extensions: ['.gltf'], category: 'model' },
    { mimeType: 'model/gltf-binary', extensions: ['.glb'], category: 'model' },
    { mimeType: 'model/obj', extensions: ['.obj'], category: 'model' },
    { mimeType: 'model/stl', extensions: ['.stl'], category: 'model' },
    { mimeType: 'model/3mf', extensions: ['.3mf'], category: 'model' },

    // Text
    { mimeType: 'text/calendar', extensions: ['.ics'], category: 'text' },
    { mimeType: 'text/css', extensions: ['.css'], category: 'text' },
    { mimeType: 'text/csv', extensions: ['.csv'], category: 'text' },
    { mimeType: 'text/html', extensions: ['.html', '.htm'], category: 'text' },
    { mimeType: 'text/javascript', extensions: ['.js'], category: 'text' },
    { mimeType: 'text/markdown', extensions: ['.md', '.markdown'], category: 'text' },
    {
        mimeType: 'text/plain',
        extensions: ['.txt', '.log', '.conf', '.cfg', '.ini'],
        category: 'text',
    },
    { mimeType: 'text/tab-separated-values', extensions: ['.tsv'], category: 'text' },
    { mimeType: 'text/xml', extensions: ['.xml'], category: 'text' },

    // Video
    { mimeType: 'video/3gpp', extensions: ['.3gp'], category: 'video' },
    { mimeType: 'video/3gpp2', extensions: ['.3g2'], category: 'video' },
    { mimeType: 'video/avi', extensions: ['.avi'], category: 'video' },
    { mimeType: 'video/mp4', extensions: ['.mp4', '.m4v'], category: 'video' },
    { mimeType: 'video/mpeg', extensions: ['.mpeg', '.mpg'], category: 'video' },
    { mimeType: 'video/ogg', extensions: ['.ogv'], category: 'video' },
    { mimeType: 'video/quicktime', extensions: ['.mov'], category: 'video' },
    { mimeType: 'video/webm', extensions: ['.webm'], category: 'video' },
    { mimeType: 'video/x-ms-wmv', extensions: ['.wmv'], category: 'video' },
    { mimeType: 'video/x-flv', extensions: ['.flv'], category: 'video' },
    { mimeType: 'video/x-matroska', extensions: ['.mkv'], category: 'video' },
];

export function searchMimeTypes(query: string): MimeEntry[] {
    if (!query.trim()) return MIME_TYPES;
    const q = query.toLowerCase().trim();
    return MIME_TYPES.filter((entry) => {
        if (entry.mimeType.toLowerCase().includes(q)) return true;
        if (entry.extensions.some((ext) => ext.toLowerCase().includes(q))) return true;
        if (entry.category.includes(q)) return true;
        return false;
    });
}

export function lookupByExtension(ext: string): MimeEntry[] {
    const normalized = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
    return MIME_TYPES.filter((entry) => entry.extensions.includes(normalized));
}
