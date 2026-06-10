'use client';

import { useMemo } from 'react';
import { parseXml } from '../utils/xml-operations';
import { TreeNode } from '../../json/hooks/use-json-tree';

export function useXmlTree(content: string) {
    const tree = useMemo((): TreeNode | null => {
        if (!content) return null;
        try {
            const { parsed } = parseXml(content);
            return buildTree('root', parsed, 0);
        } catch {
            return null;
        }
    }, [content]);

    return { tree };
}

function buildTree(key: string, value: unknown, depth: number): TreeNode {
    if (value === null) return { key, value, type: 'null', depth };
    if (Array.isArray(value)) {
        return {
            key,
            value,
            type: 'array',
            depth,
            children: value.map((item, i) => buildTree(String(i), item, depth + 1)),
        };
    }
    if (typeof value === 'object') {
        return {
            key,
            value,
            type: 'object',
            depth,
            children: Object.entries(value as Record<string, unknown>).map(([k, v]) =>
                buildTree(k, v, depth + 1),
            ),
        };
    }
    return { key, value, type: typeof value, depth };
}
