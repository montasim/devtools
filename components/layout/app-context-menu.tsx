'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, ReactNode, useMemo } from 'react';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent,
    ContextMenuLabel,
} from '@/components/ui/context-menu';
import { navigationMenu } from '@/config/navigation';
import { useToolActionsContext } from '@/features/tools/core/context/tool-actions-context';
import { Bookmark, Share2, History, ArrowLeft, ArrowRight, RotateCw, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolEntry {
    title: string;
    url: string;
    icon?: ReactNode;
    category?: string;
}

interface MenuEntry {
    id: string;
    label: string;
    icon: LucideIcon;
    shortcut?: string;
    onClick: () => void;
    disabled?: boolean;
}

interface MenuSection {
    items: MenuEntry[];
}

const ITEM_CLS = 'focus:bg-primary/10 focus:text-primary [&_span]:focus:text-primary';
const ACTIVE_CLS = 'bg-primary/10 text-primary focus:bg-primary/15';
const SUB_TRIGGER_CLS =
    'focus:bg-primary/10 focus:text-primary data-open:bg-primary/10 data-open:text-primary';

export function AppContextMenu({ children }: { children: ReactNode }) {
    return (
        <Suspense>
            <AppContextMenuInner>{children}</AppContextMenuInner>
        </Suspense>
    );
}

function AppContextMenuInner({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { save, share } = useToolActionsContext();

    const isToolPage = useMemo(() => {
        const toolsItem = navigationMenu.find((item) => item.title === 'Tools');
        return toolsItem?.items?.some((t) => t.url === pathname) ?? false;
    }, [pathname]);

    const categories = useMemo(() => {
        const toolsItem = navigationMenu.find((item) => item.title === 'Tools');
        const tools = (toolsItem?.items ?? []) as ToolEntry[];
        const map = new Map<string, ToolEntry[]>();
        for (const tool of tools) {
            const cat = tool.category ?? 'Other';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(tool);
        }
        return map;
    }, []);

    const sections: MenuSection[] = useMemo(() => {
        const handleHistory = () => {
            if (isToolPage) {
                const params = new URLSearchParams(searchParams.toString());
                params.set('tab', 'history');
                router.push(`${pathname}?${params.toString()}`);
            } else {
                router.push('/share/text');
            }
        };

        return [
            {
                items: [
                    {
                        id: 'save',
                        label: 'Save',
                        icon: Bookmark,
                        shortcut: '⌘S',
                        onClick: save ?? (() => {}),
                        disabled: !save,
                    },
                    {
                        id: 'share',
                        label: 'Share',
                        icon: Share2,
                        shortcut: '⌘⇧S',
                        onClick: share ?? (() => {}),
                        disabled: !share,
                    },
                    { id: 'history', label: 'History', icon: History, onClick: handleHistory },
                ],
            },
            {
                items: [
                    {
                        id: 'back',
                        label: 'Back',
                        icon: ArrowLeft,
                        shortcut: '⌘←',
                        onClick: () => router.back(),
                    },
                    {
                        id: 'forward',
                        label: 'Forward',
                        icon: ArrowRight,
                        shortcut: '⌘→',
                        onClick: () => window.history.forward(),
                    },
                    {
                        id: 'reload',
                        label: 'Reload',
                        icon: RotateCw,
                        shortcut: '⌘R',
                        onClick: () => window.location.reload(),
                    },
                ],
            },
        ];
    }, [save, share, isToolPage, router, pathname, searchParams]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className="contents">{children}</div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                {sections.map((section, i) => (
                    <span key={i}>
                        {i > 0 && <ContextMenuSeparator />}
                        <ContextMenuGroup>
                            {section.items.map((item) => (
                                <ContextMenuItem
                                    key={item.id}
                                    onClick={item.onClick}
                                    disabled={item.disabled}
                                    className={ITEM_CLS}
                                >
                                    <item.icon className="size-4" />
                                    {item.label}
                                    {item.shortcut && (
                                        <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
                                    )}
                                </ContextMenuItem>
                            ))}
                        </ContextMenuGroup>
                    </span>
                ))}

                <ContextMenuSeparator />

                <ContextMenuGroup>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger className={SUB_TRIGGER_CLS}>
                            <Wrench className="size-4" />
                            Tools
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="max-h-[400px] overflow-y-auto w-64">
                            {Array.from(categories.entries()).map(([category, categoryTools]) => (
                                <ContextMenuGroup key={category}>
                                    <ContextMenuLabel className="text-xs font-semibold text-primary/80">
                                        {category}
                                    </ContextMenuLabel>
                                    {categoryTools.map((tool) => (
                                        <ContextMenuItem
                                            key={tool.url}
                                            onClick={() => router.push(tool.url)}
                                            className={
                                                pathname === tool.url ? ACTIVE_CLS : ITEM_CLS
                                            }
                                        >
                                            {tool.icon}
                                            {tool.title}
                                        </ContextMenuItem>
                                    ))}
                                    <ContextMenuSeparator />
                                </ContextMenuGroup>
                            ))}
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    );
}
