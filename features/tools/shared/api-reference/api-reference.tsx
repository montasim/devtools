'use client';

import { useState, useCallback } from 'react';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import {
    Copy,
    Check,
    Terminal,
    Code2,
    Globe,
    Server,
    Play,
    Loader2,
    Sparkles,
    Cpu,
    CornerDownRight
} from 'lucide-react';

export interface BodyParam {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

export interface HeaderParam {
    key: string;
    value: string;
    description?: string;
}

export interface TestInputConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'password';
    placeholder: string;
    defaultValue?: string;
}

export interface ApiReferenceProps {
    title: string;
    description: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    headers?: HeaderParam[];
    bodyParams?: BodyParam[];
    curlExample: string;
    jsExample: string;
    responseExample: string;
    testInputs: TestInputConfig[];
}

export function ApiReference({
    title,
    description,
    method,
    endpoint,
    headers = [
        { key: 'Content-Type', value: 'application/json', description: 'Required for payload format' }
    ],
    bodyParams = [],
    curlExample,
    jsExample,
    responseExample,
    testInputs,
}: ApiReferenceProps) {
    const { copy } = useClipboard();
    const [copiedRequest, setCopiedRequest] = useState(false);
    const [copiedResponse, setCopiedResponse] = useState(false);
    const [copiedRealResponse, setCopiedRealResponse] = useState(false);
    const [activeLang, setActiveLang] = useState<'curl' | 'javascript'>('curl');

    // Live testing states
    const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        testInputs.forEach((input) => {
            initial[input.name] = input.defaultValue ?? '';
        });
        return initial;
    });
    const [loading, setLoading] = useState(false);
    const [realResponse, setRealResponse] = useState<{
        status: number;
        statusText: string;
        time: number;
        body: string;
    } | null>(null);

    const handleCopyRequest = useCallback(async () => {
        const textToCopy = activeLang === 'curl' ? curlExample : jsExample;
        await copy(textToCopy);
        setCopiedRequest(true);
        setTimeout(() => setCopiedRequest(false), 2000);
    }, [copy, activeLang, curlExample, jsExample]);

    const handleCopyResponse = useCallback(async () => {
        await copy(responseExample);
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
    }, [copy, responseExample]);

    const handleCopyRealResponse = useCallback(async () => {
        if (realResponse?.body) {
            await copy(realResponse.body);
            setCopiedRealResponse(true);
            setTimeout(() => setCopiedRealResponse(false), 2000);
        }
    }, [copy, realResponse]);

    const handleSendRequest = async () => {
        setLoading(true);
        setRealResponse(null);
        const startTime = performance.now();
        try {
            const payload: Record<string, any> = {};
            Object.entries(inputValues).forEach(([k, v]) => {
                if (v.trim()) {
                    payload[k] = v;
                }
            });

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: method !== 'GET' ? JSON.stringify(payload) : undefined,
            });

            const time = Math.round(performance.now() - startTime);
            let bodyText = '';
            try {
                const data = await res.json();
                bodyText = JSON.stringify(data, null, 2);
            } catch {
                bodyText = await res.text();
            }

            setRealResponse({
                status: res.status,
                statusText: res.statusText,
                time,
                body: bodyText,
            });
        } catch (err) {
            const time = Math.round(performance.now() - startTime);
            setRealResponse({
                status: 0,
                statusText: 'Network Error',
                time,
                body: JSON.stringify({
                    error: err instanceof Error ? err.message : 'Network request failed'
                }, null, 2),
            });
        } finally {
            setLoading(false);
        }
    };

    const methodColor =
        method === 'POST' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
            method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-6 py-6 w-full">
                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
                    {/* Left Column: API Specs & Schema */}
                    <div className="flex flex-col gap-6">
                        {/* Endpoint and HTTP Method */}
                        <div className="flex flex-col gap-3.5 rounded-xl border bg-card p-5 shadow-xs">
                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Server className="h-3.5 w-3.5 text-primary/80" />
                                API Endpoint
                            </div>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                                <span className={`px-2.5 py-1 rounded-md border text-xs font-bold ${methodColor}`}>
                                    {method}
                                </span>
                                <code className="bg-muted/80 px-2.5 py-1 rounded-md text-foreground break-all text-xs font-medium border border-border/50">
                                    {endpoint}
                                </code>
                            </div>
                        </div>

                        {/* Request Headers */}
                        {headers.length > 0 && (
                            <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary/80" />
                                    Request Headers
                                </h3>
                                <div className="border rounded-lg overflow-hidden border-border/60">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b bg-muted/60 font-mono uppercase text-[10px] text-muted-foreground">
                                                <th className="px-4 py-2.5 font-semibold">Header</th>
                                                <th className="px-4 py-2.5 font-semibold">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/45">
                                            {headers.map((h, idx) => (
                                                <tr key={idx} className="hover:bg-muted/15 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-foreground font-semibold">{h.key}</td>
                                                    <td className="px-4 py-3 font-mono text-muted-foreground leading-relaxed">
                                                        {h.value}
                                                        {h.description && (
                                                            <div className="text-[10px] text-muted-foreground/80 font-sans mt-0.5">
                                                                {h.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Request Body parameters */}
                        {bodyParams.length > 0 && (
                            <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-primary/80" />
                                    Request Body Parameters
                                </h3>
                                <div className="border rounded-lg overflow-hidden border-border/60">
                                    <div className="grid grid-cols-[1.2fr_80px_80px] gap-2 bg-muted/60 px-4 py-2.5 border-b font-mono uppercase text-[10px] font-semibold text-muted-foreground">
                                        <span>Parameter</span>
                                        <span>Type</span>
                                        <span>Required</span>
                                    </div>
                                    <div className="divide-y divide-border/45">
                                        {bodyParams.map((p, idx) => (
                                            <div key={idx} className="flex flex-col p-4 hover:bg-muted/10 transition-colors">
                                                <div className="grid grid-cols-[1.2fr_80px_80px] gap-2 items-center">
                                                    <code className="font-mono text-xs text-primary font-semibold">{p.name}</code>
                                                    <span className="font-mono text-xs text-muted-foreground">{p.type}</span>
                                                    <span>
                                                        <Badge variant={p.required ? 'destructive' : 'secondary'} className="text-[9px] px-1.5 py-0 h-4">
                                                            {p.required ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                                    {p.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Dynamic Playground + Code Examples */}
                    <div className="flex flex-col gap-6">
                        {/* Interactive Testing Playground */}
                        <div className="flex flex-col gap-3.5 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                    <Cpu className="h-4 w-4" />
                                    API Playground
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Interactive
                                </span>
                            </div>

                            <div className="flex flex-col gap-4 mt-1">
                                {testInputs.map((input) => (
                                    <div key={input.name} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                                            <CornerDownRight className="h-3 w-3 text-muted-foreground" />
                                            {input.label}
                                        </label>
                                        {input.type === 'textarea' ? (
                                            <Textarea
                                                placeholder={input.placeholder}
                                                value={inputValues[input.name]}
                                                onChange={(e) => setInputValues((prev) => ({ ...prev, [input.name]: e.target.value }))}
                                                className="font-mono text-xs bg-background min-h-[90px] border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                spellCheck={false}
                                            />
                                        ) : (
                                            <Input
                                                type={input.type}
                                                placeholder={input.placeholder}
                                                value={inputValues[input.name]}
                                                onChange={(e) => setInputValues((prev) => ({ ...prev, [input.name]: e.target.value }))}
                                                className="h-9 text-xs font-mono bg-background border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary"
                                                spellCheck={false}
                                            />
                                        )}
                                    </div>
                                ))}

                                <Button
                                    onClick={handleSendRequest}
                                    disabled={loading || !Object.values(inputValues).some((v) => v.trim())}
                                    className="w-full h-9 mt-2 text-xs font-semibold shadow-xs"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                            Executing Request...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                                            Send API Request
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Playground Response Output */}
                            {realResponse && (
                                <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-dashed border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Result:</span>
                                            <Badge variant={realResponse.status === 200 ? 'default' : 'destructive'} className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                                                {realResponse.status} {realResponse.statusText}
                                            </Badge>
                                            <span className="text-[10px] font-mono text-muted-foreground/80">
                                                {realResponse.time}ms
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-md"
                                            onClick={handleCopyRealResponse}
                                        >
                                            {copiedRealResponse ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="relative rounded-lg border bg-background/80 p-3 font-mono text-[11px] overflow-x-auto max-h-[220px] scrollbar-thin">
                                        <pre className="text-foreground leading-relaxed">
                                            <code>{realResponse.body}</code>
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Static Request/Response Code References */}
                        <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-xs">
                            {/* Request Sample code block */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                                        Request Example
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex border rounded-md p-0.5 bg-muted">
                                            <button
                                                onClick={() => setActiveLang('curl')}
                                                className={`text-[9px] px-2 py-0.5 rounded font-mono font-medium transition-all ${activeLang === 'curl'
                                                    ? 'bg-background text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                cURL
                                            </button>
                                            <button
                                                onClick={() => setActiveLang('javascript')}
                                                className={`text-[9px] px-2 py-0.5 rounded font-mono font-medium transition-all ${activeLang === 'javascript'
                                                    ? 'bg-background text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                JS
                                            </button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6.5 w-6.5 rounded-md"
                                            onClick={handleCopyRequest}
                                        >
                                            {copiedRequest ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative rounded-lg border bg-muted/30 p-3.5 font-mono text-[11px] overflow-x-auto max-h-[180px] scrollbar-thin">
                                    <pre className="text-muted-foreground leading-relaxed">
                                        <code>{activeLang === 'curl' ? curlExample : jsExample}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* Response Sample code block */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                                        Expected Response
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6.5 w-6.5 rounded-md"
                                        onClick={handleCopyResponse}
                                    >
                                        {copiedResponse ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                                <div className="relative rounded-lg border bg-muted/30 p-3.5 font-mono text-[11px] overflow-x-auto max-h-[150px] scrollbar-thin">
                                    <pre className="text-muted-foreground leading-relaxed">
                                        <code>{responseExample}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolTabWrapper>
    );
}
