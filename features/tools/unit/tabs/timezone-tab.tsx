'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToolActions } from '../../core/hooks/use-tool-actions';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { ShareSidebarModal } from '../../core/plugins/share-sidebar';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, ChevronsUpDown } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { TabComponentProps } from '../../core/types/tool';
import {
    POPULAR_TIMEZONES,
    getAllTimezones,
    formatTimeInZone,
    formatTimeISO,
    getTimezoneOffsetLabel,
    type TzInfo,
} from '../utils/unit-operations';

interface TzState {
    inputDateTime: string;
    sourceTz: string;
    targetTz: string;
}

const DEFAULT_TZ_STATE: TzState = {
    inputDateTime: '',
    sourceTz: 'UTC',
    targetTz: 'America/New_York',
};

function toLocalDatetimeString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TzCombobox({
    value,
    onSelect,
    sourceDate,
    disabled,
}: {
    value: string;
    onSelect: (tzId: string) => void;
    sourceDate: Date;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const allTimezones = useMemo(() => getAllTimezones(), []);
    const popularIds = useMemo(() => new Set(POPULAR_TIMEZONES.map((t) => t.id)), []);
    const otherTimezones = useMemo(
        () => allTimezones.filter((t) => !popularIds.has(t.id)),
        [allTimezones, popularIds],
    );

    const currentOffset = getTimezoneOffsetLabel(value, sourceDate);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between h-auto py-2 font-normal"
                >
                    <span className="flex flex-col items-start gap-0.5 truncate">
                        <span className="text-sm font-medium truncate">
                            {value.replace(/_/g, ' ').replace(/\//g, ' / ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {currentOffset}
                        </span>
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search timezone..." />
                    <CommandList>
                        <CommandEmpty>No timezone found.</CommandEmpty>
                        <CommandGroup heading="Popular">
                            {POPULAR_TIMEZONES.map((tz) => (
                                <TzCommandItem
                                    key={tz.id}
                                    tz={tz}
                                    isSelected={tz.id === value}
                                    sourceDate={sourceDate}
                                    onSelect={(id) => {
                                        onSelect(id);
                                        setOpen(false);
                                    }}
                                />
                            ))}
                        </CommandGroup>
                        {otherTimezones.length > 0 && (
                            <CommandGroup heading="All Timezones">
                                {otherTimezones.map((tz) => (
                                    <TzCommandItem
                                        key={tz.id}
                                        tz={tz}
                                        isSelected={tz.id === value}
                                        sourceDate={sourceDate}
                                        onSelect={(id) => {
                                            onSelect(id);
                                            setOpen(false);
                                        }}
                                    />
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function TzCommandItem({
    tz,
    isSelected,
    sourceDate,
    onSelect,
}: {
    tz: TzInfo;
    isSelected: boolean;
    sourceDate: Date;
    onSelect: (id: string) => void;
}) {
    return (
        <CommandItem
            value={`${tz.id} ${tz.label} ${tz.offset}`}
            onSelect={() => onSelect(tz.id)}
            className={cn(
                'data-selected:bg-transparent! hover:bg-primary/10',
                isSelected && 'bg-primary/10',
            )}
        >
            <span className="flex items-center gap-2 w-full">
                <span className="text-[11px] font-mono w-14 shrink-0 text-muted-foreground">
                    {getTimezoneOffsetLabel(tz.id, sourceDate)}
                </span>
                <span className="flex-1 truncate text-sm">{tz.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </span>
        </CommandItem>
    );
}

export default function TimezoneTab({ readOnly }: TabComponentProps) {
    const [savedState, setSavedState] = useLocalStorage<TzState>(
        STORAGE_KEYS.UNIT_TIMEZONE_STATE,
        DEFAULT_TZ_STATE,
    );
    const [state, setState] = useState<TzState>(() => ({
        ...savedState,
        inputDateTime: savedState.inputDateTime || toLocalDatetimeString(new Date()),
    }));
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
    const { copy } = useClipboard();

    useEffect(() => {
        setSavedState(state);
    }, [state, setSavedState]);

    const sourceDate = useMemo(() => {
        if (!state.inputDateTime) return new Date();
        try {
            const d = new Date(state.inputDateTime);
            if (isNaN(d.getTime())) return new Date();
            return d;
        } catch {
            return new Date();
        }
    }, [state.inputDateTime]);

    const sourceFormatted = useMemo(
        () => formatTimeInZone(sourceDate, state.sourceTz),
        [sourceDate, state.sourceTz],
    );
    const targetFormatted = useMemo(
        () => formatTimeInZone(sourceDate, state.targetTz),
        [sourceDate, state.targetTz],
    );
    const sourceOffset = useMemo(
        () => getTimezoneOffsetLabel(state.sourceTz, sourceDate),
        [state.sourceTz, sourceDate],
    );
    const targetOffset = useMemo(
        () => getTimezoneOffsetLabel(state.targetTz, sourceDate),
        [state.targetTz, sourceDate],
    );
    const sourceIso = useMemo(
        () => formatTimeISO(sourceDate, state.sourceTz),
        [sourceDate, state.sourceTz],
    );
    const targetIso = useMemo(
        () => formatTimeISO(sourceDate, state.targetTz),
        [sourceDate, state.targetTz],
    );

    const handleCopy = useCallback(
        async (text: string, id: string) => {
            await copy(text);
            setCopiedIdx(id);
            setTimeout(() => setCopiedIdx(null), 1500);
        },
        [copy],
    );

    const handleClear = useCallback(() => {
        setState({
            ...DEFAULT_TZ_STATE,
            inputDateTime: toLocalDatetimeString(new Date()),
        });
    }, []);

    const handleNow = useCallback(() => {
        setState((prev) => ({
            ...prev,
            inputDateTime: toLocalDatetimeString(new Date()),
        }));
    }, []);

    const contentStr = `${state.sourceTz}: ${sourceFormatted}\n${state.targetTz}: ${targetFormatted}`;

    const { actions } = useToolActions({
        pageName: 'unit',
        tabId: 'timezone',
        getContent: () => contentStr,
        onClear: handleClear,
        shareDialogOpen: shareOpen,
        setShareDialogOpen: setShareOpen,
        readOnly,
    });

    return (
        <ToolTabWrapper
            actions={actions}
            leadingContent={
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={handleNow}
                    disabled={readOnly}
                >
                    Now
                </Button>
            }
        >
            <div className="flex flex-col gap-6 py-4 md:flex-row">
                <div className="min-w-0 w-full md:w-[340px] shrink-0 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Date & Time
                        </Label>
                        <Input
                            type="datetime-local"
                            value={state.inputDateTime}
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    inputDateTime: e.target.value,
                                }))
                            }
                            className="h-10 font-mono text-sm"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Source Timezone
                        </Label>
                        <TzCombobox
                            value={state.sourceTz}
                            onSelect={(id) => setState((prev) => ({ ...prev, sourceTz: id }))}
                            sourceDate={sourceDate}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Target Timezone
                        </Label>
                        <TzCombobox
                            value={state.targetTz}
                            onSelect={(id) => setState((prev) => ({ ...prev, targetTz: id }))}
                            sourceDate={sourceDate}
                            disabled={readOnly}
                        />
                    </div>
                </div>

                <div className="min-w-0 flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            Conversion Result
                        </Label>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-3">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                                        {state.sourceTz.replace(/_/g, ' ')} ({sourceOffset})
                                    </span>
                                    <code className="font-mono text-sm select-all">
                                        {sourceFormatted}
                                    </code>
                                    <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                        {sourceIso}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="shrink-0"
                                    onClick={() => handleCopy(sourceFormatted, 'source')}
                                >
                                    {copiedIdx === 'source' ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border px-3 py-3">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                                        {state.targetTz.replace(/_/g, ' ')} ({targetOffset})
                                    </span>
                                    <code className="font-mono text-sm select-all">
                                        {targetFormatted}
                                    </code>
                                    <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                        {targetIso}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="shrink-0"
                                    onClick={() => handleCopy(targetFormatted, 'target')}
                                >
                                    {copiedIdx === 'target' ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border p-3">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            World Clock
                        </Label>
                        <div className="flex flex-col gap-1">
                            {POPULAR_TIMEZONES.map((tz) => (
                                <div
                                    key={tz.id}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5"
                                >
                                    <span className="text-[11px] text-muted-foreground w-8 shrink-0 font-mono">
                                        {getTimezoneOffsetLabel(tz.id, sourceDate)}
                                    </span>
                                    <span className="text-[11px] font-medium flex-1 truncate">
                                        {tz.label}
                                    </span>
                                    <code className="text-[11px] font-mono text-muted-foreground">
                                        {formatTimeInZone(sourceDate, tz.id)}
                                    </code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ShareSidebarModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                config={{
                    pageName: 'unit',
                    tabName: 'timezone',
                    getState: () => state as unknown as Record<string, unknown>,
                    extraActions: [
                        {
                            id: 'copy-source',
                            label: 'Copy Source Time',
                            icon: Copy,
                            handler: () => copy(sourceFormatted),
                        },
                        {
                            id: 'copy-target',
                            label: 'Copy Target Time',
                            icon: Copy,
                            handler: () => copy(targetFormatted),
                        },
                    ],
                }}
            />
        </ToolTabWrapper>
    );
}
