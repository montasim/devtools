import { toast } from 'sonner';

const SAVED_ITEMS_KEY = 'text-saved-items';

export interface SavedItem {
    id: string;
    name: string;
    tool: string;
    content: string;
    createdAt: number;
}

/**
 * Saves text content to localStorage with metadata
 * @param toolName - Name of the tool (e.g., "Text Diff", "Text Convert")
 * @param content - The text content to save
 * @param customName - Optional custom name for the saved item
 */
export function saveTextContent(toolName: string, content: string, customName?: string) {
    if (!content) {
        toast.error('No content to save. Please enter some text first.');
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
