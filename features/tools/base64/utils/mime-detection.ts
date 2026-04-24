const MIME_SIGNATURES: { hex: string; mime: string; extension: string }[] = [
    { hex: '89504e47', mime: 'image/png', extension: 'png' },
    { hex: 'ffd8ffe0', mime: 'image/jpeg', extension: 'jpg' },
    { hex: 'ffd8ffe1', mime: 'image/jpeg', extension: 'jpg' },
    { hex: 'ffd8ffe2', mime: 'image/jpeg', extension: 'jpg' },
    { hex: 'ffd8ffe3', mime: 'image/jpeg', extension: 'jpg' },
    { hex: '47494638', mime: 'image/gif', extension: 'gif' },
    { hex: '424d', mime: 'image/bmp', extension: 'bmp' },
    { hex: '49492a00', mime: 'image/tiff', extension: 'tiff' },
    { hex: '4d4d002a', mime: 'image/tiff', extension: 'tiff' },
    { hex: '1a45dfa3', mime: 'video/webm', extension: 'webm' },
    { hex: '494433', mime: 'audio/mpeg', extension: 'mp3' },
    { hex: 'fffb', mime: 'audio/mpeg', extension: 'mp3' },
    { hex: 'fff3', mime: 'audio/mpeg', extension: 'mp3' },
    { hex: 'fff2', mime: 'audio/mpeg', extension: 'mp3' },
    { hex: '664c6143', mime: 'audio/flac', extension: 'flac' },
    { hex: '4d546864', mime: 'audio/midi', extension: 'mid' },
    { hex: '25504446', mime: 'application/pdf', extension: 'pdf' },
    { hex: '504b0304', mime: 'application/zip', extension: 'zip' },
    { hex: '52617221', mime: 'application/x-rar-compressed', extension: 'rar' },
    { hex: '377abcaf', mime: 'application/x-7z-compressed', extension: '7z' },
    { hex: '1f8b', mime: 'application/gzip', extension: 'gz' },
];

const RIFF_VARIANTS: Record<string, { mime: string; extension: string }> = {
    '57454250': { mime: 'image/webp', extension: 'webp' },
    '41564920': { mime: 'video/avi', extension: 'avi' },
    '57415645': { mime: 'audio/wav', extension: 'wav' },
};

const MIME_TO_EXTENSION: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/avi': 'avi',
    'video/x-matroska': 'mkv',
    'video/quicktime': 'mov',
    'video/ogg': 'ogv',
    'video/x-msvideo': 'avi',
    'video/x-flv': 'flv',
    'video/x-mng': 'mng',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/flac': 'flac',
    'audio/aac': 'aac',
    'audio/mp4': 'm4a',
    'audio/midi': 'mid',
    'audio/webm': 'weba',
    'audio/x-aiff': 'aiff',
    'audio/pcm': 'pcm',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/gzip': 'gz',
    'application/x-tar': 'tar',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/csv': 'csv',
    'text/xml': 'xml',
};

function extensionFromMime(mime: string): string {
    return MIME_TO_EXTENSION[mime] ?? mime.split('/')[1]?.replace('x-', '') ?? 'bin';
}

export type MediaCategory = 'image' | 'video' | 'audio' | 'pdf' | 'other';

export function getMediaCategory(mime: string): MediaCategory {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime === 'application/pdf') return 'pdf';
    return 'other';
}

export function detectMimeFromBase64(base64: string): { mime: string; extension: string } {
    const dataUrlParts = extractDataUrlParts(base64);
    if (dataUrlParts) {
        return { mime: dataUrlParts.mime, extension: extensionFromMime(dataUrlParts.mime) };
    }

    try {
        const cleanBase64 = base64.trim().replace(/^data:[^;]+;base64,/, '');
        const binaryString = atob(cleanBase64.slice(0, 20));
        const hex = Array.from(binaryString)
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');

        if (hex.startsWith('52494646')) {
            const riffType = hex.slice(16, 24);
            const variant = RIFF_VARIANTS[riffType];
            if (variant) return variant;
        }

        if (hex.slice(8, 16) === '66747970') {
            return { mime: 'video/mp4', extension: 'mp4' };
        }

        for (const sig of MIME_SIGNATURES) {
            if (hex.startsWith(sig.hex)) {
                return { mime: sig.mime, extension: sig.extension };
            }
        }
    } catch {
        // ignore
    }
    return { mime: 'application/octet-stream', extension: 'bin' };
}

export function extractDataUrlParts(dataUrl: string): { mime: string; base64: string } | null {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return { mime: match[1], base64: match[2] };
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function base64ToFile(base64: string, filename: string): File {
    const { mime, base64: cleanBase64 } = extractDataUrlParts(base64) ?? {
        mime: 'application/octet-stream',
        base64: base64.replace(/^data:[^;]+;base64,/, ''),
    };

    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return new File([bytes], filename, { type: mime });
}
