import { toast } from 'sonner';

export interface SavedItem {
    id: string;
    name: string;
    tool: string;
    content: string;
    createdAt: number;
}

/**
 * Saves base64 content to database with metadata
 * @param toolName - Name of the tool (e.g., "Media to Base64", "Base64 to Media")
 * @param content - The base64 content to save
 * @param customName - Optional custom name for the saved item
 */
export async function saveBase64Content(
    toolName: string,
    content: string,
    customName?: string,
): Promise<boolean> {
    if (!content) {
        toast.error('No content to save. Please generate or enter some base64 content first.');
        return false;
    }

    try {
        // Map tool name to tab name
        const toolToTabMap: Record<string, string> = {
            'Media to Base64': 'media-to-base64',
            'Base64 to Media': 'base64-to-media',
        };

        const tabName = toolToTabMap[toolName];
        if (!tabName) {
            toast.error('Unknown tool name');
            return false;
        }

        // Prepare the content state
        const contentState = {
            rightContent: content,
        };

        const response = await fetch('/api/saved/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pageName: 'base64',
                tabName: tabName,
                name: customName || `${toolName} - ${new Date().toLocaleString()}`,
                content: contentState,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.error === 'UNAUTHORIZED') {
                toast.error('You must be logged in to save items');
                return false;
            }
            throw new Error(error.message || 'Failed to save');
        }

        toast.success('Saved successfully!');
        return true;
    } catch (error) {
        console.error('Failed to save:', error);
        toast.error('Failed to save content');
        return false;
    }
}
