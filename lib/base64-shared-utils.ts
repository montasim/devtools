'use client';

import { toast } from 'sonner';
import type { SharedItem } from '@/app/base64/tabs/base64-shared-tab';

const SHARED_ITEMS_KEY = 'base64-shared-items';

/**
 * Save a shared item to localStorage
 * @param shareId - The share ID from the API response
 * @param url - The full shareable URL
 * @param title - The title of the share
 * @param comment - Optional comment
 * @param tab - The tab name (e.g., 'Media to Base64', 'Base64 to Media')
 * @param content - The base64 content being shared
 * @param expiration - Optional expiration time in hours
 */
export function saveBase64SharedItem(
    shareId: string,
    url: string,
    title: string,
    tab: string,
    content: string,
    comment?: string,
    expiration?: number,
): boolean {
    try {
        const existingItems = localStorage.getItem(SHARED_ITEMS_KEY);
        const items: SharedItem[] = existingItems ? JSON.parse(existingItems) : [];

        // Calculate expiration timestamp if provided
        let expiresAt: number | undefined;
        if (expiration) {
            expiresAt = Date.now() + expiration * 60 * 60 * 1000;
        }

        const newItem: SharedItem = {
            id: Date.now().toString(),
            shareId,
            url,
            title,
            comment,
            tab,
            content,
            createdAt: Date.now(),
            expiresAt,
        };

        items.push(newItem);
        localStorage.setItem(SHARED_ITEMS_KEY, JSON.stringify(items));

        return true;
    } catch (error) {
        console.error('Failed to save shared item:', error);
        toast.error('Failed to save shared item');
        return false;
    }
}

/**
 * Update the content of an existing shared item
 * @param shareId - The share ID to update
 * @param newContent - The new content
 */
export function updateBase64SharedItem(shareId: string, newContent: string): boolean {
    try {
        const existingItems = localStorage.getItem(SHARED_ITEMS_KEY);
        if (!existingItems) return false;

        const items: SharedItem[] = JSON.parse(existingItems);
        const index = items.findIndex((item) => item.shareId === shareId);

        if (index === -1) return false;

        items[index].content = newContent;
        localStorage.setItem(SHARED_ITEMS_KEY, JSON.stringify(items));

        return true;
    } catch (error) {
        console.error('Failed to update shared item:', error);
        toast.error('Failed to update shared item');
        return false;
    }
}

/**
 * Get all shared items
 */
export function getBase64SharedItems(): SharedItem[] {
    try {
        const existingItems = localStorage.getItem(SHARED_ITEMS_KEY);
        if (!existingItems) return [];

        return JSON.parse(existingItems);
    } catch (error) {
        console.error('Failed to get shared items:', error);
        return [];
    }
}

/**
 * Delete a shared item
 * @param id - The internal ID of the shared item
 */
export function deleteBase64SharedItem(id: string): boolean {
    try {
        const existingItems = localStorage.getItem(SHARED_ITEMS_KEY);
        if (!existingItems) return false;

        const items: SharedItem[] = JSON.parse(existingItems);
        const filtered = items.filter((item) => item.id !== id);

        localStorage.setItem(SHARED_ITEMS_KEY, JSON.stringify(filtered));

        return true;
    } catch (error) {
        console.error('Failed to delete shared item:', error);
        toast.error('Failed to delete shared item');
        return false;
    }
}
