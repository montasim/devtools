'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Plus, X, Search, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import rawCountries from '../data/countries.json';

type Country = { code: string; name: string; timezones: string[] };

const CAPITALS: { label: string; timezone: string }[] = [
    { label: 'Dhaka, Bangladesh', timezone: 'Asia/Dhaka' },
    { label: 'Riyadh, Saudi Arabia', timezone: 'Asia/Riyadh' },
    { label: 'Islamabad, Pakistan', timezone: 'Asia/Karachi' },
    { label: 'New Delhi, India', timezone: 'Asia/Kolkata' },
    { label: 'Kabul, Afghanistan', timezone: 'Asia/Kabul' },
    { label: 'Washington D.C., USA', timezone: 'America/New_York' },
    { label: 'Moscow, Russia', timezone: 'Europe/Moscow' },
    { label: 'Beijing, China', timezone: 'Asia/Shanghai' },
];

const POPULAR_CITIES: { label: string; timezone: string }[] = [
    { label: 'New York', timezone: 'America/New_York' },
    { label: 'London', timezone: 'Europe/London' },
    { label: 'Tokyo', timezone: 'Asia/Tokyo' },
    { label: 'Sydney', timezone: 'Australia/Sydney' },
    { label: 'Dubai', timezone: 'Asia/Dubai' },
    { label: 'Paris', timezone: 'Europe/Paris' },
    { label: 'Singapore', timezone: 'Asia/Singapore' },
    { label: 'Los Angeles', timezone: 'America/Los_Angeles' },
    { label: 'Mumbai', timezone: 'Asia/Kolkata' },
    { label: 'Berlin', timezone: 'Europe/Berlin' },
    { label: 'São Paulo', timezone: 'America/Sao_Paulo' },
    { label: 'Shanghai', timezone: 'Asia/Shanghai' },
];

function getTimeOfDayColor(hour: number) {
    if (hour >= 6 && hour < 8) return 'text-orange-500';
    if (hour >= 8 && hour < 18) return 'text-amber-500';
    if (hour >= 18 && hour < 20) return 'text-orange-600';
    return 'text-indigo-500';
}

function ClockCard({
    timezone,
    label,
    onRemove,
}: {
    timezone: string;
    label: string;
    onRemove?: () => void;
}) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatter = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }),
        [timezone],
    );

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            }),
        [timezone],
    );

    const hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
    }).format(now);
    const hour = parseInt(hourStr, 10);

    const offsetFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'shortOffset',
            }),
        [timezone],
    );

    const parts = offsetFormatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName');
    const offset = offsetPart?.value ?? '';

    const timeOfDay =
        hour >= 6 && hour < 8
            ? 'sunrise'
            : hour >= 8 && hour < 18
              ? 'day'
              : hour >= 18 && hour < 20
                ? 'sunset'
                : 'night';
    const iconClass = `h-4 w-4 shrink-0 ${getTimeOfDayColor(hour)}`;

    return (
        <div className="rounded-xl border bg-background p-4 relative group">
            {onRemove && (
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {timeOfDay === 'sunrise' && <Sunrise className={iconClass} />}
                        {timeOfDay === 'day' && <Sun className={iconClass} />}
                        {timeOfDay === 'sunset' && <Sunset className={iconClass} />}
                        {timeOfDay === 'night' && <Moon className={iconClass} />}
                        <span className="font-semibold text-sm truncate">{label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                        {timezone}
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-xl font-mono font-semibold tabular-nums">
                        {formatter.format(now)}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                            {dateFormatter.format(now)}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                            {offset}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WorldClockTab({ readOnly }: TabComponentProps) {
    const [selected, setSelected] = useState<{ label: string; timezone: string }[]>([...CAPITALS]);
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    const countries = rawCountries as Country[];

    const allOptions = useMemo(() => {
        const opts: { label: string; timezone: string }[] = [];
        for (const city of CAPITALS) {
            opts.push(city);
        }
        for (const city of POPULAR_CITIES) {
            if (!opts.find((o) => o.timezone === city.timezone)) {
                opts.push(city);
            }
        }
        for (const country of countries) {
            for (const tz of country.timezones) {
                const cityPart = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
                const label = `${cityPart}, ${country.name}`;
                if (!opts.find((o) => o.timezone === tz)) {
                    opts.push({ label, timezone: tz });
                }
            }
        }
        return opts;
    }, [countries]);

    const filteredOptions = useMemo(() => {
        if (!search.trim()) return allOptions.slice(0, 20);
        const q = search.toLowerCase();
        return allOptions
            .filter(
                (o) => o.label.toLowerCase().includes(q) || o.timezone.toLowerCase().includes(q),
            )
            .slice(0, 20);
    }, [allOptions, search]);

    const selectedTimezones = useMemo(() => new Set(selected.map((s) => s.timezone)), [selected]);

    const handleAdd = useCallback(
        (option: { label: string; timezone: string }) => {
            if (selectedTimezones.has(option.timezone)) return;
            setSelected((prev) => [...prev, option]);
            setSearch('');
            setShowPicker(false);
        },
        [selectedTimezones],
    );

    const handleRemove = useCallback((timezone: string) => {
        setSelected((prev) => prev.filter((s) => s.timezone !== timezone));
    }, []);

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">World Clock</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                        {selected.length} cities
                    </Badge>
                </div>

                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setShowPicker(true);
                                }}
                                onFocus={() => setShowPicker(true)}
                                placeholder="Search city or timezone to add..."
                                className="h-9 pl-8 text-sm"
                                spellCheck={false}
                                readOnly={readOnly}
                                autoComplete="off"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5"
                            onClick={() => setShowPicker(!showPicker)}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </Button>
                    </div>

                    {showPicker && (
                        <div className="absolute z-50 top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-60 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => {
                                    const isSelected = selectedTimezones.has(option.timezone);
                                    return (
                                        <button
                                            key={option.timezone}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                                                isSelected ? 'opacity-50' : ''
                                            }`}
                                            onClick={() => handleAdd(option)}
                                            disabled={isSelected}
                                        >
                                            <div className="min-w-0">
                                                <span className="truncate">{option.label}</span>
                                                <span className="text-xs text-muted-foreground ml-2 font-mono">
                                                    {option.timezone}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-1.5 py-0"
                                                >
                                                    Added
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    No matching timezones
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {showPicker && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    {selected.map((s) => (
                        <ClockCard
                            key={s.timezone}
                            timezone={s.timezone}
                            label={s.label}
                            onRemove={() => handleRemove(s.timezone)}
                        />
                    ))}
                </div>

                {selected.length === 0 && (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No cities added</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Search and add cities to see their current time
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
