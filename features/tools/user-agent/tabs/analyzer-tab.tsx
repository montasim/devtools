'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Monitor, Smartphone, Tablet, Bot, Globe, Cpu, Layers } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { parseUserAgent, COMMON_USER_AGENTS, type UserAgentInfo } from '../utils/user-agent-parser';

interface InfoRowProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
    mono?: boolean;
}

function InfoRow({ label, value, icon, mono }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
            {icon && <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>}
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
                <span
                    className={`text-sm break-all ${mono ? 'font-mono' : ''} ${!value || value === 'Unknown' ? 'text-muted-foreground' : ''}`}
                >
                    {value || 'Unknown'}
                </span>
            </div>
        </div>
    );
}

function DeviceBadge({ info }: { info: UserAgentInfo }) {
    if (info.isBot) {
        return (
            <Badge variant="destructive" className="gap-1">
                <Bot className="h-3 w-3" />
                Bot · {info.botName}
            </Badge>
        );
    }
    if (info.isMobile) {
        return (
            <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Smartphone className="h-3 w-3" />
                Mobile
            </Badge>
        );
    }
    if (info.isTablet) {
        return (
            <Badge className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Tablet className="h-3 w-3" />
                Tablet
            </Badge>
        );
    }
    return (
        <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Monitor className="h-3 w-3" />
            Desktop
        </Badge>
    );
}

export default function AnalyzerTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();

    const info = useMemo(() => parseUserAgent(input), [input]);

    const handleCopy = useCallback(async () => {
        if (!input) return;
        await copy(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, input]);

    const handleSelectPreset = useCallback((ua: string) => {
        setInput(ua);
    }, []);

    const hasResult = input.trim().length > 0;

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste a User-Agent string to analyze..."
                            className="min-h-20 font-mono text-sm resize-none pr-10"
                            spellCheck={false}
                            readOnly={readOnly}
                        />
                        {input && (
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="absolute right-2 top-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                            Common User Agents
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {COMMON_USER_AGENTS.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => handleSelectPreset(preset.ua)}
                                    className="rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {hasResult ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <DeviceBadge info={info} />
                        </div>

                        <div className="grid gap-1 md:grid-cols-2">
                            <div className="rounded-lg border p-3">
                                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                                    <Globe className="h-3.5 w-3.5" />
                                    Browser
                                </h3>
                                <InfoRow label="Name" value={info.browser.name} />
                                <InfoRow label="Version" value={info.browser.version} mono />
                                <InfoRow label="Engine" value={info.browser.engine} />
                            </div>

                            <div className="rounded-lg border p-3">
                                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                                    <Layers className="h-3.5 w-3.5" />
                                    Operating System
                                </h3>
                                <InfoRow label="Name" value={info.os.name} />
                                <InfoRow label="Version" value={info.os.version} mono />
                                <InfoRow label="Architecture" value={info.os.architecture} mono />
                            </div>

                            <div className="rounded-lg border p-3">
                                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                                    <Smartphone className="h-3.5 w-3.5" />
                                    Device
                                </h3>
                                <InfoRow label="Type" value={info.device.type} />
                                <InfoRow label="Brand" value={info.device.brand} />
                                <InfoRow label="Model" value={info.device.model} />
                            </div>

                            <div className="rounded-lg border p-3">
                                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                                    <Cpu className="h-3.5 w-3.5" />
                                    Properties
                                </h3>
                                <InfoRow
                                    label="Is Bot"
                                    value={info.isBot ? `Yes (${info.botName})` : 'No'}
                                />
                                <InfoRow label="Is Mobile" value={info.isMobile ? 'Yes' : 'No'} />
                                <InfoRow label="Is Tablet" value={info.isTablet ? 'Yes' : 'No'} />
                                <InfoRow label="Is Desktop" value={info.isDesktop ? 'Yes' : 'No'} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Monitor className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Enter a User-Agent string
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Paste a user agent above or select a common preset to analyze
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
