'use client';
import { ToolContentSkeleton } from '@/app/(tools)/loading';

import { useState, useCallback, useRef } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useToolState } from '../../core/hooks/use-tool-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    checkTurnServer,
    DEFAULT_TURN_SERVERS,
    type TurnResult,
    type IceCandidateInfo,
} from '../utils/turn-checker';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import type { TabComponentProps } from '../../core/types/tool';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import {
    Route,
    Loader2,
    Copy,
    Clock,
    CheckCircle2,
    XCircle,
    Globe,
    Server,
    ShieldCheck,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    ArrowRightLeft,
    KeyRound,
} from 'lucide-react';

function CandidateRow({ candidate }: { candidate: IceCandidateInfo }) {
    const { copy } = useClipboard();
    const [expanded, setExpanded] = useState(false);

    const typeColor: Record<string, string> = {
        host: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        srflx: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        relay: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        prflx: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        unknown: 'bg-muted text-muted-foreground',
    };

    const typeLabel: Record<string, string> = {
        host: 'Host',
        srflx: 'Server Reflexive',
        relay: 'Relay',
        prflx: 'Peer Reflexive',
        unknown: 'Unknown',
    };

    return (
        <div className="rounded-md border bg-card">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
            >
                <Badge
                    variant="outline"
                    className={`text-[10px] font-mono shrink-0 ${typeColor[candidate.type] || typeColor.unknown}`}
                >
                    {typeLabel[candidate.type] || candidate.type}
                </Badge>
                <span className="font-mono text-xs truncate min-w-0 flex-1">
                    {candidate.ip}:{candidate.port}
                </span>
                <Badge variant="secondary" className="text-[10px] shrink-0 uppercase">
                    {candidate.protocol}
                </Badge>
                {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
            </button>
            {expanded && (
                <div className="border-t px-3 py-2 flex flex-col gap-1.5 bg-muted/20">
                    <div className="grid grid-cols-[100px_1fr] gap-x-3 text-xs">
                        <span className="text-muted-foreground">IP</span>
                        <span className="font-mono">{candidate.ip}</span>
                        <span className="text-muted-foreground">Port</span>
                        <span className="font-mono">{candidate.port}</span>
                        <span className="text-muted-foreground">Protocol</span>
                        <span className="font-mono uppercase">{candidate.protocol}</span>
                        <span className="text-muted-foreground">Component</span>
                        <span className="font-mono uppercase">{candidate.component}</span>
                        {candidate.priority !== null && (
                            <>
                                <span className="text-muted-foreground">Priority</span>
                                <span className="font-mono">{candidate.priority}</span>
                            </>
                        )}
                        {candidate.relatedAddress && (
                            <>
                                <span className="text-muted-foreground">Related Addr</span>
                                <span className="font-mono">{candidate.relatedAddress}</span>
                            </>
                        )}
                        {candidate.relatedPort !== null && (
                            <>
                                <span className="text-muted-foreground">Related Port</span>
                                <span className="font-mono">{candidate.relatedPort}</span>
                            </>
                        )}
                    </div>
                    <div className="pt-1.5 border-t mt-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Raw SDP</span>
                            <button
                                onClick={() => copy(candidate.candidate)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                        </div>
                        <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground leading-relaxed">
                            {candidate.candidate}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ResultView({ result }: { result: TurnResult }) {
    const { copy } = useClipboard();

    const relayCandidates = result.candidates.filter((c) => c.type === 'relay');
    const srflxCandidates = result.candidates.filter((c) => c.type === 'srflx');
    const hostCandidates = result.candidates.filter((c) => c.type === 'host');
    const otherCandidates = result.candidates.filter(
        (c) => c.type !== 'relay' && c.type !== 'srflx' && c.type !== 'host',
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    {result.allocationSuccess ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                        <p
                            className={`text-sm font-semibold ${
                                result.allocationSuccess
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                            {result.allocationSuccess
                                ? 'TURN Server Reachable — Relay Allocated'
                                : 'TURN Server Unreachable'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {result.turnUrl}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {result.allocationSuccess && (
                        <Badge
                            variant="default"
                            className="text-[10px] bg-blue-600 hover:bg-blue-700"
                        >
                            Relay Active
                        </Badge>
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                        {result.candidates.length} candidate
                        {result.candidates.length !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.responseTime}ms
                    </span>
                </div>
            </div>

            {result.error && (
                <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                    <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            {result.allocationSuccess ? 'Warning' : 'Connection Error'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{result.error}</p>
                        {!result.allocationSuccess && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Verify the TURN URL format, username, and credential are correct.
                                The server may also have rate limits or IP restrictions.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {result.relayIps.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Relay IP Addresses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.relayIps.map((ip) => (
                            <div
                                key={ip}
                                className="flex items-center gap-2 rounded-md border bg-blue-50 px-3 py-1.5 dark:bg-blue-950/30"
                            >
                                <span className="font-mono text-sm font-medium">{ip}</span>
                                <button
                                    onClick={() => copy(ip)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result.publicIps.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Public IP Addresses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.publicIps.map((ip) => (
                            <div
                                key={ip}
                                className="flex items-center gap-2 rounded-md border bg-green-50 px-3 py-1.5 dark:bg-green-950/30"
                            >
                                <span className="font-mono text-sm font-medium">{ip}</span>
                                <button
                                    onClick={() => copy(ip)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {relayCandidates.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Relay Candidates
                        <Badge variant="secondary" className="text-[10px] ml-1">
                            {relayCandidates.length}
                        </Badge>
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        {relayCandidates.map((c, i) => (
                            <CandidateRow key={i} candidate={c} />
                        ))}
                    </div>
                </div>
            )}

            {srflxCandidates.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Server Reflexive Candidates
                        <Badge variant="secondary" className="text-[10px] ml-1">
                            {srflxCandidates.length}
                        </Badge>
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        {srflxCandidates.map((c, i) => (
                            <CandidateRow key={i} candidate={c} />
                        ))}
                    </div>
                </div>
            )}

            {hostCandidates.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5" />
                        Host Candidates
                        <Badge variant="secondary" className="text-[10px] ml-1">
                            {hostCandidates.length}
                        </Badge>
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        {hostCandidates.map((c, i) => (
                            <CandidateRow key={i} candidate={c} />
                        ))}
                    </div>
                </div>
            )}

            {otherCandidates.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Other Candidates
                        <Badge variant="secondary" className="text-[10px] ml-1">
                            {otherCandidates.length}
                        </Badge>
                    </h3>
                    <div className="flex flex-col gap-1.5">
                        {otherCandidates.map((c, i) => (
                            <CandidateRow key={i} candidate={c} />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const lines = [
                            `TURN Check: ${result.allocationSuccess ? 'Relay Allocated' : 'Failed'}`,
                            `Server: ${result.turnUrl}`,
                            `Username: ${result.username}`,
                            `Response Time: ${result.responseTime}ms`,
                            `Candidates: ${result.candidates.length}`,
                            `Relay IPs: ${result.relayIps.join(', ') || 'None'}`,
                            '',
                            '--- Public IPs ---',
                            ...result.publicIps.map((ip) => ip),
                            '',
                            '--- Relay IPs ---',
                            ...result.relayIps.map((ip) => ip),
                            '',
                            '--- ICE Candidates ---',
                            ...result.candidates.map(
                                (c) => `[${c.type}] ${c.ip}:${c.port} (${c.protocol})`,
                            ),
                        ];
                        copy(lines.join('\n'));
                    }}
                    className="gap-1.5"
                >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Report
                </Button>
            </div>
        </div>
    );
}

export default function CheckerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.TURN_CHECKER_URL,
        sharedData,
        tabId: 'checker',
        readOnly,
    });

    const [username, setUsername] = useState('');
    const [credential, setCredential] = useState('');
    const [result, setResult] = useState<TurnResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const abortRef = useRef<boolean>(false);

    const handleCheck = useCallback(async () => {
        const url = content.trim();
        if (!url) return;

        abortRef.current = false;
        setLoading(true);
        setResult(null);

        const res = await checkTurnServer(url, username.trim(), credential);
        if (!abortRef.current) {
            setResult(res);
        }
        setLoading(false);
    }, [content, username, credential]);

    const handleCancel = useCallback(() => {
        abortRef.current = true;
        setLoading(false);
    }, []);

    const handlePresetSelect = useCallback(
        (preset: (typeof DEFAULT_TURN_SERVERS)[number]) => {
            setContent(preset.url);
            setUsername(preset.username);
            setCredential(preset.credential);
        },
        [setContent],
    );

    const { actions } = useToolActions({
        pageName: 'turn',
        tabId: 'checker',
        getContent: () => content,
        onClear: () => {
            setContent('');
            setUsername('');
            setCredential('');
            setResult(null);
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Input
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="turn:turn-server.example.com:3478"
                            className="h-9 font-mono text-sm flex-1"
                            spellCheck={false}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    content.trim() &&
                                    username.trim() &&
                                    credential.trim()
                                )
                                    handleCheck();
                            }}
                        />
                        {loading ? (
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 gap-1.5 shrink-0"
                            >
                                Cancel
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCheck}
                                disabled={!content.trim() || !username.trim() || !credential.trim()}
                                size="sm"
                                className="h-9 px-4 gap-1.5 shrink-0"
                            >
                                <Route className="h-4 w-4" />
                                Check
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="h-9 font-mono text-sm pl-8"
                                spellCheck={false}
                                autoComplete="off"
                                onKeyDown={(e) => {
                                    if (
                                        e.key === 'Enter' &&
                                        content.trim() &&
                                        username.trim() &&
                                        credential.trim()
                                    )
                                        handleCheck();
                                }}
                            />
                        </div>
                        <div className="relative">
                            <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={credential}
                                onChange={(e) => setCredential(e.target.value)}
                                placeholder="Credential / Password"
                                className="h-9 font-mono text-sm pl-8"
                                spellCheck={false}
                                autoComplete="off"
                                type="password"
                                onKeyDown={(e) => {
                                    if (
                                        e.key === 'Enter' &&
                                        content.trim() &&
                                        username.trim() &&
                                        credential.trim()
                                    )
                                        handleCheck();
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider self-center mr-1">
                        Presets:
                    </span>
                    {DEFAULT_TURN_SERVERS.map((preset) => (
                        <button
                            key={preset.url}
                            onClick={() => handlePresetSelect(preset)}
                            className={`rounded-md border px-2 py-1 text-[11px] font-mono transition-colors hover:bg-primary/10 ${
                                content === preset.url
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {preset.url.replace('turn:', '').split('?')[0].split(':')[0]}
                        </button>
                    ))}
                </div>

                {result && <ResultView result={result} />}

                {!result && !loading && (
                    <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Route className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter TURN server details and click Check
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Test TURN relay allocation and verify credentials with detailed ICE
                            candidate analysis
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Loader2 className="mb-3 h-10 w-10 animate-spin text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Allocating relay candidates...
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            This may take up to 15 seconds
                        </p>
                    </div>
                )}
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'turn',
                    tabName: 'checker',
                    getState: () => ({ content, username, credential }),
                    extraActions: [],
                }}
            />
        </ToolTabWrapper>
    );
}
