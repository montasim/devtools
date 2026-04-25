'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    CommandDialog,
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
} from '@/components/ui/command';
import { navigationMenu, authButtons } from '@/config/navigation';
import { useToolActionsContext } from '@/features/tools/core/context/tool-actions-context';
import {
    Home,
    Bookmark,
    Share2,
    RotateCw,
    Sun,
    Moon,
    LogIn,
    ArrowLeft,
    Book,
    FileJson,
    FileText,
    FileCode,
    GitBranch,
    Link2,
    QrCode,
    Hash,
    Link,
    Fingerprint,
    KeyRound,
    Pipette,
    Binary,
    ArrowLeftRight,
    Globe,
    Ruler,
    Monitor,
    Zap,
    Code2,
    Plug,
    ShieldCheck,
    Languages,
    Lock,
    Table2,
    Timer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TOOL_ICONS: Record<string, LucideIcon> = {
    '/json': FileJson,
    '/text': FileText,
    '/base64': FileCode,
    '/url-encode': Link,
    '/html-entity': FileCode,
    '/curl': Code2,
    '/number-base': Binary,
    '/css-unit': Ruler,
    '/color': Pipette,
    '/markdown': FileText,
    '/id': Fingerprint,
    '/hash': Hash,
    '/password-hash': Lock,
    '/rsa-key': KeyRound,
    '/password': KeyRound,
    '/qrcode': QrCode,
    '/git-branch-generator': GitBranch,
    '/api-builder': Zap,
    '/websocket': Plug,
    '/cors': ShieldCheck,
    '/cert-decoder': Fingerprint,
    '/user-agent': Monitor,
    '/nslookup': Globe,
    '/regex': Hash,
    '/http-status': Globe,
    '/mime-type': FileText,
    '/unicode': Languages,
    '/ascii-table': Table2,
    '/cron': Timer,
    '/unit': ArrowLeftRight,
    '/url-shortener': Link2,
};

interface CommandEntry {
    id: string;
    label: string;
    icon: LucideIcon;
    keywords?: string[];
    onSelect?: () => void;
    badge?: string;
}

interface CommandSection {
    heading: string;
    items: CommandEntry[];
}

const COMMAND_PRIMARY =
    '[&_[data-slot=command-item]]:border [&_[data-slot=command-item]]:border-border [&_[data-slot=command-item]]:data-selected:border-primary/30 [&_[data-slot=command-item]]:data-selected:bg-primary/10 [&_[data-slot=command-item]]:data-selected:text-primary [&_[data-slot=command-item]]:data-selected:*:[svg]:text-primary [&_[data-slot=command-group]]:**:[[cmdk-group-heading]]:text-primary/70';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { save, share } = useToolActionsContext();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const close = useCallback(() => setOpen(false), []);

    const navigate = useCallback(
        (url: string) => {
            setOpen(false);
            router.push(url);
        },
        [router],
    );

    const toolSections = useMemo(() => {
        const tools = navigationMenu.find((item) => item.title === 'Tools')?.items ?? [];
        const grouped = new Map<string, { url: string; title: string; description?: string }[]>();
        for (const tool of tools) {
            const cat = tool.category ?? 'Other';
            if (!grouped.has(cat)) grouped.set(cat, []);
            grouped
                .get(cat)!
                .push({ url: tool.url, title: tool.title, description: tool.description });
        }
        return Array.from(grouped.entries()).map(
            ([category, categoryTools]): CommandSection => ({
                heading: category,
                items: categoryTools.map((tool) => ({
                    id: tool.url,
                    label: tool.title,
                    icon: TOOL_ICONS[tool.url] ?? Link,
                    keywords: [tool.title, tool.description ?? '', category],
                    badge: pathname === tool.url ? 'Current' : undefined,
                    onSelect: () => navigate(tool.url),
                })),
            }),
        );
    }, [pathname, navigate]);

    const sections: CommandSection[] = useMemo(() => {
        const actions: CommandEntry[] = [];
        if (save)
            actions.push({
                id: 'save',
                label: 'Save',
                icon: Bookmark,
                onSelect: () => {
                    close();
                    save();
                },
            });
        if (share)
            actions.push({
                id: 'share',
                label: 'Share',
                icon: Share2,
                onSelect: () => {
                    close();
                    share();
                },
            });
        actions.push(
            {
                id: 'reload',
                label: 'Reload Page',
                icon: RotateCw,
                onSelect: () => {
                    close();
                    window.location.reload();
                },
            },
            {
                id: 'back',
                label: 'Go Back',
                icon: ArrowLeft,
                onSelect: () => {
                    close();
                    router.back();
                },
            },
            {
                id: 'theme',
                label: 'Toggle Theme',
                icon: theme === 'dark' ? Sun : Moon,
                onSelect: () => {
                    close();
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                },
            },
        );

        const nav: CommandEntry[] = [
            { id: 'home', label: 'Home', icon: Home, onSelect: () => navigate('/') },
            { id: 'docs', label: 'Documentation', icon: Book, onSelect: () => navigate('/docs') },
            {
                id: 'share-text',
                label: 'Share Text',
                icon: Share2,
                onSelect: () => navigate('/share/text'),
            },
            {
                id: 'login',
                label: 'Login',
                icon: LogIn,
                onSelect: () => navigate(authButtons.login.url),
            },
        ];

        return [
            { heading: 'Actions', items: actions },
            { heading: 'Navigation', items: nav },
            ...toolSections,
        ];
    }, [save, share, theme, setTheme, close, navigate, router, toolSections]);

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title="Command Palette"
            description="Search tools, actions, and pages..."
        >
            <Command className={COMMAND_PRIMARY}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {sections.map((section, i) => (
                        <span key={section.heading}>
                            {i > 0 && <CommandSeparator />}
                            <CommandGroup heading={section.heading}>
                                {section.items.map((item) => (
                                    <CommandItem
                                        className="mt-2"
                                        key={item.id}
                                        keywords={item.keywords}
                                        onSelect={item.onSelect}
                                    >
                                        <item.icon className="size-4" />
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="ml-auto text-xs text-primary/60">
                                                {item.badge}
                                            </span>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </span>
                    ))}
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
