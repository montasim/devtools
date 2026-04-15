import { toast } from 'sonner';

const SAVED_ITEMS_KEY = 'json-saved-items';

export interface SavedItem {
    id: string;
    name: string;
    tool: string;
    content: string;
    createdAt: number;
}

/**
 * Saves JSON content to localStorage with metadata
 * @param toolName - Name of the tool (e.g., "JSON Format", "JSON Diff")
 * @param content - The JSON content to save
 * @param customName - Optional custom name for the saved item
 */
export function saveJsonContent(toolName: string, content: string, customName?: string) {
    if (!content) {
        toast.error('No content to save. Please enter some JSON first.');
        return false;
    }

    try {
        const savedItems = JSON.parse(localStorage.getItem(SAVED_ITEMS_KEY) || '[]') as SavedItem[];
        const newItem: SavedItem = {
            id: Date.now().toString(),
            name: customName || `${toolName} - ${new Date().toLocaleString()}`,
            tool: toolName,
            content: content,
            createdAt: Date.now(),
        };
        savedItems.push(newItem);
        localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
        toast.success('Saved successfully!');
        return true;
    } catch (error) {
        console.error('Failed to save:', error);
        toast.error('Failed to save content');
        return false;
    }
}
