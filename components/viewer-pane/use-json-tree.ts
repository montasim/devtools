import { useMemo } from 'react';
import type { ViewerOptions, TreeNode } from './types';

interface JsonTreeResult {
    tree: TreeNode[];
    isValid: boolean;
    error: Error | null;
}

export function useJsonTree(json: string, options: ViewerOptions): JsonTreeResult {
    return useMemo(() => {
        if (!json || json.trim().length === 0) {
            return {
                tree: [],
                isValid: false,
                error: null,
            };
        }

        try {
            const parsed = JSON.parse(json);
            const tree = buildTree(parsed, '$', options);

            return {
                tree,
                isValid: true,
                error: null,
            };
        } catch (error) {
            return {
                tree: [],
                isValid: false,
                error: error as Error,
            };
        }
    }, [json, options.showTypes, options.showPaths, options.sortKeys]);
}

function buildTree(value: any, path: string, options: ViewerOptions): TreeNode[] {
    if (value === null) {
        return [
            {
                key: path === '$' ? 'root' : path,
                value: null,
                type: 'null',
                path,
                isExpanded: true,
            },
        ];
    }

    if (typeof value === 'boolean') {
        return [
            {
                key: path === '$' ? 'root' : path,
                value,
                type: 'boolean',
                path,
                isExpanded: true,
            },
        ];
    }

    if (typeof value === 'number') {
        return [
            {
                key: path === '$' ? 'root' : path,
                value,
                type: 'number',
                path,
                isExpanded: true,
            },
        ];
    }

    if (typeof value === 'string') {
        return [
            {
                key: path === '$' ? 'root' : path,
                value,
                type: 'string',
                path,
                isExpanded: true,
            },
        ];
    }

    if (Array.isArray(value)) {
        const node: TreeNode = {
            key: path === '$' ? 'root' : path,
            value: `Array(${value.length})`,
            type: 'array',
            path,
            isExpanded: true,
            children: value.map((item, index) => {
                const itemPath = `${path}[${index}]`;
                const childNodes = buildTree(item, itemPath, options);
                return childNodes[0];
            }),
        };
        return [node];
    }

    if (typeof value === 'object') {
        const keys = options.sortKeys ? Object.keys(value).sort() : Object.keys(value);
        const node: TreeNode = {
            key: path === '$' ? 'root' : path,
            value: `Object{${keys.length}}`,
            type: 'object',
            path,
            isExpanded: true,
            children: keys.map((key) => {
                const itemPath = `${path}.${key}`;
                const childNodes = buildTree(value[key], itemPath, options);
                return childNodes[0];
            }),
        };
        return [node];
    }

    return [
        {
            key: path === '$' ? 'root' : path,
            value: String(value),
            type: 'string',
            path,
            isExpanded: true,
        },
    ];
}
