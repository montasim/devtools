'use client';

import { useState, useMemo, useCallback } from 'react';
import { useToolState } from '../../core/hooks/use-tool-state';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { TextEditor } from '../../text/components/text-editor';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Regex, Check, AlertCircle } from 'lucide-react';
import { EditorPaneHeader } from '../../core/components/editor-pane-header';
import { EmptyEditorPrompt } from '@/components/ui/empty-editor-prompt';
import { testRegex, highlightMatches, REGEX_FLAGS } from '../utils/regex-operations';
import type { TabComponentProps } from '../../core/types/tool';

export default function TestTab({ sharedData, readOnly }: TabComponentProps) {
    const {
        content: testString,
        setContent: setTestString,
        isReady,
    } = useToolState({
        storageKey: STORAGE_KEYS.REGEX_TEST_INPUT,
        sharedData,
        tabId: 'test',
        readOnly,
    });
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('g');
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const { copy } = useClipboard();

    const result = useMemo(
        () => testRegex(pattern, flags, testString),
        [pattern, flags, testString],
    );

    const highlighted = useMemo(
        () => highlightMatches(testString, result.matches),
        [testString, result.matches],
    );

    const handleClear = useCallback(() => {
        setTestString('');
        setPattern('');
    }, [setTestString]);

    const { actions } = useToolActions({
        pageName: 'regex',
        tabId: 'test',
        getContent: () => testString,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    const toggleFlag = useCallback((flag: string) => {
        setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
    }, []);

    const handleCopyMatch = useCallback(
        async (text: string, idx: number) => {
            await copy(text);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    if (!isReady) return null;

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">/</span>
                        <Input
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="regex pattern..."
                            className="h-7 w-44 sm:w-56 md:w-48 lg:w-64 font-mono text-xs"
                            readOnly={readOnly}
                        />
                        <span className="text-xs font-mono text-muted-foreground">/</span>
                        <span className="font-mono text-xs text-primary">{flags}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {REGEX_FLAGS.map((f) => (
                            <Button
                                key={f.value}
                                variant={flags.includes(f.value) ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 w-7 p-0 text-xs font-mono"
                                onClick={() => toggleFlag(f.value)}
                                title={`${f.label}: ${f.description}`}
                            >
                                {f.value}
                            </Button>
                        ))}
                    </div>
                </>
            }
        >
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label="Test String"
                            content={testString}
                            onContentChange={setTestString}
                            onClear={() => setTestString('')}
                            hideInputActions={readOnly}
                        />
                        <TextEditor
                            value={testString}
                            onChange={setTestString}
                            readOnly={readOnly}
                            emptyIcon={Regex}
                            emptyTitle="Enter test string"
                            emptyDescription="Type or paste text to test against your regex"
                        />
                    </div>
                </div>
                <div className="min-w-0 w-full md:w-1/2">
                    <div className="flex flex-col gap-2">
                        <EditorPaneHeader
                            label={
                                result.error
                                    ? 'Error'
                                    : result.matches.length > 0
                                      ? `Matches (${result.matches.length})`
                                      : 'Matches'
                            }
                            content={result.matches.map((m) => m.match).join('\n')}
                            onContentChange={() => {}}
                            hideInputActions
                        />
                        {result.error ? (
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 min-h-[350px] md:min-h-[400px] lg:min-h-[500px] dark:border-red-800 dark:bg-red-950">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                <span className="text-sm text-red-700 dark:text-red-300">
                                    {result.error}
                                </span>
                            </div>
                        ) : result.matches.length > 0 ? (
                            <div className="flex flex-col gap-3 min-h-[350px] md:min-h-[400px] lg:min-h-[500px]">
                                <div
                                    className="flex-1 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border p-4 font-mono text-sm"
                                    dangerouslySetInnerHTML={{ __html: highlighted }}
                                />
                                {result.matches.some(
                                    (m) => m.numberedGroups.length > 0 || m.groups,
                                ) && (
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Capture Groups
                                        </h4>
                                        <div className="rounded-md border bg-muted/30 p-3 overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="text-left text-muted-foreground">
                                                        <th className="pb-1.5 pr-3 font-medium">
                                                            #
                                                        </th>
                                                        <th className="pb-1.5 pr-3 font-medium">
                                                            Match
                                                        </th>
                                                        <th className="pb-1.5 pr-3 font-medium">
                                                            Group
                                                        </th>
                                                        <th className="pb-1.5 font-medium">
                                                            Value
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="font-mono">
                                                    {result.matches.map((m, mIdx) => {
                                                        const allGroups: {
                                                            name: string;
                                                            value: string;
                                                        }[] = [];
                                                        m.numberedGroups.forEach((g, i) => {
                                                            if (g !== undefined) {
                                                                allGroups.push({
                                                                    name: `$${i + 1}`,
                                                                    value: g,
                                                                });
                                                            }
                                                        });
                                                        if (m.groups) {
                                                            for (const [k, v] of Object.entries(
                                                                m.groups,
                                                            )) {
                                                                if (v !== undefined) {
                                                                    allGroups.push({
                                                                        name: k,
                                                                        value: v,
                                                                    });
                                                                }
                                                            }
                                                        }
                                                        return allGroups.map((g, gIdx) => (
                                                            <tr
                                                                key={`${mIdx}-${gIdx}`}
                                                                className="border-t first:border-t-0"
                                                            >
                                                                <td className="py-1 pr-3 text-muted-foreground">
                                                                    {mIdx}
                                                                </td>
                                                                <td className="py-1 pr-3 max-w-[120px] truncate">
                                                                    {m.match}
                                                                </td>
                                                                <td className="py-1 pr-3 text-primary">
                                                                    {g.name}
                                                                </td>
                                                                <td className="py-1 max-w-[200px] truncate">
                                                                    {g.value}
                                                                </td>
                                                            </tr>
                                                        ));
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 gap-1.5 text-xs"
                                        onClick={() =>
                                            copy(
                                                result.matches.map((m) => m.match).join('\n'),
                                                `${result.matches.length} matches copied`,
                                            )
                                        }
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy All Matches
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative min-h-[350px] rounded-lg border md:min-h-[400px] lg:min-h-[500px]">
                                <EmptyEditorPrompt
                                    icon={Regex}
                                    title="No matches"
                                    description={
                                        pattern.trim()
                                            ? 'No matches found for this pattern'
                                            : 'Enter a regex pattern and test string to see matches'
                                    }
                                    showActions={false}
                                    overlay
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'regex',
                    tabName: 'test',
                    getState: () => ({ content: testString, pattern, flags }),
                    extraActions:
                        result.matches.length > 0
                            ? [
                                  {
                                      id: 'copy-matches',
                                      label: 'Copy Matches',
                                      icon: Copy,
                                      handler: () =>
                                          copy(result.matches.map((m) => m.match).join('\n')),
                                  },
                              ]
                            : [],
                }}
            />
        </ToolTabWrapper>
    );
}
