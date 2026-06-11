import { useState, useEffect } from 'react';

export interface RSSFeedData {
    title: string;
    description: string;
    link: string;
    items: RSSItem[];
}

export interface RSSItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    content: string;
}

export function useRssAnalyzer(content: string) {
    const [parsedData, setParsedData] = useState<RSSFeedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!content || content.trim() === '') {
            setParsedData(null);
            setError(null);
            return;
        }

        try {
            // Sanitize XML: replace unescaped ampersands and strip invalid control characters
            const sanitizedContent = content
                .trim()
                .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

            const parser = new DOMParser();
            let xmlDoc = parser.parseFromString(sanitizedContent, 'text/xml');
            let isHtmlFallback = false;
            
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                // Fallback to text/html which is extremely forgiving
                xmlDoc = parser.parseFromString(sanitizedContent, 'text/html');
                isHtmlFallback = true;
            }

            const getText = (el: Element | Document, tags: string[]) => {
                for (const tag of tags) {
                    const node = el.querySelector(tag);
                    if (node && node.textContent) return node.textContent;
                }
                return '';
            };

            const getAttr = (el: Element | Document, tags: string[], attr: string) => {
                for (const tag of tags) {
                    const node = el.querySelector(tag);
                    if (node && node.getAttribute(attr)) return node.getAttribute(attr);
                }
                return '';
            };

            // Check if Atom or RSS
            // In HTML fallback, tag names are lowercased
            const rootTagName = xmlDoc.documentElement.tagName.toLowerCase();
            const isAtom = rootTagName === 'feed' || !!xmlDoc.querySelector('feed');
            
            let feedData: RSSFeedData;

            if (isAtom) {
                const feedNode = isHtmlFallback ? xmlDoc : (xmlDoc.querySelector('feed') || xmlDoc.documentElement);
                const title = getText(feedNode, ['title']) || 'No title';
                const description = getText(feedNode, ['subtitle', 'summary']) || 'No description';
                const link = getAttr(feedNode, ['link'], 'href') || 'No link';
                
                const entries = xmlDoc.querySelectorAll('entry');
                const items: RSSItem[] = Array.from(entries).map((entry) => ({
                    title: getText(entry, ['title']) || 'No title',
                    link: getAttr(entry, ['link'], 'href') || getText(entry, ['link']) || 'No link',
                    pubDate: getText(entry, ['updated', 'published']) || 'No date',
                    description: getText(entry, ['summary', 'description']) || 'No description',
                    content: getText(entry, ['content']) || 'No content',
                }));

                feedData = { title, description, link, items };
            } else {
                const channel = xmlDoc.querySelector('channel');
                if (!channel) {
                    setError('Invalid RSS format: Missing channel element');
                    setParsedData(null);
                    return;
                }

                const title = getText(channel, ['title']) || 'No title';
                const description = getText(channel, ['description']) || 'No description';
                const link = getText(channel, ['link']) || 'No link';

                const itemsNodes = channel.querySelectorAll('item');
                const items: RSSItem[] = Array.from(itemsNodes).map((item) => ({
                    title: getText(item, ['title']) || 'No title',
                    link: getText(item, ['link']) || 'No link',
                    pubDate: getText(item, ['pubDate', 'pubdate', 'date']) || 'No date',
                    description: getText(item, ['description', 'summary']) || 'No description',
                    content: getText(item, ['content\\:encoded', 'encoded', 'content']) || 'No content',
                }));

                feedData = { title, description, link, items };
            }

            setParsedData(feedData);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to parse RSS feed');
            setParsedData(null);
        }
    }, [content]);

    return { parsedData, error };
}
