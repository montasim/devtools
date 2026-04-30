import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';

export const CHART_COLORS = [
    'hsl(258, 90%, 66%)',
    'hsl(210, 90%, 56%)',
    'hsl(147, 70%, 45%)',
    'hsl(30, 95%, 55%)',
    'hsl(340, 82%, 60%)',
    'hsl(175, 70%, 42%)',
    'hsl(45, 90%, 50%)',
    'hsl(280, 70%, 58%)',
    'hsl(15, 85%, 55%)',
    'hsl(200, 80%, 50%)',
];

export const CHART_COLORS_DARK = [
    'hsl(258, 80%, 72%)',
    'hsl(210, 80%, 65%)',
    'hsl(147, 65%, 55%)',
    'hsl(30, 85%, 62%)',
    'hsl(340, 75%, 68%)',
    'hsl(175, 65%, 52%)',
    'hsl(45, 85%, 58%)',
    'hsl(280, 65%, 66%)',
    'hsl(15, 80%, 62%)',
    'hsl(200, 75%, 58%)',
];

export function useChartColors(isDark: boolean) {
    return isDark ? CHART_COLORS_DARK : CHART_COLORS;
}

const TOOLTIP_STYLE = {
    fontSize: 11,
    borderRadius: 8,
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
};

export function MiniBarChart({
    data,
    colors,
    xLabel,
    yWidth,
}: {
    data: { name: string; value: number }[];
    colors: string[];
    xLabel?: string;
    yWidth?: number;
}) {
    return (
        <ResponsiveContainer width="100%" height={data.length * 28 + 16}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                    type="category"
                    dataKey="name"
                    width={yWidth ?? 80}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                />
                <RechartsTooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ((value: any) => [
                            Number(value ?? 0).toLocaleString(),
                            xLabel || 'Count',
                        ]) as never
                    }
                />
                <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16}>
                    {data.map((_, idx) => (
                        <Cell key={idx} fill={colors[idx % colors.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function MiniDonut({
    data,
    colors,
    xLabel,
}: {
    data: { name: string; value: number }[];
    colors: string[];
    xLabel?: string;
}) {
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="flex items-center gap-3">
            <ResponsiveContainer width="50%" height={Math.min(data.length * 20 + 40, 180)}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_, idx) => (
                            <Cell key={idx} fill={colors[idx % colors.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ((value: any) => [
                                Number(value ?? 0).toLocaleString(),
                                xLabel || 'Count',
                            ]) as never
                        }
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                {data.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                        <span
                            className="shrink-0 h-2 w-2 rounded-full"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        <span className="truncate text-muted-foreground">{d.name}</span>
                        <span className="ml-auto font-medium tabular-nums shrink-0">
                            {d.value.toLocaleString()}
                            <span className="text-muted-foreground font-normal">
                                {' '}
                                ({((d.value / total) * 100).toFixed(0)}%)
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
