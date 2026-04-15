/**
 * Get initial content with priority: shared data > localStorage > empty
 * @param sharedInput - The shared input data from sharedData?.state?.input
 * @param storageKey - The localStorage key to use as fallback
 * @returns The initial content string
 */
export function getInitialContent(sharedInput: string | undefined, storageKey: string): string {
    // Priority 1: Shared content
    if (sharedInput) {
        return sharedInput;
    }

    // Priority 2: LocalStorage
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved && saved.trim()) {
            return saved;
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
    }

    // Priority 3: Empty string
    return '';
}

/**
 * Get initial left and right content for diff tabs
 * @param sharedInput - The shared input data from sharedData?.state?.input
 * @param sharedRightContent - The shared right content from sharedData?.state?.rightContent
 * @param leftStorageKey - The localStorage key for left content
 * @param rightStorageKey - The localStorage key for right content
 * @returns Object with left and right content
 */
export function getInitialDiffContent(
    sharedInput: string | undefined,
    sharedRightContent: string | undefined,
    leftStorageKey: string,
    rightStorageKey: string,
): { leftContent: string; rightContent: string } {
    return {
        leftContent: getInitialContent(sharedInput, leftStorageKey),
        rightContent: getInitialContent(sharedRightContent, rightStorageKey),
    };
}
