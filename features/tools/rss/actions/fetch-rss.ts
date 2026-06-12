'use server';

export async function fetchRssFeed(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
            next: {
                revalidate: 0
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }

        const data = await response.text();
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}
