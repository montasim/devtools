'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    BarChart3,
    Copy,
    ChevronDown,
    ChevronUp,
    Hash,
    Layers,
    TreeDeciduous,
    CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ParsedData } from './types';

interface ParserResultsProps {
    parsedData: ParsedData;
    showTypes: boolean;
    showPaths: boolean;
    showStatistics: boolean;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
}

function StatCard({ icon, label, value }: StatCardProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
                <p className="text-lg font-semibold font-mono text-gray-900 dark:text-gray-100 truncate">
                    {value}
                </p>
            </div>
        </div>
    );
}

interface TypeBadgeProps {
    type: string;
    count: number;
    total: number;
}

function TypeBadge({ type, count, total }: TypeBadgeProps) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    const typeColors: Record<string, string> = {
        object: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        array: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        string: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        number: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        boolean: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        null: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    const typeIcons: Record<string, React.ReactNode> = {
        object: <Layers className="h-3 w-3" />,
        array: <Hash className="h-3 w-3" />,
        string: <TreeDeciduous className="h-3 w-3" />,
        number: <span className="font-mono text-xs">#</span>,
        boolean: <CheckCircle2 className="h-3 w-3" />,
        null: <span className="font-mono text-xs">∅</span>,
    };

    const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    const colorClass = typeColors[type] || defaultColor;

    return (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={cn('flex-shrink-0 p-1 rounded text-gray-600 dark:text-gray-400')}>
                    {typeIcons[type] || <span className="font-mono text-xs">?</span>}
                </div>
                <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300 truncate">
                    {type}
                </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-300',
                            colorClass
                                .replace('text-', 'bg-')
                                .replace('800', '600')
                                .replace('900/30', '700'),
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-100 w-12 text-right">
                    {count}
                </span>
            </div>
        </div>
    );
}

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function CollapsibleSection({
    title,
    icon,
    count,
    children,
    defaultOpen = true,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="text-gray-600 dark:text-gray-400">{icon}</div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {title}
                        {count !== undefined && (
                            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                                ({count})
                            </span>
                        )}
                    </h3>
                </div>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
}

export function ParserResults({
    parsedData,
    showTypes,
    showPaths,
    showStatistics,
}: ParserResultsProps) {
    const handleCopyPath = (path: string) => {
        navigator.clipboard.writeText(path).then(() => {
            toast.success('Path copied to clipboard');
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Statistics Section */}
            {showStatistics && (
                <CollapsibleSection
                    title="Statistics"
                    icon={<BarChart3 className="h-4 w-4" />}
                    defaultOpen={true}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <StatCard
                            icon={<Hash className="h-4 w-4" />}
                            label="Total Keys"
                            value={parsedData.statistics.totalKeys}
                        />
                        <StatCard
                            icon={<Layers className="h-4 w-4" />}
                            label="Total Values"
                            value={parsedData.statistics.totalValues}
                        />
                        <StatCard
                            icon={<TreeDeciduous className="h-4 w-4" />}
                            label="Max Depth"
                            value={parsedData.statistics.maxDepth}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Types Distribution */}
            {showTypes &&
                parsedData.isValid &&
                Object.keys(parsedData.statistics.types).length > 0 && (
                    <CollapsibleSection
                        title="Type Distribution"
                        icon={<BarChart3 className="h-4 w-4" />}
                        count={Object.keys(parsedData.statistics.types).length}
                        defaultOpen={true}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                            {Object.entries(parsedData.statistics.types)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, count]) => (
                                    <TypeBadge
                                        key={type}
                                        type={type}
                                        count={count}
                                        total={parsedData.statistics.totalValues}
                                    />
                                ))}
                        </div>
                    </CollapsibleSection>
                )}

            {/* Paths Section */}
            {showPaths && parsedData.isValid && parsedData.paths.length > 0 && (
                <CollapsibleSection
                    title="JSON Paths"
                    icon={<TreeDeciduous className="h-4 w-4" />}
                    count={parsedData.paths.length}
                    defaultOpen={true}
                >
                    <div className="max-h-96 overflow-auto">
                        <div className="space-y-1">
                            {parsedData.paths.map((path, index) => (
                                <div
                                    key={index}
                                    className="group flex items-center justify-between gap-2 p-2 pr-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                                        {path}
                                    </code>
                                    <button
                                        onClick={() => handleCopyPath(path)}
                                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        title="Copy path"
                                    >
                                        <Copy className="h-3 w-3 text-gray-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
