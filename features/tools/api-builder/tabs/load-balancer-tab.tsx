'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { useToolState } from '../../core/hooks/use-tool-state';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { KeyValueEditor } from '../components/key-value-editor';
import {
    HTTP_METHODS,
    METHOD_COLORS,
    createEmptyKeyValue,
    executeRequest,
    getStatusColor,
    formatSize,
    formatTime,
    type ApiRequest,
    type HttpMethod,
    type KeyValueItem,
} from '../utils/http-client';
import {
    Play,
    Square,
    Plus,
    Trash2,
    Activity,
    Check,
    Copy,
    AlertCircle,
    Server,
    Settings,
    Shuffle,
    GitBranch,
    Hash,
    Users,
    Network,
    Terminal,
    Sparkles,
} from 'lucide-react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import type { TabComponentProps } from '../../core/types/tool';
import { ToolContentSkeleton } from '@/app/(tools)/loading';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface TargetNode {
    id: string;
    url: string;
    weight: number;
    enabled: boolean;
    simulatedLatency: number;
    simulatedErrorRate: number;
}

interface LoadBalancerState {
    targets: TargetNode[];
    method: HttpMethod;
    path: string;
    queryParams: KeyValueItem[];
    headers: KeyValueItem[];
    body: string;
    bodyType: 'json' | 'text' | 'urlencoded';
    authType: 'none' | 'bearer' | 'basic';
    authToken: string;
    authUsername: string;
    authPassword: string;
    algorithm: 'round-robin' | 'weighted-round-robin' | 'random' | 'ip-hash';
    totalRequests: number;
    concurrency: number;
    delayMs: number;
    mode: 'simulated' | 'live';
}

interface LogEntry {
    id: string;
    index: number;
    timestamp: string;
    targetUrl: string;
    fullUrl: string;
    method: HttpMethod;
    clientIp?: string;
    status: number;
    statusText: string;
    latency: number;
    success: boolean;
    responseBody?: string;
    responseHeaders?: Record<string, string>;
}

const MOCK_CLIENT_IPS = [
    '192.168.1.10',
    '192.168.1.25',
    '10.0.0.5',
    '172.16.0.42',
    '8.8.8.8',
];

function createDefaultState(): LoadBalancerState {
    return {
        targets: [
            { id: '1', url: 'https://api-us-east.company.com', weight: 3, enabled: true, simulatedLatency: 80, simulatedErrorRate: 1 },
            { id: '2', url: 'https://api-us-west.company.com', weight: 2, enabled: true, simulatedLatency: 120, simulatedErrorRate: 3 },
            { id: '3', url: 'https://api-eu-central.company.com', weight: 1, enabled: true, simulatedLatency: 220, simulatedErrorRate: 5 },
        ],
        method: 'GET',
        path: '/api/v1/status',
        queryParams: [createEmptyKeyValue()],
        headers: [createEmptyKeyValue()],
        body: '',
        bodyType: 'json',
        authType: 'none',
        authToken: '',
        authUsername: '',
        authPassword: '',
        algorithm: 'round-robin',
        totalRequests: 50,
        concurrency: 5,
        delayMs: 20,
        mode: 'simulated',
    };
}

