import { toast } from 'sonner';

export interface SavedItem {
    id: string;
    name: string;
    tool: string;
    content: string;
    createdAt: number;
}

/**
 * Saves text content to database with metadata
 * @param toolName - Name of the tool (e.g., "Text Diff", "Text Convert")
 * @param content - The text content to save
 * @param customName - Optional custom name for the saved item
 */
export async function saveTextContent(
    toolName: string,
    content: string,
    customName?: string,
): Promise<boolean> {
    if (!content) {
        toast.error('No content to save. Please enter some text first.');
        return false;
    }

    try {
        // Map tool name to tab name
        const toolToTabMap: Record<string, string> = {
            'Text Diff': 'diff',
            'Text Convert': 'convert',
            'Text Clean': 'clean',
        };

        const tabName = toolToTabMap[toolName];
        if (!tabName) {
            toast.error('Unknown tool name');
            return false;
        }

        // Prepare the content state
        const contentState = {
            leftContent: content,
        };

        const response = await fetch('/api/saved/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pageName: 'text',
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
