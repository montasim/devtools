import { toast } from 'sonner';

const SAVED_ITEMS_KEY = 'base64-saved-items';

export interface SavedItem {
    id: string;
    name: string;
    tool: string;
    content: string;
    createdAt: number;
}

/**
 * Saves base64 content to localStorage with metadata
 * @param toolName - Name of the tool (e.g., "Media to Base64", "Base64 to Media")
 * @param content - The base64 content to save
 * @param customName - Optional custom name for the saved item
 */
export function saveBase64Content(toolName: string, content: string, customName?: string) {
    if (!content) {
        toast.error('No content to save. Please generate or enter some base64 content first.');
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
