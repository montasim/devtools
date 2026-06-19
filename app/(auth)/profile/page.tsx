'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { authClient } from '@/lib/auth/auth-client';
import {
    Share2,
    Bookmark,
    Link as LinkIcon,
    Eye,
    Mail,
    CheckCircle2,
    XCircle,
    LogOut,
    Calendar,
    TrendingUp,
    ChevronRight,
    Loader2,
    Pencil
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import ProfileLoading from './loading';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export default function ProfilePage() {
    const { isLoading, isAuthenticated, user, updateName, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: sessionData } = authClient.useSession();

    const [isMounted, setIsMounted] = useState(false);
    const [stats, setStats] = useState<{
        sharesCount: number;
        savedCount: number;
        urlsCount: number;
        totalViews: number;
        chartData: any[];
        breakdownData: any[];
    } | null>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            const redirectUrl = searchParams.toString()
                ? `${pathname}?${searchParams.toString()}`
                : pathname;
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }

        async function fetchStats() {
            try {
                const [sharesRes, savedRes, urlsRes] = await Promise.all([
                    apiClient.get<any[]>('/api/shares'),
                    apiClient.get<any[]>('/api/saved'),
                    apiClient.get<any[]>('/api/url/list'),
                ]);

                const shares = sharesRes.ok ? (sharesRes.data || []) : [];
                const saved = savedRes.ok ? (savedRes.data || []) : [];
                const urls = urlsRes.ok ? (urlsRes.data || []) : [];

                const sharesCount = shares.length;
                const savedCount = saved.length;
                const urlsCount = urls.length;

                const totalViews = shares.reduce((acc, curr) => acc + (curr.viewCount || 0), 0) +
                    urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

                // Group by date for activity chart (last 7 days)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const chartData = last7Days.map(date => {
                    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const sharesCountForDate = shares.filter(item => item.createdAt.split('T')[0] === date).length;
                    const savedCountForDate = saved.filter(item => item.createdAt.split('T')[0] === date).length;
                    const urlsCountForDate = urls.filter(item => item.createdAt.split('T')[0] === date).length;
                    return {
                        date: formattedDate,
                        'Shared Links': sharesCountForDate,
                        'Saved Items': savedCountForDate,
                        'Shortened URLs': urlsCountForDate,
                    };
                });

                const breakdownData = [
                    { name: 'Shared Links', value: sharesCount, color: '#10b981' },
                    { name: 'Saved Items', value: savedCount, color: '#3b82f6' },
                    { name: 'Shortened URLs', value: urlsCount, color: '#f59e0b' },
                ].filter(item => item.value > 0);

                setStats({
                    sharesCount,
                    savedCount,
                    urlsCount,
                    totalViews,
                    chartData,
                    breakdownData: breakdownData.length > 0 ? breakdownData : [
                        { name: 'Shared Links', value: 0, color: '#10b981' },
                        { name: 'Saved Items', value: 0, color: '#3b82f6' },
                        { name: 'Shortened URLs', value: 0, color: '#f59e0b' },
                    ],
                });
            } catch (error) {
                console.error('Failed to fetch statistics:', error);
            }
        }

        fetchStats();
    }, [isLoading, isAuthenticated, router]);

    async function handleUpdateName(name: string) {
        const success = await updateName(name);
        if (success) {
            toast.success('Name updated successfully');
        } else {
            toast.error('Failed to update name');
            throw new Error('Failed');
        }
    }

    async function saveName(e: React.FormEvent) {
        e.preventDefault();
        if (!nameDraft.trim()) return;
        setIsSavingName(true);
        try {
            await handleUpdateName(nameDraft.trim());
            setIsEditingName(false);
        } catch {
            // Error is handled in handleUpdateName
        } finally {
            setIsSavingName(false);
        }
    }

    async function handleLogout() {
        try {
            await logout();
            toast.success('Logged out successfully');
            router.push('/');
        } catch {
            toast.error('Failed to logout');
        }
    }

    if (isLoading || !isMounted || !stats) {
        return <ProfileLoading />;
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const joinedDate = sessionData?.user?.createdAt
        ? new Date(sessionData.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    const userInitials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="min-h-screen py-10 bg-background text-foreground">
            <div className="">

                {/* 1. Header Profile Banner Card */}
                <div className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
                    <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary border border-primary/20 shadow-inner">
                                {userInitials}
                            </div>
                            <div>
                                {isEditingName ? (
                                    <form onSubmit={saveName} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={nameDraft}
                                            onChange={(e) => setNameDraft(e.target.value)}
                                            className="h-8 px-2 py-0.5 text-xl font-bold rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-w-[200px]"
                                            disabled={isSavingName}
                                            autoFocus
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSavingName}
                                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 disabled:opacity-50 transition border border-emerald-500/20"
                                            title="Save name"
                                        >
                                            {isSavingName ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingName(false)}
                                            disabled={isSavingName}
                                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground disabled:opacity-50 transition border border-border"
                                            title="Cancel"
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                        </button>
                                    </form>
                                ) : (
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 group">
                                        {user.name}
                                        <button
                                            onClick={() => {
                                                setNameDraft(user.name || '');
                                                setIsEditingName(true);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg hover:bg-muted text-muted-foreground transition border border-transparent hover:border-border"
                                            aria-label="Edit name"
                                            title="Edit name"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </h1>
                                )}
                                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" /> {user.email}
                                    </span>
                                    {user.emailVerified ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            <CheckCircle2 className="h-3 w-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive border border-destructive/20">
                                            <XCircle className="h-3 w-3" /> Unverified
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                    <Calendar className="h-3.5 w-3.5" /> Joined {joinedDate}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-lg border bg-background hover:bg-muted text-destructive hover:text-destructive px-4 py-2 text-sm font-medium transition shadow-sm"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Dashboard Metrics Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">

                    {/* Metric 1: Shared Links */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground font-medium">Shared Links</span>
                            <h3 className="text-2xl font-bold">{stats.sharesCount}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                            <Share2 className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Metric 2: Saved Items */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground font-medium">Saved Items</span>
                            <h3 className="text-2xl font-bold">{stats.savedCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                            <Bookmark className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Metric 3: Shortened URLs */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground font-medium">Shortened URLs</span>
                            <h3 className="text-2xl font-bold">{stats.urlsCount}</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Metric 4: Total Views/Traffic */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground font-medium">Total Clicks/Views</span>
                            <h3 className="text-2xl font-bold">{stats.totalViews}</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>

                </div>

                {/* 3. Graph and Breakdown Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Activity Chart (Left Column, larger) */}
                    <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Creation Activity</h3>
                                <p className="text-xs text-muted-foreground">Resources created over the last 7 days</p>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                                <TrendingUp className="h-3.5 w-3.5" /> Active
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorUrls" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                                    <XAxis dataKey="date" tickLine={false} className="text-xs fill-muted-foreground" />
                                    <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-3 shadow-md">
                                                        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                                                        <div className="mt-2 space-y-1">
                                                            {payload.map((p: any) => (
                                                                <p key={p.name} className="text-xs font-medium" style={{ color: p.color }}>
                                                                    {p.name}: <span className="font-bold text-foreground">{p.value}</span>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="Shared Links" stroke="#10b981" fillOpacity={1} fill="url(#colorShares)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="Saved Items" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSaved)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="Shortened URLs" stroke="#f59e0b" fillOpacity={1} fill="url(#colorUrls)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Breakdown Chart (Right Column, smaller) */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Content Breakdown</h3>
                            <p className="text-xs text-muted-foreground mb-4">Distribution of items created</p>
                        </div>

                        <div className="h-56 w-full flex items-center justify-center">
                            {stats.sharesCount === 0 && stats.savedCount === 0 && stats.urlsCount === 0 ? (
                                <p className="text-sm text-muted-foreground">No resources created yet</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.breakdownData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {stats.breakdownData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-md text-xs font-medium">
                                                            <span style={{ color: payload[0].payload.color }}>
                                                                {payload[0].name}: <strong>{payload[0].value}</strong>
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="space-y-2 mt-4">
                            {stats.breakdownData.map((item, idx) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
