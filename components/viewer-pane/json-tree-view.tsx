'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TreeNode } from '@/components/viewer-pane/types';

interface JsonTreeViewProps {
    nodes: TreeNode[];
    showTypes?: boolean;
    showPaths?: boolean;
    level?: number;
    height?: string;
}

export function JsonTreeView({
    nodes,
    showTypes = false,
    showPaths = false,
    level = 0,
    height = '400px',
}: JsonTreeViewProps) {
    return (
        <div className="font-mono text-sm" style={{ height }}>
            {nodes.map((node, index) => (
                <TreeNodeComponent
                    key={`${node.path}-${index}`}
                    node={node}
                    showTypes={showTypes}
                    showPaths={showPaths}
                    level={level}
                />
            ))}
        </div>
    );
}

interface TreeNodeComponentProps {
    node: TreeNode;
    showTypes: boolean;
    showPaths: boolean;
    level: number;
}

function TreeNodeComponent({ node, showTypes, showPaths, level }: TreeNodeComponentProps) {
    const [isExpanded, setIsExpanded] = useState(node.isExpanded ?? true);
    const [copied, setCopied] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    const handleCopy = async (value: unknown) => {
        try {
            const textToCopy = typeof value === 'string' ? value : JSON.stringify(value);
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy to clipboard');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'string':
                return 'text-red-600 dark:text-red-400';
            case 'number':
                return 'text-green-600 dark:text-green-400';
            case 'boolean':
                return 'text-blue-600 dark:text-blue-400';
            case 'null':
                return 'text-gray-500 dark:text-gray-400';
            case 'object':
            case 'array':
                return 'text-purple-600 dark:text-purple-400';
            default:
                return 'text-gray-700 dark:text-gray-300';
        }
    };

    const formatValue = () => {
        if (node.type === 'object' || node.type === 'array') {
            return node.value;
        }

        if (node.type === 'string') {
            return `"${node.value}"`;
        }

        return String(node.value);
    };

    return (
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
            <div
                className="flex items-center gap-1 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded group"
                style={{ paddingLeft: `${level * 16}px` }}
            >
                {/* Expand/Collapse Button */}
                {hasChildren ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronRight className="h-3 w-3" />
                        )}
                    </button>
                ) : (
                    <span className="w-5 h-5 shrink-0" />
                )}

                {/* Key */}
                {node.path !== '$' && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{node.key}</span>
                )}

                {/* Colon for object properties */}
                {node.path !== '$' && node.path.match(/\.\w+$/) && (
                    <span className="text-gray-500">:</span>
                )}

                {/* Array index */}
                {node.path.match(/\[\d+\]$/) && <span className="text-gray-500">:</span>}

                {/* Value */}
                <span className={getTypeColor(node.type)}>{formatValue()}</span>

                {/* Type Badge */}
                {showTypes && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {node.type}
                    </span>
                )}

                {/* Path Badge */}
                {showPaths && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-mono">
                        {node.path}
                    </span>
                )}

                {/* Copy Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => handleCopy(node.value)}
                            className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-green-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy value</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div>
                    {node.children!.map((child, index) => (
                        <TreeNodeComponent
                            key={`${child.path}-${index}`}
                            node={child}
                            showTypes={showTypes}
                            showPaths={showPaths}
                            level={0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
