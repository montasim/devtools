'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Copy,
    Check,
    AlertCircle,
    Play,
    RotateCcw,
    CalendarClock,
    Info,
    Sparkles,
    Pencil,
} from 'lucide-react';
import {
    CRON_FIELDS,
    PRESETS,
    MONTH_NAMES,
    DAY_SHORT,
    configToExpression,
    fieldConfigToExpression,
    parseExpression,
    describeExpression,
    getNextRuns,
    isValidCronExpression,
    getDefaultConfig,
    getDefaultFieldConfig,
    type CronConfig,
    type CronFieldConfig,
    type FieldMode,
} from '../utils/cron-operations';
import type { TabComponentProps } from '../../core/types/tool';

const FIELD_MODES: { value: FieldMode; label: string }[] = [
    { value: 'every', label: 'Every' },
    { value: 'specific', label: 'Specific' },
    { value: 'range', label: 'Range' },
    { value: 'step', label: 'Step' },
    { value: 'custom', label: 'Custom' },
];

const FIELD_COLORS = [
    'bg-chart-1/10 text-chart-1',
    'bg-chart-2/10 text-chart-2',
    'bg-chart-3/10 text-chart-3',
    'bg-chart-4/10 text-chart-4',
    'bg-chart-5/10 text-chart-5',
];