export default function LoadBalancerTab({ sharedData, readOnly }: TabComponentProps) {
    const { content, setContent, isReady } = useToolState({
        storageKey: STORAGE_KEYS.API_BUILDER_LOAD_BALANCER_STATE,
        sharedData,
        tabId: 'load-balancer',
        readOnly,
    });

    const state: LoadBalancerState = useMemo(() => {
        if (!content) return createDefaultState();
        try {
            return { ...createDefaultState(), ...JSON.parse(content) };
        } catch {
            return createDefaultState();
        }
    }, [content]);

    const updateState = useCallback(
        (updates: Partial<LoadBalancerState>) => {
            const updated = { ...state, ...updates };
            setContent(JSON.stringify(updated));
        },
        [state, setContent],
    );

    // Run State
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeSection, setActiveSection] = useState('params');
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [targetStats, setTargetStats] = useState<Record<string, {
        sent: number;
        successes: number;
        failures: number;
        latencies: number[];
        statusCodes: Record<number, number>;
    }>>({});

    const abortRef = useRef(false);
    const { copy } = useClipboard();
    const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);

    // Helpers
    const hashIp = (ip: string): number => {
        let hash = 0;
        for (let i = 0; i < ip.length; i++) {
            hash = ip.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const handleStartTest = async () => {
        const enabledTargets = state.targets.filter((t) => t.enabled);
        if (enabledTargets.length === 0) return;

        setIsRunning(true);
        setProgress(0);
        setLogs([]);
        abortRef.current = false;

        // Initialize Stats
        const initialStats: typeof targetStats = {};
        enabledTargets.forEach((t) => {
            initialStats[t.url] = {
                sent: 0,
                successes: 0,
                failures: 0,
                latencies: [],
                statusCodes: {},
            };
        });
        setTargetStats(initialStats);

        const totalRequests = state.totalRequests;
        const concurrency = Math.min(state.concurrency, totalRequests);
        const delayMs = state.delayMs;

        // Sequence Trackers for algorithm
        let rrIndex = 0;
        let requestQueueIndex = 0;
        const startTime = performance.now();

        // Create index pool for Weighted Round Robin
        const weightedPool: number[] = [];
        enabledTargets.forEach((target, index) => {
            for (let i = 0; i < target.weight; i++) {
                weightedPool.push(index);
            }
        });

        const executeSingle = async (reqIdx: number) => {
            if (abortRef.current) return;

            // 1. Select Client IP
            const clientIp = MOCK_CLIENT_IPS[Math.floor(Math.random() * MOCK_CLIENT_IPS.length)];

            // 2. Select Target Node based on algorithm
            let selectedTarget = enabledTargets[0];
            if (state.algorithm === 'round-robin') {
                selectedTarget = enabledTargets[rrIndex % enabledTargets.length];
                rrIndex++;
            } else if (state.algorithm === 'weighted-round-robin' && weightedPool.length > 0) {
                const poolIndex = rrIndex % weightedPool.length;
                selectedTarget = enabledTargets[weightedPool[poolIndex]];
                rrIndex++;
            } else if (state.algorithm === 'random') {
                selectedTarget = enabledTargets[Math.floor(Math.random() * enabledTargets.length)];
            } else if (state.algorithm === 'ip-hash') {
                const targetIndex = hashIp(clientIp) % enabledTargets.length;
                selectedTarget = enabledTargets[targetIndex];
            }

            // 3. Assemble URL path
            const base = selectedTarget.url.replace(/\/$/, '');
            const cleanPath = state.path.startsWith('/') ? state.path : `/${state.path}`;
            const fullUrl = `${base}${cleanPath}`;

            let status = 200;
            let statusText = 'OK';
            let latency = 0;
            let success = true;
            let responseBody = '';
            let responseHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                'Server': `nginx-load-balancer-mock-node-${selectedTarget.id}`,
            };

            if (state.mode === 'simulated') {
                // Jittered Latency Simulation (+/- 15%)
                const jitter = (Math.random() * 0.3) - 0.15; // -0.15 to +0.15
                latency = Math.max(1, Math.round(selectedTarget.simulatedLatency * (1 + jitter)));

                // Simulated Delay
                await new Promise((resolve) => setTimeout(resolve, latency));

                // Simulated Success vs Error rate
                const isError = (Math.random() * 100) < selectedTarget.simulatedErrorRate;
                if (isError) {
                    const errorCodes = [500, 502, 503, 504];
                    status = errorCodes[Math.floor(Math.random() * errorCodes.length)];
                    statusText = status === 500 ? 'Internal Server Error' : status === 502 ? 'Bad Gateway' : status === 503 ? 'Service Unavailable' : 'Gateway Timeout';
                    success = false;
                    responseBody = JSON.stringify({
                        error: statusText,
                        code: status,
                        node: selectedTarget.url,
                        timestamp: new Date().toISOString(),
                        message: 'The server node encountered an issue routing your request.',
                    }, null, 2);
                } else {
                    status = state.method === 'POST' ? 201 : 200;
                    statusText = status === 201 ? 'Created' : 'OK';
                    responseBody = JSON.stringify({
                        success: true,
                        status: statusText,
                        node: selectedTarget.url,
                        method: state.method,
                        ip: state.algorithm === 'ip-hash' ? clientIp : undefined,
                        data: {
                            message: 'This is simulated backend JSON response payload.',
                            items: [1, 2, 3],
                        },
                        timestamp: new Date().toISOString(),
                    }, null, 2);
                }
            } else {
                // Live Fetch execution
                const apiRequest: ApiRequest = {
                    method: state.method,
                    url: fullUrl,
                    headers: state.headers,
                    queryParams: state.queryParams,
                    body: state.body,
                    bodyType: state.bodyType,
                    authType: state.authType,
                    authToken: state.authToken,
                    authUsername: state.authUsername,
                    authPassword: state.authPassword,
                };

                const startFetchTime = performance.now();
                try {
                    const res = await executeRequest(apiRequest);
                    latency = Math.round(performance.now() - startFetchTime);
                    status = res.status;
                    statusText = res.statusText;
                    success = res.status >= 200 && res.status < 300;
                    responseBody = res.body;
                    responseHeaders = res.headers;
                } catch (err) {
                    latency = Math.round(performance.now() - startFetchTime);
                    status = 0;
                    statusText = err instanceof Error ? err.message : 'Network Error';
                    success = false;
                    responseBody = JSON.stringify({ error: statusText, timestamp: new Date().toISOString() }, null, 2);
                }
            }

            if (abortRef.current) return;

            // Log update
            const logEntry: LogEntry = {
                id: crypto.randomUUID(),
                index: reqIdx + 1,
                timestamp: new Date().toLocaleTimeString(),
                targetUrl: selectedTarget.url,
                fullUrl,
                method: state.method,
                clientIp: state.algorithm === 'ip-hash' ? clientIp : undefined,
                status,
                statusText,
                latency,
                success,
                responseBody,
                responseHeaders,
            };

            // Update stats immediately
            setTargetStats((prev) => {
                const targetPrev = prev[selectedTarget.url] || {
                    sent: 0,
                    successes: 0,
                    failures: 0,
                    latencies: [],
                    statusCodes: {},
                };

                const updatedCodes = { ...targetPrev.statusCodes };
                updatedCodes[status] = (updatedCodes[status] || 0) + 1;

                return {
                    ...prev,
                    [selectedTarget.url]: {
                        sent: targetPrev.sent + 1,
                        successes: targetPrev.successes + (success ? 1 : 0),
                        failures: targetPrev.failures + (success ? 0 : 1),
                        latencies: [...targetPrev.latencies, latency],
                        statusCodes: updatedCodes,
                    },
                };
            });

            setLogs((prev) => [logEntry, ...prev]);
            setProgress((prev) => {
                const nextProgress = prev + 1;
                return nextProgress;
            });
        };

        const worker = async () => {
            while (requestQueueIndex < totalRequests && !abortRef.current) {
                const currentIdx = requestQueueIndex;
                requestQueueIndex++;
                await executeSingle(currentIdx);
                if (delayMs > 0 && requestQueueIndex < totalRequests) {
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            }
        };

        // Spawn concurrent workers
        const workers = Array.from({ length: concurrency }, () => worker());
        await Promise.all(workers);

        setIsRunning(false);
    };

    const handleStopTest = () => {
        abortRef.current = true;
        setIsRunning(false);
    };

    const handleAddTarget = () => {
        const newTarget: TargetNode = {
            id: crypto.randomUUID(),
            url: `https://api-node-${state.targets.length + 1}.company.com`,
            weight: 1,
            enabled: true,
            simulatedLatency: 100,
            simulatedErrorRate: 2,
        };
        updateState({ targets: [...state.targets, newTarget] });
    };

    const handleRemoveTarget = (id: string) => {
        if (state.targets.length <= 1) return;
        updateState({ targets: state.targets.filter((t) => t.id !== id) });
    };

    const handleUpdateTarget = (id: string, field: keyof TargetNode, value: any) => {
        updateState({
            targets: state.targets.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
        });
    };

    const handleCopyLog = async (log: LogEntry) => {
        await copy(JSON.stringify(log, null, 2));
        setCopiedLogId(log.id);
        setTimeout(() => setCopiedLogId(null), 1500);
    };

    const { actions } = useToolActions({
        pageName: 'api-builder',
        tabId: 'load-balancer',
        getContent: () => content,
        onClear: () => {
            setContent(JSON.stringify(createDefaultState()));
            setLogs([]);
            setProgress(0);
            setTargetStats({});
        },
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    // Compute Metrics Dashboard
    const totalSent = useMemo(() => {
        return Object.values(targetStats).reduce((sum, item) => sum + item.sent, 0);
    }, [targetStats]);

    const overallSuccessRate = useMemo(() => {
        if (totalSent === 0) return 0;
        const totalSuccess = Object.values(targetStats).reduce((sum, item) => sum + item.successes, 0);
        return Math.round((totalSuccess / totalSent) * 100);
    }, [targetStats, totalSent]);

    const overallAvgLatency = useMemo(() => {
        if (totalSent === 0) return 0;
        const totalLatencySum = Object.values(targetStats).reduce(
            (sum, item) => sum + item.latencies.reduce((lSum, l) => lSum + l, 0),
            0
        );
        return Math.round(totalLatencySum / totalSent);
    }, [targetStats, totalSent]);

    const totalErrors = useMemo(() => {
        return Object.values(targetStats).reduce((sum, item) => sum + item.failures, 0);
    }, [targetStats]);

    if (!isReady) return <ToolContentSkeleton />;

    return (
        <ToolTabWrapper actions={actions}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">

                {/* Configuration Left Panel */}
                <div className="lg:col-span-5 flex flex-col gap-5">

                    {/* Targets Config Card */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-emerald-500" />
                                <h3 className="font-semibold text-sm">Target Server Nodes</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={handleAddTarget}
                                disabled={isRunning}
                                className="h-7 px-2 text-[11px]"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Node
                            </Button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                            {state.targets.map((target) => {
                                const isWrr = state.algorithm === 'weighted-round-robin';
                                const isSim = state.mode === 'simulated';

                                return (
                                    <div
                                        key={target.id}
                                        className={`rounded-lg border p-3 flex flex-col gap-2 transition-all ${target.enabled ? 'bg-muted/10 border-emerald-500/10' : 'bg-muted/5 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div className={`h-2 w-2 rounded-full transition-all duration-300 ${target.enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-muted/60'}`} />
                                                <Switch
                                                    checked={target.enabled}
                                                    onCheckedChange={(val) => handleUpdateTarget(target.id, 'enabled', val)}
                                                    disabled={isRunning}
                                                    className="scale-75"
                                                />
                                            </div>
                                            <Input
                                                value={target.url}
                                                onChange={(e) => handleUpdateTarget(target.id, 'url', e.target.value)}
                                                placeholder="https://api.node.com"
                                                className="h-7 text-xs font-mono flex-1"
                                                disabled={isRunning}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveTarget(target.id)}
                                                disabled={isRunning || state.targets.length <= 1}
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {target.enabled && (
                                            <div className="grid grid-cols-3 gap-2 mt-1">
                                                <div className="flex flex-col gap-1">
                                                    <Label className="text-[10px] text-muted-foreground font-medium truncate">
                                                        Weight
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={target.weight}
                                                        onChange={(e) => handleUpdateTarget(target.id, 'weight', Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="h-7 text-xs font-mono"
                                                        disabled={isRunning}
                                                        min={1}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <Label className="text-[10px] text-muted-foreground font-medium truncate">
                                                        Latency (ms)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={target.simulatedLatency}
                                                        onChange={(e) => handleUpdateTarget(target.id, 'simulatedLatency', Math.max(0, parseInt(e.target.value) || 0))}
                                                        className="h-7 text-xs font-mono"
                                                        disabled={isRunning}
                                                        min={0}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <Label className="text-[10px] text-muted-foreground font-medium truncate">
                                                        Errors (%)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={target.simulatedErrorRate}
                                                        onChange={(e) => handleUpdateTarget(target.id, 'simulatedErrorRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                                        className="h-7 text-xs font-mono"
                                                        disabled={isRunning}
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Common Request Config */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                        <div className="flex items-center gap-2 border-b pb-3 mb-4">
                            <Settings className="h-4 w-4 text-emerald-500" />
                            <h3 className="font-semibold text-sm">Common Request Details</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <select
                                    value={state.method}
                                    onChange={(e) => updateState({ method: e.target.value as HttpMethod })}
                                    className={`h-9 rounded-lg border border-input bg-transparent px-2 text-sm font-bold font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 ${METHOD_COLORS[state.method]
                                        }`}
                                    disabled={isRunning}
                                >
                                    {HTTP_METHODS.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    value={state.path}
                                    onChange={(e) => updateState({ path: e.target.value })}
                                    placeholder="/api/v1/endpoint"
                                    className="h-9 font-mono text-sm"
                                    disabled={isRunning}
                                />
                            </div>

                            {/* Optional Header payload switcher */}
                            <div className="flex flex-col gap-2 border-t pt-3 mt-1">
                                <div className="flex gap-1 border-b pb-1.5">
                                    {[
                                        { id: 'params', label: 'Params' },
                                        { id: 'headers', label: 'Headers' },
                                        { id: 'body', label: 'Body' },
                                        { id: 'auth', label: 'Auth' },
                                    ]
                                        .filter((s) => s.id !== 'body' || !['GET', 'HEAD'].includes(state.method))
                                        .map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${activeSection === section.id
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'text-muted-foreground hover:bg-muted/50'
                                                    }`}
                                                disabled={isRunning}
                                            >
                                                {section.label}
                                            </button>
                                        ))}
                                </div>

                                <div className="mt-1">
                                    {activeSection === 'params' && (
                                        <KeyValueEditor
                                            items={state.queryParams}
                                            onChange={(queryParams) => updateState({ queryParams })}
                                            keyPlaceholder="Parameter name"
                                            valuePlaceholder="Value"
                                        />
                                    )}

                                    {activeSection === 'headers' && (
                                        <KeyValueEditor
                                            items={state.headers}
                                            onChange={(headers) => updateState({ headers })}
                                            keyPlaceholder="Header name"
                                            valuePlaceholder="Value"
                                        />
                                    )}

                                    {activeSection === 'body' && !['GET', 'HEAD'].includes(state.method) && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-1.5">
                                                {(['json', 'text', 'urlencoded'] as const).map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => updateState({ bodyType: type })}
                                                        className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${state.bodyType === type
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'text-muted-foreground hover:bg-muted/50'
                                                            }`}
                                                        disabled={isRunning}
                                                    >
                                                        {type === 'urlencoded' ? 'x-www-form' : type.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                            <Textarea
                                                value={state.body}
                                                onChange={(e) => updateState({ body: e.target.value })}
                                                placeholder={
                                                    state.bodyType === 'json'
                                                        ? '{\n  "key": "value"\n}'
                                                        : 'Request body...'
                                                }
                                                className="min-h-24 font-mono text-xs resize-none"
                                                spellCheck={false}
                                                disabled={isRunning}
                                            />
                                        </div>
                                    )}

                                    {activeSection === 'auth' && (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-1.5">
                                                {(['none', 'bearer', 'basic'] as const).map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => updateState({ authType: type })}
                                                        className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${state.authType === type
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'text-muted-foreground hover:bg-muted/50'
                                                            }`}
                                                        disabled={isRunning}
                                                    >
                                                        {type === 'none' ? 'None' : type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                            {state.authType === 'bearer' && (
                                                <Input
                                                    value={state.authToken}
                                                    onChange={(e) => updateState({ authToken: e.target.value })}
                                                    placeholder="Bearer token"
                                                    className="h-8 font-mono text-xs"
                                                    type="password"
                                                    spellCheck={false}
                                                    disabled={isRunning}
                                                />
                                            )}
                                            {state.authType === 'basic' && (
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={state.authUsername}
                                                        onChange={(e) => updateState({ authUsername: e.target.value })}
                                                        placeholder="Username"
                                                        className="h-8 font-mono text-xs"
                                                        spellCheck={false}
                                                        disabled={isRunning}
                                                    />
                                                    <Input
                                                        value={state.authPassword}
                                                        onChange={(e) => updateState({ authPassword: e.target.value })}
                                                        placeholder="Password"
                                                        className="h-8 font-mono text-xs"
                                                        type="password"
                                                        spellCheck={false}
                                                        disabled={isRunning}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Load Testing Parameters */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                        <div className="flex items-center gap-2 border-b pb-3 mb-4">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            <h3 className="font-semibold text-sm">Load Testing Configuration</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Mode selection */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <Label className="text-xs font-semibold">Testing Mode</Label>
                                    <span className="text-[10px] text-muted-foreground">Simulate delays or trigger fetch requests</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${state.mode === 'live' ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}`}>Live Fetch</span>
                                    <Switch
                                        checked={state.mode === 'simulated'}
                                        onCheckedChange={(val) => updateState({ mode: val ? 'simulated' : 'live' })}
                                        disabled={isRunning}
                                    />
                                    <span className={`text-xs ${state.mode === 'simulated' ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}`}>Simulated</span>
                                </div>
                            </div>

                            {/* Algorithm selection */}
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold">Load Balancing Algorithm</Label>
                                <select
                                    value={state.algorithm}
                                    onChange={(e) => updateState({ algorithm: e.target.value as any })}
                                    className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs font-medium cursor-pointer focus:outline-none"
                                    disabled={isRunning}
                                >
                                    <option value="round-robin">Round Robin (Sequential)</option>
                                    <option value="weighted-round-robin">Weighted Round Robin</option>
                                    <option value="random">Random Distribution</option>
                                    <option value="ip-hash">IP / Client Sticky Hash</option>
                                </select>
                            </div>

                            {/* Numeric Inputs (full freedom) */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs font-semibold">Total Requests</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={state.totalRequests}
                                        onChange={(e) => updateState({ totalRequests: Math.max(1, parseInt(e.target.value) || 1) })}
                                        disabled={isRunning}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs font-semibold">Concurrency</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={state.concurrency}
                                        onChange={(e) => updateState({ concurrency: Math.max(1, parseInt(e.target.value) || 1) })}
                                        disabled={isRunning}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-xs font-semibold">Delay (ms)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={state.delayMs}
                                        onChange={(e) => updateState({ delayMs: Math.max(0, parseInt(e.target.value) || 0) })}
                                        disabled={isRunning}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Dashboard & Visualization Right Panel */}
                <div className="lg:col-span-7 flex flex-col gap-5">

                    {/* Testing Action Panel */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {state.mode === 'simulated' ? (
                                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                                        <Sparkles className="h-3 w-3 mr-1" /> Simulation Mode
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                                        <Network className="h-3 w-3 mr-1" /> Live HTTP Mode
                                    </Badge>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {isRunning ? (
                                    <Button
                                        onClick={handleStopTest}
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 gap-1.5 px-4"
                                    >
                                        <Square className="h-3.5 w-3.5 fill-current" /> Stop Test
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleStartTest}
                                        disabled={state.targets.filter(t => t.enabled).length === 0}
                                        size="sm"
                                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-4 shadow-sm"
                                    >
                                        <Play className="h-3.5 w-3.5 fill-current" /> Run Load Test
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {(totalSent > 0 || isRunning) && (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span>Progress: {totalSent} / {state.totalRequests} requests</span>
                                    <span>{Math.round((totalSent / state.totalRequests) * 100)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-150"
                                        style={{ width: `${(totalSent / state.totalRequests) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Target nodes stat table */}
                    {totalSent > 0 && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 overflow-x-auto">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Nodes Performance Breakdown</h4>

                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="py-2 font-medium">Node URL</th>
                                        <th className="py-2 text-center font-medium">Weight</th>
                                        <th className="py-2 text-center font-medium">Requests</th>
                                        <th className="py-2 text-center font-medium">Success Rate</th>
                                        <th className="py-2 text-center font-medium">Avg Latency</th>
                                        <th className="py-2 text-center font-medium">Min/Max</th>
                                        <th className="py-2 text-right font-medium">Errors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.targets.filter(t => t.enabled).map((target) => {
                                        const stats = targetStats[target.url] || {
                                            sent: 0,
                                            successes: 0,
                                            failures: 0,
                                            latencies: [],
                                            statusCodes: {},
                                        };
                                        const rate = stats.sent > 0 ? Math.round((stats.successes / stats.sent) * 100) : 0;

                                        const sum = stats.latencies.reduce((a, b) => a + b, 0);
                                        const avg = stats.sent > 0 ? Math.round(sum / stats.sent) : 0;
                                        const min = stats.latencies.length > 0 ? Math.min(...stats.latencies) : 0;
                                        const max = stats.latencies.length > 0 ? Math.max(...stats.latencies) : 0;

                                        return (
                                            <tr key={target.id} className="border-b last:border-b-0 hover:bg-muted/30">
                                                <td className="py-2 font-mono truncate max-w-[150px]">{target.url}</td>
                                                <td className="py-2 text-center font-mono">{state.algorithm === 'weighted-round-robin' ? target.weight : 'N/A'}</td>
                                                <td className="py-2 text-center font-mono">{stats.sent}</td>
                                                <td className="py-2 text-center font-mono">
                                                    <span className={`font-semibold ${rate > 90 ? 'text-green-600' : rate > 75 ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {rate}%
                                                    </span>
                                                </td>
                                                <td className="py-2 text-center font-mono">{avg} ms</td>
                                                <td className="py-2 text-center font-mono text-[10px] text-muted-foreground">{min}/{max} ms</td>
                                                <td className="py-2 text-right font-mono text-red-500">{stats.failures}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Detailed Activity Logs */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex-1 flex flex-col min-h-60 max-h-[500px]">
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-emerald-500" />
                                <h3 className="font-semibold text-sm">Real-time Routing logs</h3>
                            </div>
                            {logs.length > 0 && (
                                <Badge variant="outline" className="text-[10px] border-emerald-500/20">
                                    showing {logs.length} logs
                                </Badge>
                            )}
                        </div>

                        {logs.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                                <Activity className="h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
                                <p className="text-xs font-semibold">No logs available</p>
                                <p className="text-[10px] text-muted-foreground/75 mt-0.5">Start a load test to view live HTTP routing events.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                                {logs.map((log) => (
                                    <div
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        className="rounded-md border p-2 flex items-center justify-between text-[11px] hover:bg-muted/40 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-2 truncate flex-1 mr-3">
                                            <span className="font-mono text-muted-foreground select-none">#{log.index}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] px-1 font-mono leading-none ${METHOD_COLORS[log.method]}`}
                                            >
                                                {log.method}
                                            </Badge>
                                            <span className="font-mono truncate font-medium text-foreground max-w-[200px]" title={log.fullUrl}>
                                                {log.targetUrl}
                                            </span>
                                            {log.clientIp && (
                                                <Badge variant="outline" className="text-[9px] px-1 font-mono text-emerald-500 bg-emerald-50/10 select-none">
                                                    sticky: {log.clientIp}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="font-mono text-muted-foreground">{log.latency} ms</span>
                                            <Badge
                                                className={`font-mono text-[10px] ${log.success
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                                    }`}
                                            >
                                                {log.status > 0 ? log.status : 'ERR'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyLog(log);
                                                }}
                                                className="h-6 w-6 text-muted-foreground"
                                            >
                                                {copiedLogId === log.id ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* Request & Response Event Analyser Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-h-[85vh] overflow-hidden w-[95vw] sm:max-w-2xl flex flex-col gap-4">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                                Request #{selectedLog?.index}
                            </Badge>
                            <span>Routing Event Analysis</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs font-mono break-all pt-1 flex items-center gap-2">
                            <Badge className={`${selectedLog ? METHOD_COLORS[selectedLog.method] : ''}`} variant="outline">
                                {selectedLog?.method}
                            </Badge>
                            <span>{selectedLog?.fullUrl}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
                            {/* Stats Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="rounded-lg border p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status Code</span>
                                    <span className={`text-sm font-bold font-mono ${getStatusColor(selectedLog.status)}`}>
                                        {selectedLog.status > 0 ? selectedLog.status : 'Network Error'} {selectedLog.statusText}
                                    </span>
                                </div>
                                <div className="rounded-lg border p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Latency</span>
                                    <span className="text-sm font-bold font-mono text-foreground">{selectedLog.latency} ms</span>
                                </div>
                                <div className="rounded-lg border p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Timestamp</span>
                                    <span className="text-sm font-mono text-foreground truncate">{selectedLog.timestamp}</span>
                                </div>
                                <div className="rounded-lg border p-2 flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Client Session</span>
                                    <span className="text-sm font-mono text-foreground truncate">{selectedLog.clientIp || 'Default (Sticky: N/A)'}</span>
                                </div>
                            </div>

                            {/* Response Headers */}
                            {selectedLog.responseHeaders && Object.keys(selectedLog.responseHeaders).length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Response Headers</span>
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            className="h-6 text-[10px]"
                                            onClick={() => {
                                                if (selectedLog.responseHeaders) {
                                                    const statusLine = `HTTP/1.1 ${selectedLog.status} ${selectedLog.statusText}`;
                                                    const headerLines = Object.entries(selectedLog.responseHeaders)
                                                        .map(([key, val]) => `${key}: ${val}`)
                                                        .join('\r\n');
                                                    const rawHeaders = `${statusLine}\r\n${headerLines}`;
                                                    copy(rawHeaders, 'Raw headers copied to clipboard');
                                                }
                                            }}
                                        >
                                            <Copy className="h-3 w-3 mr-1" /> Copy Raw Headers
                                        </Button>
                                    </div>
                                    <div className="rounded-lg border bg-muted/20 p-3 max-h-36 overflow-y-auto font-mono text-xs leading-relaxed flex flex-col gap-1">
                                        {Object.entries(selectedLog.responseHeaders).map(([key, val]) => (
                                            <div key={key} className="flex gap-2 border-b border-muted/30 pb-1 last:border-0 last:pb-0">
                                                <span className="text-emerald-500 font-bold shrink-0">{key}:</span>
                                                <span className="text-foreground/90 break-all">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Response Body */}
                            <div className="flex flex-col gap-1.5 flex-1 min-h-[150px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Response Body</span>
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        className="h-6 text-[10px]"
                                        onClick={() => selectedLog.responseBody && copy(selectedLog.responseBody)}
                                    >
                                        <Copy className="h-3 w-3 mr-1" /> Copy Body
                                    </Button>
                                </div>
                                <pre className="font-mono text-[11px] p-3 rounded-lg border bg-muted/40 max-h-60 overflow-y-auto whitespace-pre-wrap break-all flex-1">
                                    {selectedLog.responseBody || '(empty response body)'}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'api-builder',
                    tabName: 'load-balancer',
                    getState: () => JSON.parse(content || '{}'),
                }}
            />
        </ToolTabWrapper>
    );
}
