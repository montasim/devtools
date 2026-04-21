const MIME_SIGNATURES: Record<string, { signature: string; mime: string; extension: string }> = {
    '89504e47': { signature: '89504e47', mime: 'image/png', extension: 'png' },
    ffd8ffe0: { signature: 'ffd8ffe0', mime: 'image/jpeg', extension: 'jpg' },
    ffd8ffe1: { signature: 'ffd8ffe1', mime: 'image/jpeg', extension: 'jpg' },
    '47494638': { signature: '47494638', mime: 'image/gif', extension: 'gif' },
    '52494646': { signature: '52494646', mime: 'image/webp', extension: 'webp' },
    '504b0304': { signature: '504b0304', mime: 'application/zip', extension: 'zip' },
    '25504446': { signature: '25504446', mime: 'application/pdf', extension: 'pdf' },
    '00000000': { signature: '000000', mime: 'video/mp4', extension: 'mp4' },
};

export function detectMimeFromBase64(base64: string): { mime: string; extension: string } {
    try {
        const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
        const binaryString = atob(cleanBase64.slice(0, 8));
        const hex = Array.from(binaryString)
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('');

        for (const sig of Object.values(MIME_SIGNATURES)) {
            if (hex.startsWith(sig.signature)) {
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
