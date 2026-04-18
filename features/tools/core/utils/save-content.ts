import { apiClient } from '@/lib/api/client';

const TOOL_TAB_MAP: Record<string, Record<string, string>> = {
    json: {
        'JSON Diff': 'diff',
        'JSON Format': 'format',
        'JSON Minify': 'minify',
        'JSON Viewer': 'viewer',
        'JSON Parser': 'parser',
        'JSON Export': 'export',
        'JSON Schema': 'schema',
    },
    text: {
        'Text Diff': 'diff',
        'Text Convert': 'convert',
        'Text Clean': 'clean',
    },
    base64: {
        'Media to Base64': 'media-to-base64',
        'Base64 to Media': 'base64-to-media',
    },
};

export async function saveToolContent(
    pageName: string,
    toolName: string,
    content: string,
    customName?: string,
): Promise<boolean> {
    const toolMap = TOOL_TAB_MAP[pageName];
    if (!toolMap) return false;

    const tabName = toolMap[toolName];
    if (!tabName) return false;

    const name = customName || `${toolName} - ${new Date().toLocaleDateString()}`;

    const response = await apiClient.post('/api/saved', {
        pageName,
        tabName,
        name,
        content: { content },
    });

    return response.ok;
}