export default function BuilderTab({ readOnly }: TabComponentProps) {
    const [config, setConfig] = useLocalStorage<CronConfig>(
        STORAGE_KEYS.CRON_BUILDER_CONFIG,
        getDefaultConfig(),
    );
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [manualExpression, setManualExpression] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const { copy } = useClipboard();

    const expression = useMemo(() => configToExpression(config), [config]);
    const validation = useMemo(() => isValidCronExpression(expression), [expression]);
    const description = useMemo(() => describeExpression(config), [config]);
    const nextRuns = useMemo(() => {
        if (!validation.valid) return [];
        return getNextRuns(expression, 6);
    }, [expression, validation.valid]);

    const handleCopy = useCallback(
        async (value: string, field: string) => {
            await copy(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        },
        [copy],
    );

    const handlePreset = useCallback(
        (presetExpression: string) => {
            setConfig(parseExpression(presetExpression));
            setIsManualMode(false);
        },
        [setConfig],
    );

    const handleManualApply = useCallback(() => {
        const v = isValidCronExpression(manualExpression);
        if (v.valid) {
            setConfig(parseExpression(manualExpression));
            setIsManualMode(false);
        }
    }, [manualExpression, setConfig]);

    const handleReset = useCallback(() => {
        setConfig(getDefaultConfig());
        setIsManualMode(false);
        setManualExpression('* * * * *');
    }, [setConfig]);

    const updateField = useCallback(
        (key: string, updates: Partial<CronFieldConfig>) => {
            setConfig((prev) => ({
                ...prev,
                [key]: {
                    ...(prev[key] ??
                        getDefaultFieldConfig(CRON_FIELDS.find((f) => f.key === key)!)),
                    ...updates,
                },
            }));
        },
        [setConfig],
    );

    const toggleValue = useCallback(
        (key: string, value: number) => {
            setConfig((prev) => {
                const field = prev[key];
                const values = field.values.includes(value)
                    ? field.values.filter((v) => v !== value)
                    : [...field.values, value];
                return { ...prev, [key]: { ...field, values } };
            });
        },
        [setConfig],
    );

    const formatRelative = (date: Date): string => {
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m from now`;
        if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
        return `${diffDays}d ${diffHours % 24}h`;
    };

    const expressionParts = expression.split(' ');

    return (
        <ToolTabWrapper
            actions={
                readOnly
                    ? undefined
                    : [
                          {
                              id: 'reset',
                              label: 'Reset',
                              icon: RotateCcw,
                              onClick: handleReset,
                              variant: 'outline' as const,
                              className:
                                  'bg-destructive/10 text-destructive hover:bg-destructive/20',
                          },
                      ]
            }
        >
            <div className="flex flex-col gap-6 py-4">
                {/* ── Expression Display ── */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Expression</h3>
                        {validation.valid && (
                            <Badge variant="outline" className="text-primary gap-1 h-5">
                                <Check className="h-2.5 w-2.5" />
                                Valid
                            </Badge>
                        )}
                        {!validation.valid && (
                            <Badge variant="outline" className="text-destructive gap-1 h-5">
                                <AlertCircle className="h-2.5 w-2.5" />
                                Invalid
                            </Badge>
                        )}
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                        {isManualMode ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <code className="text-xs text-muted-foreground shrink-0">
                                        crontab
                                    </code>
                                    <Input
                                        value={manualExpression}
                                        onChange={(e) => setManualExpression(e.target.value)}
                                        className="h-9 font-mono text-sm flex-1"
                                        placeholder="* * * * *"
                                        spellCheck={false}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isValidCronExpression(manualExpression).valid && (
                                        <span className="flex items-center gap-1 text-xs text-destructive flex-1">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            {isValidCronExpression(manualExpression).error}
                                        </span>
                                    )}
                                    <div className="flex gap-2 ml-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => setIsManualMode(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs"
                                            onClick={handleManualApply}
                                            disabled={
                                                !isValidCronExpression(manualExpression).valid
                                            }
                                        >
                                            <Play className="h-3 w-3" />
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 flex-1">
                                        <code className="text-xs text-muted-foreground shrink-0">
                                            crontab
                                        </code>
                                        <div className="flex items-center gap-1 bg-muted/60 rounded-lg px-3 py-2 flex-1">
                                            {CRON_FIELDS.map((field, i) => (
                                                <TooltipProvider key={field.key}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 font-mono text-sm font-semibold cursor-default ${FIELD_COLORS[i]}`}
                                                            >
                                                                {expressionParts[i] ?? '*'}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom">
                                                            {field.label}:{' '}
                                                            {fieldConfigToExpression(
                                                                config[field.key] ??
                                                                    getDefaultFieldConfig(field),
                                                                field,
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => handleCopy(expression, 'expr')}
                                    >
                                        {copiedField === 'expr' ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-primary h-8 gap-1.5 text-xs shrink-0"
                                        onClick={() => {
                                            setManualExpression(expression);
                                            setIsManualMode(true);
                                        }}
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Edit
                                    </Button>
                                </div>

                                {description && (
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                                        <span>{description}</span>
                                    </div>
                                )}

                                {!validation.valid && validation.error && (
                                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                                        <AlertCircle className="h-3 w-3" />
                                        {validation.error}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Presets ── */}
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Presets</h3>
                        <span className="text-[10px] text-muted-foreground">Click to apply</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {PRESETS.map((preset) => {
                            const isActive = expression === preset.expression;
                            return (
                                <TooltipProvider key={preset.expression}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => handlePreset(preset.expression)}
                                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                                                    isActive
                                                        ? 'border-primary/50 bg-primary/10 text-primary shadow-sm'
                                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <code className="font-mono">{preset.expression}</code>
                                            <span className="mx-1.5 text-muted-foreground">—</span>
                                            {preset.description}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                </div>

                {/* ── Two-column: Fields + Next Runs ── */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Field Configuration */}
                    <div className="min-w-0 w-full lg:w-[58%]">
                        <div className="flex items-center gap-2 mb-2.5">
                            <h3 className="text-sm font-semibold">Field Configuration</h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                        Each section controls one field in the cron expression.
                                        Choose a mode and set the value.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex flex-col gap-2">
                            {CRON_FIELDS.map((field, fieldIdx) => {
                                const cfg = config[field.key] ?? getDefaultFieldConfig(field);
                                const fieldExpr = fieldConfigToExpression(cfg, field);
                                return (
                                    <div key={field.key} className="rounded-xl border bg-card">
                                        <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/20 rounded-t-xl">
                                            <span
                                                className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-bold ${FIELD_COLORS[fieldIdx]}`}
                                            >
                                                {fieldIdx + 1}
                                            </span>
                                            <span className="text-xs font-semibold">
                                                {field.label}
                                            </span>
                                            <code className="ml-auto text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                                                {fieldExpr}
                                            </code>
                                        </div>
                                        <div className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={cfg.mode}
                                                    onValueChange={(value) =>
                                                        updateField(field.key, {
                                                            mode: value as FieldMode,
                                                            values: [],
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger
                                                        size="sm"
                                                        className="w-[120px] text-xs"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {FIELD_MODES.map((mode) => (
                                                            <SelectItem
                                                                key={mode.value}
                                                                value={mode.value}
                                                            >
                                                                {mode.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {cfg.mode === 'range' && (
                                                    <div className="flex items-center gap-1.5 flex-1">
                                                        <Input
                                                            type="number"
                                                            min={field.min}
                                                            max={field.max}
                                                            value={cfg.rangeStart}
                                                            onChange={(e) =>
                                                                updateField(field.key, {
                                                                    rangeStart: Number(
                                                                        e.target.value,
                                                                    ),
                                                                })
                                                            }
                                                            className="h-7 w-20 text-xs font-mono"
                                                        />
                                                        <span className="text-muted-foreground text-xs">
                                                            to
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min={field.min}
                                                            max={field.max}
                                                            value={cfg.rangeEnd}
                                                            onChange={(e) =>
                                                                updateField(field.key, {
                                                                    rangeEnd: Number(
                                                                        e.target.value,
                                                                    ),
                                                                })
                                                            }
                                                            className="h-7 w-20 text-xs font-mono"
                                                        />
                                                    </div>
                                                )}

                                                {cfg.mode === 'step' && (
                                                    <div className="flex items-center gap-1.5 flex-1 text-xs">
                                                        <span className="text-muted-foreground shrink-0">
                                                            Start
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min={field.min}
                                                            max={field.max}
                                                            value={cfg.stepFrom}
                                                            onChange={(e) =>
                                                                updateField(field.key, {
                                                                    stepFrom: Number(
                                                                        e.target.value,
                                                                    ),
                                                                })
                                                            }
                                                            className="h-7 w-16 text-xs font-mono"
                                                        />
                                                        <span className="text-muted-foreground shrink-0">
                                                            every
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={field.max - field.min + 1}
                                                            value={cfg.stepValue}
                                                            onChange={(e) =>
                                                                updateField(field.key, {
                                                                    stepValue: Number(
                                                                        e.target.value,
                                                                    ),
                                                                })
                                                            }
                                                            className="h-7 w-16 text-xs font-mono"
                                                        />
                                                    </div>
                                                )}

                                                {cfg.mode === 'custom' && (
                                                    <Input
                                                        value={cfg.customValue}
                                                        onChange={(e) =>
                                                            updateField(field.key, {
                                                                customValue: e.target.value,
                                                            })
                                                        }
                                                        className="h-7 flex-1 text-xs font-mono max-w-[200px]"
                                                        placeholder="*"
                                                        spellCheck={false}
                                                    />
                                                )}

                                                {cfg.mode === 'specific' &&
                                                    cfg.values.length > 0 && (
                                                        <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                                                            {cfg.values.length} selected
                                                        </span>
                                                    )}
                                            </div>

                                            {cfg.mode === 'specific' && (
                                                <div className="flex flex-wrap gap-1 mt-2 max-h-28 overflow-y-auto">
                                                    {Array.from(
                                                        { length: field.max - field.min + 1 },
                                                        (_, i) => {
                                                            const val = field.min + i;
                                                            const label =
                                                                field.key === 'month'
                                                                    ? MONTH_NAMES[val - 1]?.slice(
                                                                          0,
                                                                          3,
                                                                      )
                                                                    : field.key === 'dayOfWeek'
                                                                      ? DAY_SHORT[val]
                                                                      : String(val);
                                                            const isActive =
                                                                cfg.values.includes(val);
                                                            return (
                                                                <button
                                                                    key={val}
                                                                    onClick={() =>
                                                                        toggleValue(field.key, val)
                                                                    }
                                                                    className={`rounded-md px-2 py-1 text-[11px] font-mono transition-all ${
                                                                        isActive
                                                                            ? `border border-primary/50 ${FIELD_COLORS[fieldIdx]} shadow-sm`
                                                                            : 'border border-transparent text-muted-foreground hover:bg-muted/60'
                                                                    }`}
                                                                >
                                                                    {label}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Runs */}
                    <div className="min-w-0 w-full lg:w-[42%]">
                        <div className="flex items-center gap-2 mb-2.5">
                            <h3 className="text-sm font-semibold">Next Executions</h3>
                            {nextRuns.length > 0 && (
                                <span className="text-[10px] text-muted-foreground">
                                    Click to copy ISO date
                                </span>
                            )}
                        </div>
                        {nextRuns.length > 0 ? (
                            <div className="rounded-xl border bg-card overflow-hidden">
                                <div className="grid grid-cols-[1fr_1fr_90px] gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/20 border-b">
                                    <span>Date</span>
                                    <span>Time</span>
                                    <span className="text-right">Countdown</span>
                                </div>
                                <div className="divide-y">
                                    {nextRuns.map((run, i) => {
                                        const dateStr = run.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                        const timeStr = run.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true,
                                        });
                                        return (
                                            <button
                                                key={i}
                                                onClick={() =>
                                                    handleCopy(run.toISOString(), `run-${i}`)
                                                }
                                                className="grid grid-cols-[1fr_1fr_90px] gap-2 px-4 py-3 items-center text-left transition-colors hover:bg-muted/30 w-full group"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium">
                                                        {dateStr}
                                                    </span>
                                                    {i === 0 && (
                                                        <span className="text-[10px] text-primary font-medium">
                                                            Next run
                                                        </span>
                                                    )}
                                                </div>
                                                <code className="text-xs font-mono text-muted-foreground">
                                                    {timeStr}
                                                </code>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {formatRelative(run)}
                                                    </span>
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {copiedField === `run-${i}` ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3 text-muted-foreground" />
                                                        )}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-52 flex flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
                                <CalendarClock className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No upcoming runs
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Configure a valid cron expression to preview executions
                                </p>
                            </div>
                        )}

                        {/* Quick Reference Card */}
                        <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                            <h4 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                Quick Reference
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                                        Syntax
                                    </span>
                                    <div className="flex flex-col gap-0.5 font-mono text-[10px]">
                                        <span>
                                            <code className="text-primary">*</code> Any value
                                        </span>
                                        <span>
                                            <code className="text-primary">,</code> Value list
                                        </span>
                                        <span>
                                            <code className="text-primary">-</code> Range
                                        </span>
                                        <span>
                                            <code className="text-primary">/</code> Step
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                                        Field Order
                                    </span>
                                    <div className="flex flex-col gap-0.5 text-[10px]">
                                        {CRON_FIELDS.map((f, i) => (
                                            <span key={f.key} className="flex items-center gap-1">
                                                <span
                                                    className={`inline-flex items-center justify-center rounded px-1 py-px text-[9px] font-bold leading-none ${FIELD_COLORS[i]}`}
                                                >
                                                    {i + 1}
                                                </span>
                                                {f.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'cron',
                    tabName: 'builder',
                    getState: () => ({ config, expression }),
                    extraActions: [
                        {
                            id: 'copy-expression',
                            label: 'Copy Expression',
                            icon: Copy,
                            handler: () => copy(expression, 'Cron expression copied'),
                        },
                    ],
                }}
            />
        </ToolTabWrapper>
    );
}
