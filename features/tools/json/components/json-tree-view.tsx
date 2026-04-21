'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { TreeNode } from '../hooks/use-json-tree';

interface JsonTreeViewProps {
    tree: TreeNode | null;
}

export function JsonTreeView({ tree }: JsonTreeViewProps) {
    if (!tree) return <p className="text-muted-foreground">No JSON to display</p>;
    return <TreeNode node={tree} isRoot />;
}

function TreeNode({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) {
    const [expanded, setExpanded] = useState(node.depth < 2);
    const hasChildren = node.children && node.children.length > 0;

    if (!hasChildren) {
        return (
            <div
                className="flex items-start gap-1 py-0.5 overflow-hidden"
                style={{ paddingLeft: node.depth * 16 }}
            >
                <span className="shrink-0 font-mono text-sm text-blue-600 dark:text-blue-400">
                    {!isRoot && `"${node.key}"`}
                </span>
                {!isRoot && (
                    <span className="shrink-0 font-mono text-sm text-muted-foreground">:</span>
                )}
                <ValueDisplay value={node.value} type={node.type} />
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-start gap-1 py-0.5 hover:bg-accent/50 rounded w-full text-left"
                style={{ paddingLeft: node.depth * 16 }}
            >
                {expanded ? (
                    <ChevronDown className="h-4 w-4 mt-0.5" />
                ) : (
                    <ChevronRight className="h-4 w-4 mt-0.5" />
                )}
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                    {!isRoot && `"${node.key}"`}
                </span>
                {!isRoot && <span className="font-mono text-sm text-muted-foreground">:</span>}
                <span className="font-mono text-sm text-muted-foreground">
                    {node.type === 'array'
                        ? `Array(${node.children!.length})`
                        : `Object{${node.children!.length}}`}
                </span>
            </button>
            {expanded &&
                node.children!.map((child, i) => <TreeNode key={child.key + i} node={child} />)}
        </div>
    );
}

function ValueDisplay({ value, type }: { value: unknown; type: string }) {
    if (value === null)
        return <span className="font-mono text-sm text-orange-600 dark:text-orange-400">null</span>;
    if (type === 'string')
        return (
            <span className="font-mono text-sm text-green-600 dark:text-green-400">
                &quot;{String(value)}&quot;
            </span>
        );
    if (type === 'number')
        return (
            <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                {String(value)}
            </span>
        );
    if (type === 'boolean')
        return (
            <span className="font-mono text-sm text-red-600 dark:text-red-400">
                {String(value)}
            </span>
        );
    return <span className="font-mono text-sm">{String(value)}</span>;
}
